#include <windows.h>
#include <winhttp.h>
#include <wincrypt.h>
#include <bcrypt.h>

#include <algorithm>
#include <string>
#include <vector>

#pragma comment(lib, "winhttp.lib")
#pragma comment(lib, "crypt32.lib")
#pragma comment(lib, "bcrypt.lib")

static std::wstring g_lastError;

static void set_err(const wchar_t* msg) {
  g_lastError = msg ? msg : L"";
}

static int write_utf8(char* buffer, int bufferLen, const std::wstring& msg) {
  if (!buffer || bufferLen <= 0) return 0;
  int needed = WideCharToMultiByte(CP_UTF8, 0, msg.c_str(), (int)msg.size(), nullptr, 0, nullptr, nullptr);
  if (needed <= 0) {
    buffer[0] = 0;
    return 0;
  }
  int n = (needed < (bufferLen - 1)) ? needed : (bufferLen - 1);
  WideCharToMultiByte(CP_UTF8, 0, msg.c_str(), (int)msg.size(), buffer, n, nullptr, nullptr);
  buffer[n] = 0;
  return n;
}

static bool http_get_local_status(std::string& outJson) {
  outJson.clear();

  HINTERNET hSession = WinHttpOpen(L"AInsideLicenseBridge/1.0", WINHTTP_ACCESS_TYPE_NO_PROXY, WINHTTP_NO_PROXY_NAME, WINHTTP_NO_PROXY_BYPASS, 0);
  if (!hSession) { set_err(L"winhttp_open"); return false; }

  HINTERNET hConnect = WinHttpConnect(hSession, L"127.0.0.1", 8787, 0);
  if (!hConnect) { WinHttpCloseHandle(hSession); set_err(L"winhttp_connect"); return false; }

  HINTERNET hRequest = WinHttpOpenRequest(hConnect, L"GET", L"/status", nullptr, WINHTTP_NO_REFERER, WINHTTP_DEFAULT_ACCEPT_TYPES, 0);
  if (!hRequest) {
    WinHttpCloseHandle(hConnect);
    WinHttpCloseHandle(hSession);
    set_err(L"winhttp_open_request");
    return false;
  }

  DWORD timeoutMs = 2500;
  WinHttpSetTimeouts(hRequest, timeoutMs, timeoutMs, timeoutMs, timeoutMs);

  BOOL bResults = WinHttpSendRequest(hRequest, WINHTTP_NO_ADDITIONAL_HEADERS, 0, WINHTTP_NO_REQUEST_DATA, 0, 0, 0);
  if (!bResults) {
    WinHttpCloseHandle(hRequest);
    WinHttpCloseHandle(hConnect);
    WinHttpCloseHandle(hSession);
    set_err(L"winhttp_send");
    return false;
  }

  bResults = WinHttpReceiveResponse(hRequest, nullptr);
  if (!bResults) {
    WinHttpCloseHandle(hRequest);
    WinHttpCloseHandle(hConnect);
    WinHttpCloseHandle(hSession);
    set_err(L"winhttp_recv");
    return false;
  }

  DWORD statusCode = 0;
  DWORD statusCodeSize = sizeof(statusCode);
  WinHttpQueryHeaders(hRequest, WINHTTP_QUERY_STATUS_CODE | WINHTTP_QUERY_FLAG_NUMBER, WINHTTP_HEADER_NAME_BY_INDEX, &statusCode, &statusCodeSize, WINHTTP_NO_HEADER_INDEX);
  if (statusCode != 200) {
    WinHttpCloseHandle(hRequest);
    WinHttpCloseHandle(hConnect);
    WinHttpCloseHandle(hSession);
    set_err(L"http_not_200");
    return false;
  }

  std::string buffer;
  for (;;) {
    DWORD dwSize = 0;
    if (!WinHttpQueryDataAvailable(hRequest, &dwSize)) break;
    if (dwSize == 0) break;

    std::vector<char> tmp(dwSize);
    DWORD dwRead = 0;
    if (!WinHttpReadData(hRequest, tmp.data(), dwSize, &dwRead)) break;
    if (dwRead == 0) break;
    buffer.append(tmp.data(), tmp.data() + dwRead);
  }

  WinHttpCloseHandle(hRequest);
  WinHttpCloseHandle(hConnect);
  WinHttpCloseHandle(hSession);

  outJson = buffer;
  return !outJson.empty();
}

