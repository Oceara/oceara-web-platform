#!/bin/bash

# Oceara Web Platform - Deployment Script
# This script helps deploy the Oceara Web Platform to GitHub and Vercel

set -e  # Exit on error

echo "🌊 Oceara Web Platform - Deployment Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "ℹ $1"
}

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "Git is not installed. Please install Git first."
    exit 1
fi

print_success "Git is installed"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_info "Initializing Git repository..."
    git init
    print_success "Git repository initialized"
else
    print_success "Already in a Git repository"
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes"
    read -p "Do you want to commit all changes? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        read -p "Enter commit message: " commit_message
        git commit -m "$commit_message"
        print_success "Changes committed"
    fi
fi

# Ask for GitHub repository URL
echo ""
print_info "GitHub Repository Setup"
echo "Suggested repository name: oceara-web-platform"
echo "This will differentiate from the mobile app: Oceara-blue-carbon-mrv"
echo ""
read -p "Enter your GitHub repository URL (e.g., https://github.com/Oceara/oceara-web-platform.git): " repo_url

if [ -z "$repo_url" ]; then
    print_error "Repository URL is required"
    exit 1
fi

# Check if remote already exists
if git remote | grep -q "origin"; then
    print_warning "Remote 'origin' already exists"
    read -p "Do you want to update it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote set-url origin "$repo_url"
        print_success "Remote 'origin' updated"
    fi
else
    git remote add origin "$repo_url"
    print_success "Remote 'origin' added"
fi

# Check current branch
current_branch=$(git branch --show-current)
if [ -z "$current_branch" ]; then
    current_branch="main"
    git checkout -b main
    print_success "Created and switched to 'main' branch"
fi

# Push to GitHub
echo ""
print_info "Pushing to GitHub..."
read -p "Push to GitHub now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    git push -u origin $current_branch
    print_success "Pushed to GitHub successfully!"
    
    # Create develop branch if it doesn't exist
    if ! git show-ref --verify --quiet refs/heads/develop; then
        print_info "Creating 'develop' branch..."
        git checkout -b develop
        git push -u origin develop
        git checkout $current_branch
        print_success "Created 'develop' branch"
    fi
fi

# Vercel deployment
echo ""
print_info "Vercel Deployment Setup"
echo "=========================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI is not installed"
    read -p "Do you want to install it now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm install -g vercel
        print_success "Vercel CLI installed"
    else
        print_info "You can install it later with: npm install -g vercel"
        print_info "Then run: vercel login && vercel"
        exit 0
    fi
fi

# Vercel login
print_info "Logging into Vercel..."
vercel login

# Deploy to Vercel
echo ""
print_info "Deploying to Vercel..."
echo ""
print_warning "Important: Set Root Directory to 'frontend' in Vercel settings"
echo ""
read -p "Deploy to Vercel now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd frontend
    vercel
    cd ..
    print_success "Deployed to Vercel!"
    echo ""
    print_info "Next steps:"
    echo "1. Go to Vercel Dashboard"
    echo "2. Add environment variables (see GITHUB_VERCEL_DEPLOYMENT.md)"
    echo "3. Deploy to production with: vercel --prod"
fi

echo ""
print_success "Deployment script completed!"
echo ""
print_info "📚 Documentation:"
echo "  - Deployment Guide: GITHUB_VERCEL_DEPLOYMENT.md"
echo "  - Security Guide: SECURITY_DEPLOYMENT_GUIDE.md"
echo "  - Project Index: PROJECT_INDEX.md"
echo ""
print_info "🔗 Important Links:"
echo "  - GitHub Repo: $repo_url"
echo "  - Mobile App: https://github.com/Oceara/Oceara-blue-carbon-mrv"
echo ""
print_success "🌊 Oceara Web Platform is ready!"
