@echo off
echo.
echo ================================================
echo    OPENING WEBSITE IN FRESH BROWSER SESSION
echo ================================================
echo.
echo This will open the website with NO CACHE!
echo.
echo Features you WILL see:
echo  - Auto-Detect location button
echo  - 5 wallet provider options
echo  - Professional satellite viewer
echo  - 13+ pending projects in admin
echo.
echo Opening in 3 seconds...
timeout /t 3 /nobreak > nul

REM Clear DNS cache
ipconfig /flushdns > nul 2>&1

REM Try Chrome Incognito
start chrome.exe --incognito --disable-cache --new-window "https://oceara-web-platform-1.vercel.app/?fresh=%random%"

REM If Chrome not found, try Edge
if errorlevel 1 (
    start msedge.exe --inprivate "https://oceara-web-platform-1.vercel.app/?fresh=%random%"
)

echo.
echo ================================================
echo    BROWSER OPENED!
echo ================================================
echo.
echo TEST THESE:
echo  1. Landowner - See "Auto-Detect" button
echo  2. Wallet - See 5 wallet options modal
echo  3. Admin - See large satellite viewer
echo.
echo If you DON'T see these features:
echo  - Press Ctrl + Shift + R (hard refresh)
echo  - Press F12 - Go to Network tab
echo  - Check "Disable cache"
echo  - Refresh again
echo.
pause

