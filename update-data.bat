@echo off
chcp 65001 >nul
echo ========================================
echo   Update Events Data
echo ========================================
echo.

echo [1/3] Running parser...
cd parser
$env:PYTHONIOENCODING="utf-8"
python parser.py
if %errorlevel% neq 0 (
    echo Error running parser!
    pause
    exit /b 1
)
cd ..

echo.
echo [2/3] Copying data to frontend...
copy /Y data\events.json frontend\public\data\events.json
if %errorlevel% neq 0 (
    echo Error copying data!
    pause
    exit /b 1
)

echo.
echo [3/3] Building frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo Error building frontend!
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo   DONE! Data updated and built.
echo ========================================
echo.
echo   To deploy:
echo   1. git add .
echo   2. git commit -m "Update events data"
echo   3. git push
echo.
pause
