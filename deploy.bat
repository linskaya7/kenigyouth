@echo off
chcp 65001 >nul
echo ========================================
echo   Kaliningrad Youth Digest - Deploy
echo ========================================
echo.

echo [1/4] Running parser...
cd parser
set PYTHONIOENCODING=utf-8
python parser.py
if %errorlevel% neq 0 (
    echo Error running parser!
    pause
    exit /b 1
)
cd ..

echo.
echo [2/4] Copying data to frontend...
if not exist "frontend\public\data" mkdir "frontend\public\data"
copy /Y data\events.json frontend\public\data\events.json
if %errorlevel% neq 0 (
    echo Error copying data!
    pause
    exit /b 1
)

echo.
echo [3/4] Installing dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo Error installing dependencies!
    pause
    exit /b 1
)

echo.
echo [4/4] Building project...
call npm run build
if %errorlevel% neq 0 (
    echo Error building!
    pause
    exit /b 1
)
cd ..

echo.
if exist "frontend\dist" (
    echo OK: Build successful!
) else (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo   DEPLOY OPTIONS
echo ========================================
echo.
echo   Option 1: GitHub Pages (recommended)
echo   ------------------------------------
echo   1. git add .
echo   2. git commit -m "Update events"
echo   3. git push
echo   4. Wait for GitHub Actions
echo   5. URL: https://linskaya7.github.io/kenigyouth/
echo.
echo   Option 2: Local preview
echo   ------------------------------------
echo   cd frontend
echo   npm run preview
echo   URL: http://localhost:4173
echo.
echo ========================================
echo.
pause
