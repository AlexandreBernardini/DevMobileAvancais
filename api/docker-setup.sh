#!/bin/bash

# TCG API Docker Setup and Management Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Docker and Docker Compose are installed"
}

# Setup environment file
setup_env() {
    if [ ! -f .env ]; then
        print_status "Creating .env file from .env.example"
        cp .env.example .env
        print_warning "Please update the .env file with your production values"
    else
        print_status ".env file already exists"
    fi
}

# Development setup
dev_setup() {
    print_header "Setting up Development Environment"
    check_docker
    setup_env
    
    print_status "Building development containers..."
    docker-compose -f docker-compose.dev.yml build
    
    print_status "Starting development services..."
    docker-compose -f docker-compose.dev.yml up -d
    
    print_status "Waiting for database to be ready..."
    sleep 10
    
    print_status "Running Prisma migrations..."
    docker-compose -f docker-compose.dev.yml exec api npx prisma migrate dev
    
    print_status "Seeding database (optional)..."
    docker-compose -f docker-compose.dev.yml exec api npm run prisma:seed || print_warning "Seeding failed or not configured"
    
    print_status "Development environment is ready!"
    print_status "API: http://localhost:3000"
    print_status "Database: localhost:5433"
}

# Production setup
prod_setup() {
    print_header "Setting up Production Environment"
    check_docker
    setup_env
    
    print_status "Building production containers..."
    docker-compose build
    
    print_status "Starting production services..."
    docker-compose up -d
    
    print_status "Waiting for database to be ready..."
    sleep 15
    
    print_status "Running Prisma migrations..."
    docker-compose exec api npx prisma migrate deploy
    
    print_status "Production environment is ready!"
    print_status "API: http://localhost:3000"
    print_status "Nginx: http://localhost:80"
}

# Show logs
show_logs() {
    if [ "$1" = "dev" ]; then
        docker-compose -f docker-compose.dev.yml logs -f
    else
        docker-compose logs -f
    fi
}

# Stop services
stop_services() {
    if [ "$1" = "dev" ]; then
        print_status "Stopping development services..."
        docker-compose -f docker-compose.dev.yml down
    else
        print_status "Stopping production services..."
        docker-compose down
    fi
}

# Clean up (remove containers and volumes)
cleanup() {
    print_warning "This will remove all containers, networks, and volumes"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if [ "$1" = "dev" ]; then
            docker-compose -f docker-compose.dev.yml down -v --remove-orphans
        else
            docker-compose down -v --remove-orphans
        fi
        print_status "Cleanup completed"
    fi
}

# Database backup
backup_db() {
    print_status "Creating database backup..."
    timestamp=$(date +%Y%m%d_%H%M%S)
    if [ "$1" = "dev" ]; then
        docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U tcg_user tcg_mobile_dev > "backup_dev_${timestamp}.sql"
    else
        docker-compose exec postgres pg_dump -U tcg_user tcg_mobile > "backup_prod_${timestamp}.sql"
    fi
    print_status "Backup saved as backup_${1}_${timestamp}.sql"
}

# Show help
show_help() {
    print_header "TCG API Docker Management"
    echo "Usage: $0 <command> [environment]"
    echo ""
    echo "Commands:"
    echo "  setup [dev|prod]    - Setup and start the environment"
    echo "  start [dev|prod]    - Start services"
    echo "  stop [dev|prod]     - Stop services"
    echo "  restart [dev|prod]  - Restart services"
    echo "  logs [dev|prod]     - Show logs"
    echo "  backup [dev|prod]   - Backup database"
    echo "  cleanup [dev|prod]  - Remove containers and volumes"
    echo "  shell [dev|prod]    - Access API container shell"
    echo "  help                - Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 setup dev        - Setup development environment"
    echo "  $0 start prod       - Start production environment"
    echo "  $0 logs dev         - Show development logs"
}

# Main script logic
case "$1" in
    setup)
        if [ "$2" = "dev" ]; then
            dev_setup
        elif [ "$2" = "prod" ]; then
            prod_setup
        else
            print_error "Please specify environment: dev or prod"
            exit 1
        fi
        ;;
    start)
        if [ "$2" = "dev" ]; then
            docker-compose -f docker-compose.dev.yml up -d
        elif [ "$2" = "prod" ]; then
            docker-compose up -d
        else
            print_error "Please specify environment: dev or prod"
            exit 1
        fi
        ;;
    stop)
        stop_services "$2"
        ;;
    restart)
        stop_services "$2"
        sleep 2
        if [ "$2" = "dev" ]; then
            docker-compose -f docker-compose.dev.yml up -d
        elif [ "$2" = "prod" ]; then
            docker-compose up -d
        fi
        ;;
    logs)
        show_logs "$2"
        ;;
    backup)
        backup_db "$2"
        ;;
    cleanup)
        cleanup "$2"
        ;;
    shell)
        if [ "$2" = "dev" ]; then
            docker-compose -f docker-compose.dev.yml exec api sh
        elif [ "$2" = "prod" ]; then
            docker-compose exec api sh
        else
            print_error "Please specify environment: dev or prod"
            exit 1
        fi
        ;;
    help|*)
        show_help
        ;;
esac
