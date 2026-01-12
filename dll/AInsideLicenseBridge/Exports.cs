using System.Net.Http;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

public static class Exports
{
    private static readonly HttpClient Http = new(new SocketsHttpHandler
    {
        PooledConnectionLifetime = TimeSpan.FromMinutes(2),
        ConnectTimeout = TimeSpan.FromSeconds(2),
    })
    {
        Timeout = TimeSpan.FromSeconds(3),
    };

    private static volatile string _lastError = "";

    [UnmanagedCallersOnly(EntryPoint = "AInside_IsAllowed")]
    public static int IsAllowed()
    {
        try
        {
            var statusJson = Http.GetStringAsync("http://127.0.0.1:8787/status").GetAwaiter().GetResult();

            using var doc = JsonDocument.Parse(statusJson);
            var root = doc.RootElement;

            if (!root.TryGetProperty("license", out var license))
            {
                _lastError = "missing_license";
                return 0;
            }

            var alg = license.TryGetProperty("alg", out var algEl) ? algEl.GetString() : null;
            if (!string.Equals(alg, "RS256", StringComparison.Ordinal))
            {
                _lastError = "bad_alg";
                return 0;
            }

            var payloadJson = license.TryGetProperty("payloadJson", out var payloadJsonEl) ? payloadJsonEl.GetString() : null;
            var signature = license.TryGetProperty("signature", out var sigEl) ? sigEl.GetString() : null;

            if (string.IsNullOrWhiteSpace(payloadJson) || string.IsNullOrWhiteSpace(signature))
            {
                _lastError = "missing_payload_or_sig";
                return 0;
            }

            if (!VerifySignature(payloadJson, signature))
            {
                _lastError = "bad_signature";
                return 0;
            }

            using var payloadDoc = JsonDocument.Parse(payloadJson);
            var payload = payloadDoc.RootElement;

            var allowed = payload.TryGetProperty("allowed", out var allowedEl) && allowedEl.ValueKind == JsonValueKind.True;
            if (!allowed)
            {
                _lastError = payload.TryGetProperty("reason", out var reasonEl) ? (reasonEl.GetString() ?? "not_allowed") : "not_allowed";
                return 0;
            }

            var now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            if (payload.TryGetProperty("exp", out var expEl) && expEl.TryGetInt64(out var expMs))
            {
                if (expMs < now)
                {
                    _lastError = "expired";
                    return 0;
                }
            }
            else
            {
                _lastError = "missing_exp";
                return 0;
            }

            _lastError = "";
            return 1;
        }
        catch (Exception ex)
        {
            _lastError = "error:" + ex.GetType().Name;
            return 0;
        }
    }

    [UnmanagedCallersOnly(EntryPoint = "AInside_GetLastError")]
    public static unsafe int GetLastError(byte* buffer, int bufferLen)
    {
        try
        {
            if (buffer == null || bufferLen <= 0)
            {
                return 0;
            }

            var msg = _lastError ?? "";
            var bytes = Encoding.UTF8.GetBytes(msg);
            var n = Math.Min(bytes.Length, bufferLen - 1);
            for (var i = 0; i < n; i++)
            {
                buffer[i] = bytes[i];
            }
            buffer[n] = 0;
            return n;
        }
        catch
        {
            return 0;
        }
    }

    private static bool VerifySignature(string payloadJson, string signatureB64Url)
    {
        var publicPem = TryLoadPublicKeyPem();
        if (string.IsNullOrWhiteSpace(publicPem))
        {
            _lastError = "missing_public_key";
            return false;
        }

        using var rsa = RSA.Create();
        rsa.ImportFromPem(publicPem);

        var sig = Base64UrlDecode(signatureB64Url);
        var data = Encoding.UTF8.GetBytes(payloadJson);

        return rsa.VerifyData(data, sig, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);
    }

    private static string? TryLoadPublicKeyPem()
    {
        try
        {
            // 1) Explicit override (best for support/diagnostics)
            var overridePath = Environment.GetEnvironmentVariable("AINSIDE_LICENSE_PUBLIC_KEY_PATH");
            if (!string.IsNullOrWhiteSpace(overridePath) && File.Exists(overridePath))
            {
                return File.ReadAllText(overridePath);
            }

            // 2) Current working directory (often where TS runs from)
            var cwdPath = Path.Combine(Environment.CurrentDirectory, "license-public.pem");
            if (File.Exists(cwdPath))
            {
                return File.ReadAllText(cwdPath);
            }

            // 3) Process base directory (typical for a native DLL loaded into ORTrade.exe)
            var basePath = Path.Combine(AppContext.BaseDirectory, "license-public.pem");
            if (File.Exists(basePath))
            {
                return File.ReadAllText(basePath);
            }

            return null;
        }
        catch
        {
            return null;
        }
    }

    private static byte[] Base64UrlDecode(string input)
    {
        var s = input.Replace('-', '+').Replace('_', '/');
        switch (s.Length % 4)
        {
            case 2: s += "=="; break;
            case 3: s += "="; break;
        }
        return Convert.FromBase64String(s);
    }
}
