#include <windows.h>
#include <winhttp.h>

#pragma comment(lib, "winhttp.lib")

static char g_lastError[256] = "";

static void set_err(const char* msg) {
    if (msg) {
        strncpy_s(g_lastError, sizeof(g_lastError), msg, _TRUNCATE);
    } else {
        g_lastError[0] = '\0';
    }
}

static BOOL http_get_status(char* outJson, int maxLen) {
    HINTERNET hSession = WinHttpOpen(L"AInsideBridge/1.0", 
        WINHTTP_ACCESS_TYPE_NO_PROXY, NULL, NULL, 0);
    if (!hSession) {
        set_err("winhttp_open");
        return FALSE;
    }

    HINTERNET hConnect = WinHttpConnect(hSession, L"127.0.0.1", 8787, 0);
    if (!hConnect) {
        WinHttpCloseHandle(hSession);
        set_err("winhttp_connect");
        return FALSE;
    }

    HINTERNET hRequest = WinHttpOpenRequest(hConnect, L"GET", L"/status",
        NULL, WINHTTP_NO_REFERER, WINHTTP_DEFAULT_ACCEPT_TYPES, 0);
    if (!hRequest) {
        WinHttpCloseHandle(hConnect);
        WinHttpCloseHandle(hSession);
        set_err("winhttp_request");
        return FALSE;
    }

    DWORD timeout = 2000;
    WinHttpSetTimeouts(hRequest, timeout, timeout, timeout, timeout);

    if (!WinHttpSendRequest(hRequest, NULL, 0, NULL, 0, 0, 0) ||
        !WinHttpReceiveResponse(hRequest, NULL)) {
        WinHttpCloseHandle(hRequest);
        WinHttpCloseHandle(hConnect);
        WinHttpCloseHandle(hSession);
        set_err("winhttp_send_recv");
        return FALSE;
    }

    DWORD statusCode = 0, statusSize = sizeof(statusCode);
    WinHttpQueryHeaders(hRequest, 
        WINHTTP_QUERY_STATUS_CODE | WINHTTP_QUERY_FLAG_NUMBER,
        NULL, &statusCode, &statusSize, NULL);

    if (statusCode != 200) {
        WinHttpCloseHandle(hRequest);
        WinHttpCloseHandle(hConnect);
        WinHttpCloseHandle(hSession);
        set_err("http_not_200");
        return FALSE;
    }

    int totalRead = 0;
    for (;;) {
        DWORD available = 0;
        if (!WinHttpQueryDataAvailable(hRequest, &available) || available == 0)
            break;
        
        if (totalRead + available >= maxLen - 1)
            break;

        DWORD read = 0;
        if (!WinHttpReadData(hRequest, outJson + totalRead, available, &read))
            break;
        
        totalRead += read;
        if (read == 0) break;
    }

    outJson[totalRead] = '\0';

    WinHttpCloseHandle(hRequest);
    WinHttpCloseHandle(hConnect);
    WinHttpCloseHandle(hSession);

    return totalRead > 0;
}

static BOOL find_allowed_in_json(const char* json) {
    // Simple parser: look for "allowed":true or "allowed":false
    const char* p = strstr(json, "\"allowed\"");
    if (!p) return FALSE;
    
    p = strchr(p, ':');
    if (!p) return FALSE;
    
    // Skip whitespace
    p++;
    while (*p == ' ' || *p == '\t') p++;
    
    return (strncmp(p, "true", 4) == 0);
}

extern "C" __declspec(dllexport) int __cdecl AInside_IsAllowed() {
    char statusJson[4096];
    
    if (!http_get_status(statusJson, sizeof(statusJson))) {
        if (strlen(g_lastError) == 0) {
            set_err("service_down");
        }
        return 0;
    }

    if (!find_allowed_in_json(statusJson)) {
        set_err("not_allowed");
        return 0;
    }

    set_err("");
    return 1;
}

extern "C" __declspec(dllexport) int __cdecl AInside_GetLastError(char* buffer, int bufferLen) {
    if (!buffer || bufferLen <= 0) return 0;
    
    int len = (int)strlen(g_lastError);
    int copyLen = (len < bufferLen - 1) ? len : (bufferLen - 1);
    
    memcpy(buffer, g_lastError, copyLen);
    buffer[copyLen] = '\0';
    
    return copyLen;
}
