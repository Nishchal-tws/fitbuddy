# FitBuddy Docker Setup

This guide explains how to run the FitBuddy application using Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

### Development Environment

1. **Clone and navigate to the project directory:**
   ```bash
   cd fitbuddy
   ```

2. **Build and start all services:**
   ```bash
   make build
   make up
   ```
   
   Or using docker-compose directly:
   ```bash
   docker-compose build
   docker-compose up -d
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Production Environment

1. **Set environment variables:**
   ```bash
   export POSTGRES_PASSWORD=your-secure-password
   export JWT_SECRET_KEY=your-super-secret-jwt-key
   export API_URL=https://your-domain.com
   ```

2. **Start production services:**
   ```bash
   make prod
   ```

## Available Commands

| Command | Description |
|---------|-------------|
| `make build` | Build all Docker images |
| `make up` | Start all services |
| `make down` | Stop all services |
| `make logs` | Show logs for all services |
| `make clean` | Remove all containers, networks, and volumes |
| `make restart` | Restart all services |
| `make dev` | Start development environment |
| `make prod` | Start production environment |

### Individual Service Commands

| Command | Description |
|---------|-------------|
| `make backend-logs` | Show backend logs |
| `make frontend-logs` | Show frontend logs |
| `make db-logs` | Show database logs |
| `make db-shell` | Access database shell |
| `make backend-shell` | Access backend container shell |
| `make migrate` | Run database migrations |

## Services

### Database (PostgreSQL)
- **Port:** 5432
- **Database:** fitbuddy
- **User:** postgres
- **Password:** root123 (development) / ${POSTGRES_PASSWORD} (production)

### Backend (FastAPI)
- **Port:** 8000
- **Health Check:** http://localhost:8000/api/health
- **API Docs:** http://localhost:8000/docs

### Frontend (React + Nginx)
- **Port:** 3000 (development) / 80 (production)
- **Health Check:** http://localhost/

## Environment Variables

### Backend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql+psycopg://postgres:root123@db:5432/fitbuddy` | Database connection string |
| `JWT_SECRET_KEY` | `your-super-secret-jwt-key-change-in-production` | JWT signing key |
| `JWT_ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Token expiration time |

### Frontend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000` | Backend API URL |

## Database Management

### Running Migrations
```bash
make migrate
```

### Accessing Database
```bash
make db-shell
```

### Backup Database
```bash
docker-compose exec db pg_dump -U postgres fitbuddy > backup.sql
```

### Restore Database
```bash
docker-compose exec -T db psql -U postgres fitbuddy < backup.sql
```

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   - Make sure ports 3000, 8000, and 5432 are not in use
   - Check with: `netstat -tulpn | grep :PORT`

2. **Database connection issues:**
   - Wait for database to be ready: `docker-compose logs db`
   - Check database health: `docker-compose ps`

3. **Build failures:**
   - Clear Docker cache: `docker system prune -a`
   - Rebuild without cache: `docker-compose build --no-cache`

### Logs and Debugging

```bash
# View all logs
make logs

# View specific service logs
make backend-logs
make frontend-logs
make db-logs

# Access container shells
make backend-shell
make db-shell
```

### Clean Up

```bash
# Stop and remove containers, networks, and volumes
make clean

# Remove only containers
docker-compose down

# Remove containers and volumes (keeps images)
docker-compose down -v
```

## Development Workflow

1. **Make code changes** in your local files
2. **Rebuild specific service** if needed:
   ```bash
   docker-compose build backend
   docker-compose up -d backend
   ```
3. **View logs** to debug:
   ```bash
   make backend-logs
   ```

## Security Notes

- Change default passwords in production
- Use environment variables for sensitive data
- Consider using Docker secrets for production
- Regularly update base images
- Use non-root users in containers (already configured)

## File Structure

```
fitbuddy/
├── Dockerfile.backend          # Backend Dockerfile
├── docker-compose.yml         # Development compose
├── docker-compose.prod.yml    # Production compose
├── docker.env                 # Environment variables
├── init.sql                   # Database initialization
├── Makefile                   # Convenient commands
├── .dockerignore              # Backend ignore file
├── frontend/
│   ├── Dockerfile             # Frontend Dockerfile
│   ├── nginx.conf             # Nginx configuration
│   └── .dockerignore          # Frontend ignore file
└── DOCKER_README.md           # This file
```
