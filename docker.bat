@echo off
REM Docker Scripts untuk Morphlyca Frontend (Windows)

if "%1"=="dev" (
    echo Starting development environment...
    docker-compose -f docker-compose.dev.yml up --build
    goto end
)

if "%1"=="dev-simple" (
    echo Starting simple development environment (no volume mapping)...
    docker-compose -f docker-compose.simple.yml up --build
    goto end
)

if "%1"=="dev-detached" (
    echo Starting development environment in background...
    docker-compose -f docker-compose.dev.yml up --build -d
    goto end
)

if "%1"=="prod" (
    echo Starting production environment...
    docker-compose up --build
    goto end
)

if "%1"=="prod-detached" (
    echo Starting production environment in background...
    docker-compose up --build -d
    goto end
)

if "%1"=="stop" (
    echo Stopping all containers...
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    docker-compose -f docker-compose.simple.yml down
    goto end
)

if "%1"=="clean" (
    echo Cleaning up containers and volumes...
    docker-compose down -v
    docker-compose -f docker-compose.dev.yml down -v
    docker-compose -f docker-compose.simple.yml down -v
    docker system prune -f
    goto end
)

if "%1"=="logs" (
    echo Showing logs...
    if "%2"=="dev" (
        docker-compose -f docker-compose.dev.yml logs -f
    ) else if "%2"=="simple" (
        docker-compose -f docker-compose.simple.yml logs -f
    ) else (
        docker-compose logs -f
    )
    goto end
)

if "%1"=="shell" (
    echo Opening shell in frontend container...
    if "%2"=="dev" (
        docker exec -it morphlyca-frontend-dev sh
    ) else if "%2"=="simple" (
        docker exec -it morphlyca-frontend-dev-simple sh
    ) else (
        docker exec -it morphlyca-frontend sh
    )
    goto end
)

if "%1"=="build" (
    echo Building Docker images...
    if "%2"=="dev" (
        docker-compose -f docker-compose.dev.yml build --no-cache
    ) else if "%2"=="simple" (
        docker-compose -f docker-compose.simple.yml build --no-cache
    ) else (
        docker-compose build --no-cache
    )
    goto end
)

echo Usage: %0 {dev^|dev-simple^|dev-detached^|prod^|prod-detached^|stop^|clean^|logs^|shell^|build}
echo.
echo Commands:
echo   dev            - Start development environment
echo   dev-simple     - Start simple dev environment (no hot reload)
echo   dev-detached   - Start development environment in background
echo   prod           - Start production environment
echo   prod-detached  - Start production environment in background
echo   stop           - Stop all containers
echo   clean          - Clean up containers and volumes
echo   logs [dev]     - Show logs (add 'dev' for development logs)
echo   shell [dev]    - Open shell in container (add 'dev' for development container)
echo   build [dev]    - Build Docker images (add 'dev' for development build)

:end