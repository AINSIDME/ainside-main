@echo off
REM Launch Vite dev server for ainside-main
SETLOCAL
set PROJECT_PATH=c:\Users\jonat\Downloads\ainside-main\ainside-main

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

echo Launching Vite (npm run dev)...
npm run dev
ENDLOCAL
