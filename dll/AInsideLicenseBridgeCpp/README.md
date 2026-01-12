# AInsideLicenseBridgeCpp (TradeStation 32-bit)

This is the **recommended** bridge for TradeStation **32-bit**.

It:
- Calls `http://127.0.0.1:8787/status`
- Verifies the server RS256 signature using Windows crypto APIs
- Returns `1` (allowed) / `0` (blocked)

## Build (Visual Studio)

- Open the `.vcxproj` in Visual Studio 2022
- Select configuration: `Release` + `Win32`
- Build

Dependencies are only Windows system libs: `winhttp`, `crypt32`, `bcrypt`.

## Runtime requirements

- Run local service:
  - `python scripts/HWID.py --service`
- Ensure `license-public.pem` is accessible:
  - best: set env var `AINSIDE_LICENSE_PUBLIC_KEY_PATH` pointing to the file
  - fallback: put `license-public.pem` in TradeStation folder (same dir as `ORTrade.exe`) or current working directory

## Exported functions

- `int __stdcall AInside_IsAllowed()`
- `int __stdcall AInside_GetLastError(char* buffer, int bufferLen)`
