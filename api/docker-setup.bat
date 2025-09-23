@echo off
REM TCG API Docker Setup and Management Script for Windows

setlocal enabledelayedexpansion

REM Colors for output (limited in Windows CMD)
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "BLUE=[94m"
set "NC=[0m"

REM Function to print colored output
:print_status
echo %GREEN%[INFO]%NC% %~1
goto :eof

:print_warning
echo %YELLOW%[WARNING]%NC% %~1
goto :eof

:print_error
echo %RED%[ERROR]%NC% %~1
goto :eof

:print_header
echo %BLUE%================================%NC%
echo %BLUE% %~1 %NC%
echo %BLUE%================================%NC%
goto :eof

REM Check if Docker is installed
:check_docker
docker --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Docker is not installed. Please install Docker Desktop first."
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Docker Compose is not installed. Please install Docker Desktop first."
    exit /b 1
)

call :print_status "Docker and Docker Compose are installed"
goto :eof

REM Setup environment file
:setup_env
if not exist .env (
    call :print_status "Creating .env file from .env.example"
    copy .env.example .env >nul
    call :print_warning "Please update the .env file with your production values"
) else (
    call :print_status ".env file already exists"
)
goto :eof

REM Development setup
:dev_setup
call :print_header "Setting up Development Environment"
call :check_docker
call :setup_env

call :print_status "Building development containers..."
docker-compose -f docker-compose.dev.yml build

call :print_status "Starting development services..."
docker-compose -f docker-compose.dev.yml up -d

call :print_status "Waiting for database to be ready..."
timeout /t 10 /nobreak >nul

call :print_status "Running Prisma migrations..."
docker-compose -f docker-compose.dev.yml exec api npx prisma migrate dev

call :print_status "Seeding database (optional)..."
docker-compose -f docker-compose.dev.yml exec api npm run prisma:seed

call :print_status "Development environment is ready!"
call :print_status "API: http://localhost:3000"
call :print_status "Database: localhost:5433"
goto :eof

REM Production setup
:prod_setup
call :print_header "Setting up Production Environment"
call :check_docker
call :setup_env

call :print_status "Building production containers..."
docker-compose build

call :print_status "Starting production services..."
docker-compose up -d

call :print_status "Waiting for database to be ready..."
timeout /t 15 /nobreak >nul

call :print_status "Running Prisma migrations..."
docker-compose exec api npx prisma migrate deploy

call :print_status "Production environment is ready!"
call :print_status "API: http://localhost:3000"
call :print_status "Nginx: http://localhost:80"
goto :eof

REM Show logs
:show_logs
if "%~1"=="dev" (
    docker-compose -f docker-compose.dev.yml logs -f
) else (
    docker-compose logs -f
)
goto :eof

REM Stop services
:stop_services
if "%~1"=="dev" (
    call :print_status "Stopping development services..."
    docker-compose -f docker-compose.dev.yml down
) else (
    call :print_status "Stopping production services..."
    docker-compose down
)
goto :eof

REM Clean up
:cleanup
call :print_warning "This will remove all containers, networks, and volumes"
set /p confirm="Are you sure? (y/N): "
if /i "!confirm!"=="y" (
    if "%~1"=="dev" (
        docker-compose -f docker-compose.dev.yml down -v --remove-orphans
    ) else (
        docker-compose down -v --remove-orphans
    )
    call :print_status "Cleanup completed"
)
goto :eof

REM Database backup
:backup_db
call :print_status "Creating database backup..."
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set timestamp=%datetime:~0,8%_%datetime:~8,6%

if "%~1"=="dev" (
    docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U tcg_user tcg_mobile_dev > backup_dev_%timestamp%.sql
) else (
    docker-compose exec postgres pg_dump -U tcg_user tcg_mobile > backup_prod_%timestamp%.sql
)
call :print_status "Backup saved as backup_%1_%timestamp%.sql"
goto :eof

REM Show help
:show_help
call :print_header "TCG API Docker Management"
echo Usage: %0 ^<command^> [environment]
echo.
echo Commands:
echo   setup [dev^|prod]    - Setup and start the environment
echo   start [dev^|prod]    - Start services
echo   stop [dev^|prod]     - Stop services
echo   restart [dev^|prod]  - Restart services
echo   logs [dev^|prod]     - Show logs
echo   backup [dev^|prod]   - Backup database
echo   cleanup [dev^|prod]  - Remove containers and volumes
echo   shell [dev^|prod]    - Access API container shell
echo   help                 - Show this help
echo.
echo Examples:
echo   %0 setup dev        - Setup development environment
echo   %0 start prod       - Start production environment
echo   %0 logs dev         - Show development logs
goto :eof

REM Main script logic
if "%1"=="setup" (
    if "%2"=="dev" (
        call :dev_setup
    ) else if "%2"=="prod" (
        call :prod_setup
    ) else (
        call :print_error "Please specify environment: dev or prod"
        exit /b 1
    )
) else if "%1"=="start" (
    if "%2"=="dev" (
        docker-compose -f docker-compose.dev.yml up -d
    ) else if "%2"=="prod" (
        docker-compose up -d
    ) else (
        call :print_error "Please specify environment: dev or prod"
        exit /b 1
    )
) else if "%1"=="stop" (
    call :stop_services %2
) else if "%1"=="restart" (
    call :stop_services %2
    timeout /t 2 /nobreak >nul
    if "%2"=="dev" (
        docker-compose -f docker-compose.dev.yml up -d
    ) else if "%2"=="prod" (
        docker-compose up -d
    )
) else if "%1"=="logs" (
    call :show_logs %2
) else if "%1"=="backup" (
    call :backup_db %2
) else if "%1"=="cleanup" (
    call :cleanup %2
) else if "%1"=="shell" (
    if "%2"=="dev" (
        docker-compose -f docker-compose.dev.yml exec api sh
    ) else if "%2"=="prod" (
        docker-compose exec api sh
    ) else (
        call :print_error "Please specify environment: dev or prod"
        exit /b 1
    )
) else (
    call :show_help
)