static bool find_json_string_field(const std::string& json, const char* fieldName, std::string& outValue) {
  // Minimal extractor safe for base64url fields (no escaping expected): "fieldName":"VALUE"
  outValue.clear();
  std::string key = std::string("\"") + fieldName + "\"";
  size_t pos = json.find(key);
  if (pos == std::string::npos) return false;
  pos = json.find(':', pos + key.size());
  if (pos == std::string::npos) return false;
  pos = json.find('"', pos);
  if (pos == std::string::npos) return false;
  size_t start = pos + 1;
  size_t end = json.find('"', start);
  if (end == std::string::npos) return false;
  outValue = json.substr(start, end - start);
  return true;
}

static bool find_payload_allowed_and_exp(const std::string& payloadJson, bool& allowed, long long& expMs) {
  allowed = false;
  expMs = 0;

  // allowed
  auto p = payloadJson.find("\"allowed\":");
  if (p == std::string::npos) return false;
  p += strlen("\"allowed\":");
  if (payloadJson.compare(p, 4, "true") == 0) allowed = true;
  else if (payloadJson.compare(p, 5, "false") == 0) allowed = false;
  else return false;

  // exp
  auto e = payloadJson.find("\"exp\":");
  if (e == std::string::npos) return false;
  e += strlen("\"exp\":");
  // read integer
  size_t i = e;
  while (i < payloadJson.size() && (payloadJson[i] >= '0' && payloadJson[i] <= '9')) i++;
  if (i == e) return false;
  expMs = _strtoi64(payloadJson.substr(e, i - e).c_str(), nullptr, 10);
  return true;
}

static bool base64url_decode(const std::string& in, std::vector<unsigned char>& out) {
  out.clear();
  std::string s = in;
  for (auto& c : s) {
    if (c == '-') c = '+';
    else if (c == '_') c = '/';
  }
  while (s.size() % 4 != 0) s.push_back('=');

  DWORD needed = 0;
  if (!CryptStringToBinaryA(s.c_str(), (DWORD)s.size(), CRYPT_STRING_BASE64, nullptr, &needed, nullptr, nullptr)) {
    return false;
  }
  out.resize(needed);
  if (!CryptStringToBinaryA(s.c_str(), (DWORD)s.size(), CRYPT_STRING_BASE64, out.data(), &needed, nullptr, nullptr)) {
    return false;
  }
  out.resize(needed);
  return true;
}

