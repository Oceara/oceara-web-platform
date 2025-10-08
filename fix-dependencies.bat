@echo off
echo ==========================================
echo  Oceara - Complete Dependency Fix Script
echo ==========================================
echo.

echo [1/6] Cleaning root directory...
if exist package-lock.json del /f /q package-lock.json
if exist node_modules rmdir /s /q node_modules

echo [2/6] Cleaning frontend directory...
cd frontend
if exist package-lock.json del /f /q package-lock.json
if exist node_modules rmdir /s /q node_modules
cd ..

echo [3/6] Cleaning backend directory...
cd backend
if exist package-lock.json del /f /q package-lock.json
if exist node_modules rmdir /s /q node_modules
cd ..

echo [4/6] Installing root dependencies...
call npm install --legacy-peer-deps

echo [5/6] Installing frontend dependencies...
cd frontend
call npm install --legacy-peer-deps
cd ..

echo [6/6] Installing backend dependencies...
cd backend
call npm install --legacy-peer-deps
cd ..

echo.
echo ==========================================
echo  Installation Complete!
echo ==========================================
echo.
echo Next steps:
echo 1. Commit changes: git add . ^&^& git commit -m "Fix all dependencies"
echo 2. Push to GitHub: git push
echo 3. Deploy to Vercel
echo.
pause

