@echo off
REM Build and preview production build for ainside-main
SETLOCAL
set PROJECT_PATH=%~dp0

REM Remove trailing backslash
if "%PROJECT_PATH:~-1%"=="\" set PROJECT_PATH=%PROJECT_PATH:~0,-1%

IF NOT EXIST "%PROJECT_PATH%" (
  echo Project path not found: %PROJECT_PATH%
  exit /b 1
)

cd /d "%PROJECT_PATH%"

where npm >nul 2>nul
IF ERRORLEVEL 1 (
  echo npm not found. Please install Node.js from https://nodejs.org/
  exit /b 1
)

IF NOT EXIST "%PROJECT_PATH%\node_modules" (
  echo Installing dependencies (npm install)...
  npm install
  IF ERRORLEVEL 1 (
    echo npm install failed
    exit /b 1
  )
)

echo Building (npm run build)...
npm run build
IF ERRORLEVEL 1 (
  echo Build failed
  exit /b 1
)

echo Starting preview server (npm run preview)...
npm run preview
ENDLOCAL
