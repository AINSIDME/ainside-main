# DLL integration (best practice)

## What’s the best approach?

Best overall (security + usability):

1. **Server** issues a short-lived signed proof (`RS256`) via `license-check`.
2. **HWID tool** runs a localhost service (`http://127.0.0.1:8787/status`) that periodically calls `license-check`.
3. **DLL** (used by the strategy) only talks to localhost and **verifies the RS256 signature** using `license-public.pem`.
4. Strategy gets a simple boolean: `ON/OFF`.

This prevents spoofing (a fake local service) because the DLL rejects invalid signatures.

## TradeStation 32-bit note (Build 1255)

Your screenshot shows TradeStation is **32-bit**. Important implications:

- The C# NativeAOT example (`dll/AInsideLicenseBridge`) is **x64-only** (NativeAOT does not support `win-x86`).
- For TradeStation **32-bit**, use the native C++ Win32 bridge:
  - `dll/AInsideLicenseBridgeCpp`

## Runtime flow

- User runs the tool in service mode:
  - `python scripts/HWID.py --service`
- Strategy/DLL calls every N seconds:
  - `AInside_IsAllowed()` → returns `1` (allowed) or `0` (blocked)

## Files / endpoints

- Local service:
  - `GET http://127.0.0.1:8787/status`
- Public key:
  - `license-public.pem` (must be next to the compiled DLL)

For 32-bit, the C++ DLL can also use an explicit env var:
- `AINSIDE_LICENSE_PUBLIC_KEY_PATH`

## Build the example DLL (Windows)

Prereq: install .NET SDK 8.

### Determine if your TradeStation is 32-bit or 64-bit

TradeStation must load a DLL that matches its own bitness.

- Quick check (recommended): open **Task Manager** → **Details** tab → right-click a column header → **Select columns** → enable **Platform**. Then run TradeStation and look for `ORTrade.exe`:
  - `32-bit` → build `win-x86`
  - `64-bit` → build `win-x64`

- Alternative check: installation folder
  - `C:\Program Files (x86)\...` usually means 32-bit
  - `C:\Program Files\...` usually means 64-bit

From `ainside-main/`:

- x64 build:
  - `dotnet publish dll/AInsideLicenseBridge -c Release -r win-x64`

- x86 build:
  - Use the C++ project: `dll/AInsideLicenseBridgeCpp` (Release|Win32)

Output:
- `dll/AInsideLicenseBridge/bin/Release/net8.0/win-x64/publish/AInsideLicenseBridge.dll`

Copy next to it:
- `license-public.pem`

## Exported functions

- `int AInside_IsAllowed()`
  - `1` = OK
  - `0` = Blocked

- `int AInside_GetLastError(byte* buffer, int bufferLen)`
  - Optional debug string (e.g., `expired`, `bad_signature`, `not_activated`)

## Notes

- The DLL verifies the signature against `payloadJson` (exact bytes signed by the server). This is critical; verifying against a re-serialized object is unreliable.
- If localhost service is down, the DLL fails closed (returns `0`).
