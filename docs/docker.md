# Docker Setup

## Quick Start

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Health: http://localhost:3001/health

## Commands

```bash
docker-compose up              # Start all services (hot reload enabled)
docker-compose down            # Stop services
docker-compose down -v         # Stop + remove volumes (reset DB)
docker-compose logs -f backend # Follow backend logs
docker-compose up backend      # Start backend only
```

## Environment

Edit `docker-compose.yml` environment section or create a root `.env` file (see `.env.example`).
