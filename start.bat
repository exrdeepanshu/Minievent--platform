@echo off
title EventHub – Setup and Launch

echo.
echo ============================================
echo   EventHub MERN Platform – Auto Setup
echo ============================================
echo.

:: ── Step 1: Copy .env files ──────────────────
echo [1/4] Setting up environment files...

if not exist "server\.env" (
    copy "server\.env.example" "server\.env" >nul
    echo   Created server\.env from example
) else (
    echo   server\.env already exists, skipping
)

if not exist "client\.env" (
    copy "client\.env.example" "client\.env" >nul
    echo   Created client\.env from example
) else (
    echo   client\.env already exists, skipping
)

echo.
echo [!] IMPORTANT: Open server\.env in Notepad and fill in:
echo     - MONGO_URI       (from MongoDB Atlas)
echo     - CLOUDINARY_*    (from cloudinary.com)
echo     - GEMINI_API_KEY  (from aistudio.google.com)
echo.

set /p SKIP="Press ENTER to continue after filling .env, or type SKIP to run anyway: "

:: ── Step 2: Install server dependencies ──────
echo.
echo [2/4] Installing backend dependencies (this may take a minute)...
cd server
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed for server. Make sure Node.js is installed.
    pause
    exit /b 1
)
cd ..

:: ── Step 3: Install client dependencies ──────
echo.
echo [3/4] Installing frontend dependencies...
cd client
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed for client.
    pause
    exit /b 1
)
cd ..

:: ── Step 4: Launch both servers ──────────────
echo.
echo [4/4] Starting servers...
echo.
echo   Backend  → http://localhost:5000
echo   Frontend → http://localhost:5173
echo.
echo   Both servers will open in separate windows.
echo   Close this window to stop everything.
echo.

:: Open backend in a new window
start "EventHub Backend" cmd /k "cd /d "%~dp0server" && npm run dev"

:: Wait 3 seconds then open frontend
timeout /t 3 /nobreak >nul
start "EventHub Frontend" cmd /k "cd /d "%~dp0client" && npm run dev"

:: Wait 5 seconds then open browser
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo.
echo ============================================
echo   App running! Visit http://localhost:5173
echo ============================================
echo.
echo Press any key to exit this setup window...
pause >nul
