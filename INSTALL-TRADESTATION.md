# TradeStation Installation Guide - AInside License System

Complete setup for per-PC licensing with continuous validation.

---

## Prerequisites

- TradeStation 10 (32-bit) installed
- Visual Studio 2022 (Community Edition is free) with C++ Desktop Development workload
- Python 3.8+ installed
- Active AInside license purchased (you'll have an Order ID and HWID)

---

## Step 1: Build the 32-bit License DLL

1. Open Visual Studio 2022
2. Open project: `dll/AInsideLicenseBridgeCpp/AInsideLicenseBridgeCpp.vcxproj`
3. Select configuration: **Release | Win32**
4. Build → Build Solution (Ctrl+Shift+B)
5. Compiled DLL location:
   - `dll/AInsideLicenseBridgeCpp/Release/AInsideLicenseBridgeCpp.dll`

---

## Step 2: Install DLL and Public Key

1. Locate your TradeStation program folder:
   - Default: `C:\Program Files (x86)\TradeStation 10.0\Program\`
   - (The folder containing `ORTrade.exe`)

2. Copy these two files there:
   - `dll/AInsideLicenseBridgeCpp/Release/AInsideLicenseBridgeCpp.dll`
   - `license-public.pem` (from root of ainside-main repo)

**Alternative:** Set environment variable (recommended for multi-user or network drive setups):
```powershell
[System.Environment]::SetEnvironmentVariable("AINSIDE_LICENSE_PUBLIC_KEY_PATH", "C:\path\to\license-public.pem", "User")
```

---

## Step 3: Activate Your License

1. Run the HWID tool to get your Hardware ID:
   ```powershell
   python scripts/HWID.py
   ```

2. Activate online (one-time):
   ```powershell
   python scripts/HWID.py --activate
   ```
   - Enter your Order ID (from purchase email)
   - Enter your email (from purchase)
   - This stores your device secret locally (~/.ainside_tool/auth.json)

---

## Step 4: Start the Local License Service

**CRITICAL:** This must run while trading.

```powershell
python scripts/HWID.py --service
```

You should see:
```
[AInside] Local License Service running at http://127.0.0.1:8787 (/status, /health)
```

**Production tip:** Create a Windows scheduled task to auto-start this service on login:
```powershell
# Save this as start-license-service.bat in your startup folder:
@echo off
cd /d C:\path\to\ainside-main\ainside-main
python scripts\HWID.py --service
```

---

## Step 5: Import Functions into TradeStation

1. Open TradeStation Desktop
2. Open **EasyLanguage Editor**
3. File → New → Function
4. Copy/paste content from `tradestation/AInsideLicenseGuard.txt`
5. Save as **"AInsideLicenseGuard"**
6. Verify (Analysis → Verify EasyLanguage)

---

## Step 6: Protect Your Strategy

### Option A: Use the example strategy
1. File → New → Strategy
2. Copy/paste from `tradestation/ExampleStrategy.txt`
3. Customize the trading logic section
4. Apply to chart

### Option B: Add to existing strategy
Add this code at the **top** of your strategy (after Inputs/Vars):

```easylanguage
Vars:
	LicenseOK(0),
	BarsSinceCheck(0);

{ Check license every 10 bars }
BarsSinceCheck = BarsSinceCheck + 1;
if BarsSinceCheck >= 10 then begin
	LicenseOK = AInsideLicenseGuard(0);  // 0 = silent, 1 = debug mode
	BarsSinceCheck = 0;
end;

{ Block trading if license invalid }
if LicenseOK = 0 then begin
	if MarketPosition <> 0 then begin
		if MarketPosition = 1 then
			Sell("Lic_Exit") this bar close
		else
			BuyToCover("Lic_Exit") this bar close;
	end;
	Value1 = 0;
end
else begin
	{ YOUR EXISTING STRATEGY CODE HERE }
end;
```

---

## Step 7: Test

1. Ensure local service is running (`python scripts/HWID.py --service`)
2. Apply strategy to a chart
3. Enable Strategy Automation
4. Check Strategy Log for "License: Active"

**Test blocking (optional):**
- Stop the local service
- Strategy should print "License: BLOCKED" and close positions

---

## Troubleshooting

### "Could not load DLL"
- Verify DLL is in TradeStation Program folder
- Ensure DLL is 32-bit (not 64-bit)
- Check DLL name matches exactly: `AInsideLicenseBridgeCpp.dll`

### "missing_public_key"
- Ensure `license-public.pem` is in same folder as DLL
- Or set `AINSIDE_LICENSE_PUBLIC_KEY_PATH` environment variable

### "local_service_down"
- Start the service: `python scripts/HWID.py --service`
- Check service is listening: open browser → `http://127.0.0.1:8787/health`

### "bad_signature" or "expired"
- Service may have stale proof
- Restart service: stop and run `python scripts/HWID.py --service` again

### "not_activated"
- Run activation: `python scripts/HWID.py --activate`
- Enter correct Order ID and email from purchase

---

## Security Notes

- The DLL verifies the server's RS256 signature using `license-public.pem`
- Proof tokens expire every 60 seconds and are automatically refreshed
- If HWID changes (new motherboard/CPU), contact support for transfer
- Admin can transfer HWID via web dashboard `/admin` → "Transferir HWID"

---

## Support

- Dashboard: https://ainside.me/dashboard
- Admin (support only): https://ainside.me/admin
- Technical issues: use contact form at https://ainside.me