static bool load_public_key(BCRYPT_KEY_HANDLE& outKey) {
  outKey = nullptr;

  // Search paths: env override, CWD, EXE dir
  wchar_t pathBuf[MAX_PATH];
  DWORD n = GetEnvironmentVariableW(L"AINSIDE_LICENSE_PUBLIC_KEY_PATH", pathBuf, MAX_PATH);
  std::wstring path;
  if (n > 0 && n < MAX_PATH) {
    path = pathBuf;
  } else {
    wchar_t cwd[MAX_PATH];
    if (GetCurrentDirectoryW(MAX_PATH, cwd) > 0) {
      path = std::wstring(cwd) + L"\\license-public.pem";
    }
  }

  auto try_read = [](const std::wstring& p, std::string& outText) -> bool {
    FILE* f = nullptr;
    _wfopen_s(&f, p.c_str(), L"rb");
    if (!f) return false;
    fseek(f, 0, SEEK_END);
    long len = ftell(f);
    fseek(f, 0, SEEK_SET);
    if (len <= 0) { fclose(f); return false; }
    outText.resize((size_t)len);
    fread(&outText[0], 1, (size_t)len, f);
    fclose(f);
    return true;
  };

  std::string pem;
  if (!path.empty() && try_read(path, pem)) {
    // ok
  } else {
    // exe dir fallback
    wchar_t exePath[MAX_PATH];
    if (GetModuleFileNameW(nullptr, exePath, MAX_PATH) > 0) {
      std::wstring exe = exePath;
      size_t slash = exe.find_last_of(L"\\/");
      std::wstring dir = (slash == std::wstring::npos) ? L"." : exe.substr(0, slash);
      std::wstring p2 = dir + L"\\license-public.pem";
      if (!try_read(p2, pem)) {
        set_err(L"missing_public_key");
        return false;
      }
    } else {
      set_err(L"missing_public_key");
      return false;
    }
  }

  // Extract base64 between PEM markers (assume BEGIN PUBLIC KEY)
  const char* begin = "-----BEGIN PUBLIC KEY-----";
  const char* end = "-----END PUBLIC KEY-----";
  auto bpos = pem.find(begin);
  auto epos = pem.find(end);
  if (bpos == std::string::npos || epos == std::string::npos || epos <= bpos) {
    set_err(L"bad_pem");
    return false;
  }
  bpos += strlen(begin);
  std::string b64 = pem.substr(bpos, epos - bpos);
  // remove whitespace
  b64.erase(std::remove_if(b64.begin(), b64.end(), [](unsigned char ch) { return ch == '\r' || ch == '\n' || ch == ' ' || ch == '\t'; }), b64.end());

  std::vector<unsigned char> der;
  DWORD derLen = 0;
  if (!CryptStringToBinaryA(b64.c_str(), (DWORD)b64.size(), CRYPT_STRING_BASE64, nullptr, &derLen, nullptr, nullptr)) {
    set_err(L"pem_b64_decode");
    return false;
  }
  der.resize(derLen);
  if (!CryptStringToBinaryA(b64.c_str(), (DWORD)b64.size(), CRYPT_STRING_BASE64, der.data(), &derLen, nullptr, nullptr)) {
    set_err(L"pem_b64_decode");
    return false;
  }
  der.resize(derLen);

  // Decode SubjectPublicKeyInfo
  CERT_PUBLIC_KEY_INFO* pInfo = nullptr;
  DWORD infoLen = 0;
  if (!CryptDecodeObjectEx(X509_ASN_ENCODING, X509_PUBLIC_KEY_INFO, der.data(), (DWORD)der.size(), CRYPT_DECODE_ALLOC_FLAG, nullptr, &pInfo, &infoLen)) {
    set_err(L"decode_spki");
    return false;
  }

  BCRYPT_KEY_HANDLE hKey = nullptr;
  if (!CryptImportPublicKeyInfoEx2(X509_ASN_ENCODING, pInfo, 0, nullptr, &hKey)) {
    LocalFree(pInfo);
    set_err(L"import_pubkey");
    return false;
  }
  LocalFree(pInfo);

  outKey = hKey;
  return true;
}

static bool sha256(const std::vector<unsigned char>& data, std::vector<unsigned char>& outHash) {
  outHash.clear();

  BCRYPT_ALG_HANDLE hAlg = nullptr;
  if (BCryptOpenAlgorithmProvider(&hAlg, BCRYPT_SHA256_ALGORITHM, nullptr, 0) != 0) {
    return false;
  }

  DWORD objLen = 0, cbData = 0;
  if (BCryptGetProperty(hAlg, BCRYPT_OBJECT_LENGTH, (PUCHAR)&objLen, sizeof(objLen), &cbData, 0) != 0) {
    BCryptCloseAlgorithmProvider(hAlg, 0);
    return false;
  }

  std::vector<unsigned char> obj(objLen);
  BCRYPT_HASH_HANDLE hHash = nullptr;
  if (BCryptCreateHash(hAlg, &hHash, obj.data(), objLen, nullptr, 0, 0) != 0) {
    BCryptCloseAlgorithmProvider(hAlg, 0);
    return false;
  }

  if (BCryptHashData(hHash, (PUCHAR)data.data(), (ULONG)data.size(), 0) != 0) {
    BCryptDestroyHash(hHash);
    BCryptCloseAlgorithmProvider(hAlg, 0);
    return false;
  }

  DWORD hashLen = 0;
  if (BCryptGetProperty(hAlg, BCRYPT_HASH_LENGTH, (PUCHAR)&hashLen, sizeof(hashLen), &cbData, 0) != 0) {
    BCryptDestroyHash(hHash);
    BCryptCloseAlgorithmProvider(hAlg, 0);
    return false;
  }

  outHash.resize(hashLen);
  if (BCryptFinishHash(hHash, outHash.data(), hashLen, 0) != 0) {
    BCryptDestroyHash(hHash);
    BCryptCloseAlgorithmProvider(hAlg, 0);
    return false;
  }

  BCryptDestroyHash(hHash);
  BCryptCloseAlgorithmProvider(hAlg, 0);
  return true;
}

