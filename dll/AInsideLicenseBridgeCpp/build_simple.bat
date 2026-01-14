@echo off
echo Building AInsideLicenseBridgeCpp.dll (Win32)...

set VCVARSALL="C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat"
if not exist %VCVARSALL% set VCVARSALL="C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools\VC\Auxiliary\Build\vcvarsall.bat"

call %VCVARSALL% x86

cl.exe /LD /O2 /MD /EHsc bridge_simple.cpp winhttp.lib /FeAInsideLicenseBridgeCpp.dll

if exist AInsideLicenseBridgeCpp.dll (
    echo.
    echo [SUCCESS] DLL compiled successfully
    echo Location: %CD%\AInsideLicenseBridgeCpp.dll
    if not exist Release mkdir Release
    copy /Y AInsideLicenseBridgeCpp.dll Release\
    echo Copied to: Release\AInsideLicenseBridgeCpp.dll
) else (
    echo.
    echo [ERROR] Compilation failed
    exit /b 1
)
