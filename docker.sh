#!/bin/bash

# Docker Scripts untuk Morphlyca Frontend

case "$1" in
  "dev")
    echo "🚀 Starting development environment..."
    docker-compose -f docker-compose.dev.yml up --build
    ;;
  "dev-detached")
    echo "🚀 Starting development environment in background..."
    docker-compose -f docker-compose.dev.yml up --build -d
    ;;
  "prod")
    echo "🚀 Starting production environment..."
    docker-compose up --build
    ;;
  "prod-detached")
    echo "🚀 Starting production environment in background..."
    docker-compose up --build -d
    ;;
  "stop")
    echo "🛑 Stopping all containers..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    ;;
  "clean")
    echo "🧹 Cleaning up containers and volumes..."
    docker-compose down -v
    docker-compose -f docker-compose.dev.yml down -v
    docker system prune -f
    ;;
  "logs")
    echo "📋 Showing logs..."
    if [ "$2" = "dev" ]; then
      docker-compose -f docker-compose.dev.yml logs -f
    else
      docker-compose logs -f
    fi
    ;;
  "shell")
    echo "🐚 Opening shell in frontend container..."
    if [ "$2" = "dev" ]; then
      docker exec -it morphlyca-frontend-dev sh
    else
      docker exec -it morphlyca-frontend sh
    fi
    ;;
  "build")
    echo "🔨 Building Docker images..."
    if [ "$2" = "dev" ]; then
      docker-compose -f docker-compose.dev.yml build --no-cache
    else
      docker-compose build --no-cache
    fi
    ;;
  *)
    echo "Usage: $0 {dev|dev-detached|prod|prod-detached|stop|clean|logs|shell|build}"
    echo ""
    echo "Commands:"
    echo "  dev            - Start development environment"
    echo "  dev-detached   - Start development environment in background"
    echo "  prod           - Start production environment"
    echo "  prod-detached  - Start production environment in background"
    echo "  stop           - Stop all containers"
    echo "  clean          - Clean up containers and volumes"
    echo "  logs [dev]     - Show logs (add 'dev' for development logs)"
    echo "  shell [dev]    - Open shell in container (add 'dev' for development container)"
    echo "  build [dev]    - Build Docker images (add 'dev' for development build)"
    exit 1
    ;;
esac