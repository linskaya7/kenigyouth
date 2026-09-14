@echo off
chcp 65001 >nul
echo ========================================
echo   Kaliningrad Youth Digest - Deploy
echo ========================================
echo.

echo [1/3] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo Error installing dependencies!
    pause
    exit /b 1
)

echo.
echo [2/3] Building project...
call npm run build
if %errorlevel% neq 0 (
    echo Build error!
    pause
    exit /b 1
)

echo.
echo [3/3] Build complete!
echo.
if exist "dist" (
    echo OK: dist folder created.
) else (
    echo ERROR: dist folder not found!
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
echo   1. Create repo on GitHub
echo   2. Upload project:
echo      git init
echo      git add .
echo      git commit -m "Initial commit"
echo      git remote add origin https://github.com/YOUR_USER/kaliningrad-youth-digest.git
echo      git push -u origin main
echo   3. Settings - Pages - GitHub Actions
echo   4. URL: https://YOUR_USER.github.io/kaliningrad-youth-digest/
echo.
echo   Option 2: Vercel (fast deploy)
echo   ------------------------------------
echo   1. npm install -g vercel
echo   2. In frontend folder: vercel
echo   3. URL: https://YOUR_PROJECT.vercel.app/
echo.
echo   Option 3: Netlify
echo   ------------------------------------
echo   1. Go to https://app.netlify.com/
echo   2. Drag frontend/dist folder
echo   3. URL: https://YOUR_SITE.netlify.app/
echo.
echo ========================================
echo.
echo DONE! Choose a deploy option above.
echo.
pause
