# SafeLayer BNB Docker Setup

Services included:
- **Frontend** (Next.js) - Port 3000
- **Backend** (Express) - Port 3001
- **PostgreSQL** (optional) - Port 5432

## Quick Start

```bash
docker-compose up --build
```

Then visit:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Health: http://localhost:3001/health

## Development with Hot Reload

The compose file includes volumes for hot reload:

```bash
docker-compose up
```

Make changes to code and Docker will hot-reload them.

## Stop Services

```bash
docker-compose down
```

## Remove Volumes (Reset Database)

```bash
docker-compose down -v
```

## View Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Follow logs
docker-compose logs -f backend
```

## Build Only

```bash
docker-compose build
```

## One Service Only

```bash
# Start only backend
docker-compose up backend

# Start frontend without dependencies
docker-compose up --no-deps frontend
```

## Rebuild After Dependencies Change

```bash
docker-compose up --build
```

## Environment Variables

Edit the `environment` section in `docker-compose.yml` to change:
- Database credentials
- API URLs
- Log levels
- etc.

Or create `.env` file at root (see `.env.example`).
