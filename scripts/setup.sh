#!/bin/bash

# Oceara Full-Stack Setup Script
# This script sets up the complete development environment

set -e

echo "🌊 Setting up Oceara Full-Stack Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking system requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed. Please install Python 3.8+ from https://python.org/"
        exit 1
    fi
    
    # Check pip
    if ! command -v pip3 &> /dev/null; then
        print_error "pip3 is not installed. Please install pip3."
        exit 1
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git from https://git-scm.com/"
        exit 1
    fi
    
    print_success "All requirements satisfied"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install root dependencies
    print_status "Installing root dependencies..."
    npm install
    
    # Install frontend dependencies
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    # Install backend dependencies
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    # Install ML dependencies
    print_status "Installing ML dependencies..."
    cd ml-models
    pip3 install -r requirements.txt
    cd ..
    
    print_success "All dependencies installed"
}

# Setup environment files
setup_environment() {
    print_status "Setting up environment files..."
    
    # Copy environment template if it doesn't exist
    if [ ! -f .env ]; then
        cp env.example .env
        print_success "Created .env file from template"
        print_warning "Please edit .env file with your configuration"
    else
        print_warning ".env file already exists, skipping..."
    fi
    
    # Create necessary directories
    mkdir -p logs
    mkdir -p uploads
    mkdir -p ml-models/models
    mkdir -p ml-models/data
    
    print_success "Environment setup complete"
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Check if MongoDB is running
    if ! pgrep -x "mongod" > /dev/null; then
        print_warning "MongoDB is not running. Please start MongoDB:"
        print_warning "  - On macOS: brew services start mongodb-community"
        print_warning "  - On Ubuntu: sudo systemctl start mongod"
        print_warning "  - On Windows: net start MongoDB"
    else
        print_success "MongoDB is running"
    fi
    
    # Check if Redis is running
    if ! pgrep -x "redis-server" > /dev/null; then
        print_warning "Redis is not running. Please start Redis:"
        print_warning "  - On macOS: brew services start redis"
        print_warning "  - On Ubuntu: sudo systemctl start redis"
        print_warning "  - On Windows: redis-server"
    else
        print_success "Redis is running"
    fi
}

# Build applications
build_applications() {
    print_status "Building applications..."
    
    # Build frontend
    print_status "Building frontend..."
    cd frontend
    npm run build
    cd ..
    
    # Build backend
    print_status "Building backend..."
    cd backend
    npm run build
    cd ..
    
    print_success "Applications built successfully"
}

# Setup Git hooks
setup_git_hooks() {
    print_status "Setting up Git hooks..."
    
    # Create pre-commit hook
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
echo "Running pre-commit checks..."

# Run linting
cd frontend && npm run lint
cd ../backend && npm run lint
cd ..

# Run tests
npm run test

echo "Pre-commit checks passed!"
EOF
    
    chmod +x .git/hooks/pre-commit
    
    print_success "Git hooks setup complete"
}

# Main setup function
main() {
    echo "🌊 Oceara Full-Stack Setup"
    echo "=========================="
    
    check_requirements
    install_dependencies
    setup_environment
    setup_database
    build_applications
    setup_git_hooks
    
    echo ""
    print_success "🎉 Setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Edit .env file with your configuration"
    echo "2. Start the development servers:"
    echo "   npm run dev"
    echo ""
    echo "Or start individual services:"
    echo "  Frontend:  npm run dev:frontend"
    echo "  Backend:   npm run dev:backend"
    echo ""
    echo "Access the application at:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:5000"
    echo "  API Docs: http://localhost:5000/api-docs"
    echo ""
    echo "For Docker deployment:"
    echo "  docker-compose up -d"
    echo ""
}

# Run main function
main "$@"
