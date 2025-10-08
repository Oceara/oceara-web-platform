@echo off
REM Oceara Web Platform - Deployment Script (Windows)
REM This script helps deploy the Oceara Web Platform to GitHub and Vercel

echo.
echo ========================================
echo   Oceara Web Platform - Deployment
echo ========================================
echo.

REM Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git is not installed. Please install Git first.
    pause
    exit /b 1
)
echo [OK] Git is installed

REM Check if we're in a git repository
if not exist ".git" (
    echo [INFO] Initializing Git repository...
    git init
    echo [OK] Git repository initialized
) else (
    echo [OK] Already in a Git repository
)

REM Check for uncommitted changes
git status --porcelain > nul
if %ERRORLEVEL% EQU 0 (
    echo [WARNING] You have uncommitted changes
    set /p commit_choice="Do you want to commit all changes? (y/n): "
    if /i "%commit_choice%"=="y" (
        git add .
        set /p commit_message="Enter commit message: "
        git commit -m "%commit_message%"
        echo [OK] Changes committed
    )
)

REM Ask for GitHub repository URL
echo.
echo ========================================
echo   GitHub Repository Setup
echo ========================================
echo.
echo Suggested repository name: oceara-web-platform
echo This will differentiate from the mobile app: Oceara-blue-carbon-mrv
echo.
set /p repo_url="Enter your GitHub repository URL: "

if "%repo_url%"=="" (
    echo [ERROR] Repository URL is required
    pause
    exit /b 1
)

REM Check if remote already exists
git remote | findstr "origin" >nul
if %ERRORLEVEL% EQU 0 (
    echo [WARNING] Remote 'origin' already exists
    set /p update_remote="Do you want to update it? (y/n): "
    if /i "%update_remote%"=="y" (
        git remote set-url origin "%repo_url%"
        echo [OK] Remote 'origin' updated
    )
) else (
    git remote add origin "%repo_url%"
    echo [OK] Remote 'origin' added
)

REM Get current branch
for /f "tokens=*" %%i in ('git branch --show-current') do set current_branch=%%i
if "%current_branch%"=="" (
    set current_branch=main
    git checkout -b main
    echo [OK] Created and switched to 'main' branch
)

REM Push to GitHub
echo.
set /p push_choice="Push to GitHub now? (y/n): "
if /i "%push_choice%"=="y" (
    git push -u origin %current_branch%
    echo [OK] Pushed to GitHub successfully!
    
    REM Create develop branch if it doesn't exist
    git show-ref --verify --quiet refs/heads/develop
    if %ERRORLEVEL% NEQ 0 (
        echo [INFO] Creating 'develop' branch...
        git checkout -b develop
        git push -u origin develop
        git checkout %current_branch%
        echo [OK] Created 'develop' branch
    )
)

REM Vercel deployment
echo.
echo ========================================
echo   Vercel Deployment Setup
echo ========================================
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Vercel CLI is not installed
    set /p install_vercel="Do you want to install it now? (y/n): "
    if /i "%install_vercel%"=="y" (
        npm install -g vercel
        echo [OK] Vercel CLI installed
    ) else (
        echo [INFO] You can install it later with: npm install -g vercel
        echo [INFO] Then run: vercel login and vercel
        pause
        exit /b 0
    )
)

REM Vercel login
echo [INFO] Logging into Vercel...
call vercel login

REM Deploy to Vercel
echo.
echo [WARNING] Important: Set Root Directory to 'frontend' in Vercel settings
echo.
set /p deploy_choice="Deploy to Vercel now? (y/n): "
if /i "%deploy_choice%"=="y" (
    cd frontend
    call vercel
    cd ..
    echo [OK] Deployed to Vercel!
    echo.
    echo [INFO] Next steps:
    echo   1. Go to Vercel Dashboard
    echo   2. Add environment variables (see GITHUB_VERCEL_DEPLOYMENT.md)
    echo   3. Deploy to production with: vercel --prod
)

echo.
echo [OK] Deployment script completed!
echo.
echo Documentation:
echo   - Deployment Guide: GITHUB_VERCEL_DEPLOYMENT.md
echo   - Security Guide: SECURITY_DEPLOYMENT_GUIDE.md
echo   - Project Index: PROJECT_INDEX.md
echo.
echo Important Links:
echo   - GitHub Repo: %repo_url%
echo   - Mobile App: https://github.com/Oceara/Oceara-blue-carbon-mrv
echo.
echo [OK] Oceara Web Platform is ready!
echo.
pause
