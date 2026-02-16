.PHONY: help install dev build test clean docker-up docker-down logs

help:
	@echo "SafeLayer BNB - Available Commands"
	@echo "=================================="
	@echo "make install      - Install all dependencies"
	@echo "make dev          - Start development servers (requires 2 terminals)"
	@echo "make dev-docker   - Start development with Docker"
	@echo "make build        - Build for production"
	@echo "make test         - Run tests"
	@echo "make test-watch   - Run tests in watch mode"
	@echo "make lint         - Check TypeScript and linting"
	@echo "make clean        - Clean build artifacts"
	@echo "make docker-up    - Start Docker containers"
	@echo "make docker-down  - Stop Docker containers"
	@echo "make docker-logs  - View Docker logs"
	@echo "make docker-build - Build Docker images"
	@echo "make format       - Format code"

install:
	@echo "Installing dependencies..."
	cd backend && npm install
	cd frontend && npm install
	@echo "✓ Dependencies installed"

setup:
	@echo "Running setup script..."
	bash setup.sh

dev:
	@echo "Starting development servers (start both in separate terminals):"
	@echo ""
	@echo "Terminal 1:"
	@echo "  cd backend && npm run dev"
	@echo ""
	@echo "Terminal 2:"
	@echo "  cd frontend && npm run dev"
	@echo ""
	@echo "Then visit: http://localhost:3000"

dev-docker:
	docker-compose up

dev-docker-build:
	docker-compose up --build

build:
	@echo "Building backend..."
	cd backend && npm run build
	@echo "Building frontend..."
	cd frontend && npm run build
	@echo "✓ Build complete"

test:
	@echo "Running tests..."
	cd backend && npm test

test-watch:
	@echo "Running tests in watch mode..."
	cd backend && npm test:watch

test-coverage:
	@echo "Running tests with coverage..."
	cd backend && npm test:coverage

lint:
	@echo "Checking TypeScript..."
	cd backend && npm run type-check
	@echo "✓ TypeScript check passed"

clean:
	@echo "Cleaning build artifacts..."
	rm -rf backend/dist
	rm -rf frontend/.next
	rm -rf node_modules
	cd backend && rm -rf node_modules
	cd frontend && rm -rf node_modules
	@echo "✓ Clean complete"

docker-up:
	docker-compose up

docker-up-build:
	docker-compose up --build

docker-down:
	docker-compose down

docker-down-volumes:
	docker-compose down -v

docker-logs:
	docker-compose logs -f

docker-logs-backend:
	docker-compose logs -f backend

docker-logs-frontend:
	docker-compose logs -f frontend

docker-build:
	docker-compose build

docker-build-nocache:
	docker-compose build --no-cache

docker-ps:
	docker-compose ps

docker-exec-backend:
	docker-compose exec backend sh

docker-exec-frontend:
	docker-compose exec frontend sh

backend-dev:
	cd backend && npm run dev

backend-build:
	cd backend && npm run build

backend-start:
	cd backend && npm start

frontend-dev:
	cd frontend && npm run dev

frontend-build:
	cd frontend && npm run build

frontend-start:
	cd frontend && npm start

format:
	@echo "Formatting code..."
	cd backend && npx prettier --write "src/**/*.ts"
	cd frontend && npx prettier --write "app/**/*.tsx" "components/**/*.tsx"
	@echo "✓ Formatting complete"

health-check:
	@echo "Checking backend health..."
	curl http://localhost:3001/health
	@echo ""

health-check-api:
	@echo "Testing API..."
	curl "http://localhost:3001/api/risk/0x1234567890123456789012345678901234567890"
	@echo ""

logs-backend:
	tail -f backend/logs/combined.log

logs-error:
	tail -f backend/logs/error.log

migration-create:
	@read -p "Enter migration name: " name; \
	touch migrations/$$(date +%s)_$$name.sql

db-reset:
	docker-compose down -v postgres
	docker-compose up -d postgres

db-backup:
	@mkdir -p ./backups
	docker-compose exec postgres pg_dump -U safelayer safelayer_bnb > backups/backup-$$(date +%Y%m%d_%H%M%S).sql
	@echo "✓ Backup created"

install-dev-deps:
	@echo "Installing dev dependencies..."
	cd backend && npm install --save-dev
	cd frontend && npm install --save-dev

update-deps:
	@echo "Updating dependencies..."
	cd backend && npm update
	cd frontend && npm update
	@echo "✓ Dependencies updated"

pre-commit: lint test
	@echo "✓ Pre-commit checks passed"

ready-deployment: build test
	@echo "✓ Ready for deployment"

.DEFAULT_GOAL := help
