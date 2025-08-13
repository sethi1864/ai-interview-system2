#!/bin/bash

# AI Interview System Deployment Script
# This script helps you deploy the AI Interview System

set -e

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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 16+ first."
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        print_success "Docker is available"
        DOCKER_AVAILABLE=true
    else
        print_warning "Docker is not available. Will use local installation."
        DOCKER_AVAILABLE=false
    fi
    
    # Check Git
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    
    print_success "All prerequisites are satisfied"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Install backend dependencies
    print_status "Installing backend dependencies..."
    npm install
    
    # Install frontend dependencies
    print_status "Installing frontend dependencies..."
    cd client
    npm install
    cd ..
    
    print_success "Dependencies installed successfully"
}

# Setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_status "Creating .env file from template..."
        cp .env.example .env
        print_warning "Please edit .env file with your API keys and configuration"
    else
        print_status ".env file already exists"
    fi
    
    # Create necessary directories
    mkdir -p logs
    mkdir -p uploads/audio
    mkdir -p uploads/video
    
    print_success "Environment setup completed"
}

# Build application
build_application() {
    print_status "Building application..."
    
    # Build frontend
    print_status "Building frontend..."
    cd client
    npm run build
    cd ..
    
    print_success "Application built successfully"
}

# Start with Docker
start_with_docker() {
    print_status "Starting with Docker..."
    
    # Build and start containers
    docker-compose up -d
    
    print_success "Application started with Docker"
    print_status "Access the application at: http://localhost:3000"
    print_status "MongoDB Express: http://localhost:8081"
    print_status "Redis Commander: http://localhost:8082"
}

# Start locally
start_locally() {
    print_status "Starting locally..."
    
    # Check if MongoDB is running
    if ! pgrep -x "mongod" > /dev/null; then
        print_warning "MongoDB is not running. Please start MongoDB first."
        print_status "You can start MongoDB with: sudo systemctl start mongod"
    fi
    
    # Check if Redis is running
    if ! pgrep -x "redis-server" > /dev/null; then
        print_warning "Redis is not running. Please start Redis first."
        print_status "You can start Redis with: sudo systemctl start redis"
    fi
    
    # Start the application
    npm run dev
    
    print_success "Application started locally"
    print_status "Access the application at: http://localhost:3000"
}

# Health check
health_check() {
    print_status "Performing health check..."
    
    # Wait for application to start
    sleep 5
    
    # Check if application is responding
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        print_success "Application is healthy and responding"
    else
        print_error "Application is not responding. Please check the logs."
        exit 1
    fi
}

# Show usage
show_usage() {
    echo "AI Interview System Deployment Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  install     Install dependencies and setup environment"
    echo "  build       Build the application"
    echo "  start       Start the application"
    echo "  docker      Start with Docker"
    echo "  local       Start locally"
    echo "  health      Perform health check"
    echo "  full        Full deployment (install + build + start)"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 install    # Install dependencies"
    echo "  $0 docker     # Start with Docker"
    echo "  $0 local      # Start locally"
    echo "  $0 full       # Full deployment"
}

# Main function
main() {
    case "${1:-help}" in
        install)
            check_prerequisites
            install_dependencies
            setup_environment
            ;;
        build)
            build_application
            ;;
        start)
            if [ "$DOCKER_AVAILABLE" = true ]; then
                start_with_docker
            else
                start_locally
            fi
            ;;
        docker)
            if [ "$DOCKER_AVAILABLE" = true ]; then
                start_with_docker
                health_check
            else
                print_error "Docker is not available"
                exit 1
            fi
            ;;
        local)
            start_locally
            ;;
        health)
            health_check
            ;;
        full)
            check_prerequisites
            install_dependencies
            setup_environment
            build_application
            if [ "$DOCKER_AVAILABLE" = true ]; then
                start_with_docker
            else
                start_locally
            fi
            health_check
            ;;
        help|*)
            show_usage
            ;;
    esac
}

# Run main function
main "$@"