static bool verify_rs256(const std::vector<unsigned char>& payloadBytes, const std::vector<unsigned char>& sigBytes) {
  BCRYPT_KEY_HANDLE hKey = nullptr;
  if (!load_public_key(hKey)) {
    // load_public_key sets g_lastError
    return false;
  }

  std::vector<unsigned char> hash;
  if (!sha256(payloadBytes, hash)) {
    BCryptDestroyKey(hKey);
    set_err(L"sha256");
    return false;
  }

  BCRYPT_PKCS1_PADDING_INFO padInfo;
  padInfo.pszAlgId = BCRYPT_SHA256_ALGORITHM;

  NTSTATUS st = BCryptVerifySignature(
    hKey,
    &padInfo,
    hash.data(),
    (ULONG)hash.size(),
    (PUCHAR)sigBytes.data(),
    (ULONG)sigBytes.size(),
    BCRYPT_PAD_PKCS1);

  BCryptDestroyKey(hKey);

  if (st != 0) {
    set_err(L"bad_signature");
    return false;
  }

  return true;
}

extern "C" __declspec(dllexport) int __cdecl AInside_IsAllowed() {
  try {
    std::string statusJson;
    if (!http_get_local_status(statusJson)) {
      if (g_lastError.empty()) set_err(L"local_service_down");
      return 0;
    }

    std::string alg;
    if (!find_json_string_field(statusJson, "alg", alg) || alg != "RS256") {
      set_err(L"bad_alg");
      return 0;
    }

    std::string payloadB64u;
    std::string sigB64u;
    if (!find_json_string_field(statusJson, "payloadJsonB64u", payloadB64u) || payloadB64u.empty()) {
      set_err(L"missing_payload" );
      return 0;
    }
    if (!find_json_string_field(statusJson, "signature", sigB64u) || sigB64u.empty()) {
      set_err(L"missing_signature");
      return 0;
    }

    std::vector<unsigned char> payloadBytes;
    std::vector<unsigned char> sigBytes;
    if (!base64url_decode(payloadB64u, payloadBytes)) { set_err(L"payload_b64u_decode"); return 0; }
    if (!base64url_decode(sigB64u, sigBytes)) { set_err(L"sig_b64u_decode"); return 0; }

    if (!verify_rs256(payloadBytes, sigBytes)) {
      // error already set
      return 0;
    }

    // Parse payload JSON (now trusted) to enforce allowed + expiry
    std::string payloadJson((char*)payloadBytes.data(), (char*)payloadBytes.data() + payloadBytes.size());
    bool allowed = false;
    long long expMs = 0;
    if (!find_payload_allowed_and_exp(payloadJson, allowed, expMs)) {
      set_err(L"bad_payload");
      return 0;
    }

    // Expiry check (milliseconds since epoch)
    FILETIME ft;
    GetSystemTimeAsFileTime(&ft);
    ULARGE_INTEGER uli;
    uli.LowPart = ft.dwLowDateTime;
    uli.HighPart = ft.dwHighDateTime;
    // FILETIME is 100-ns since 1601-01-01. Convert to ms since Unix epoch.
    const ULONGLONG EPOCH_DIFF_100NS = 116444736000000000ULL;
    ULONGLONG now100ns = uli.QuadPart;
    ULONGLONG nowMs = (now100ns - EPOCH_DIFF_100NS) / 10000ULL;

    if (expMs <= (long long)nowMs) {
      set_err(L"expired");
      return 0;
    }

    set_err(L"");
    return allowed ? 1 : 0;
  } catch (...) {
    set_err(L"exception");
    return 0;
  }
}

extern "C" __declspec(dllexport) int __cdecl AInside_GetLastError(char* buffer, int bufferLen) {
  return write_utf8(buffer, bufferLen, g_lastError);
}
