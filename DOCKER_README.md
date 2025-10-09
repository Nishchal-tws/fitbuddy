# FitBuddy Docker Setup & Learning Guide

This comprehensive guide explains the FitBuddy application's Docker architecture, including how to run it and understand the microservice integration between FastAPI, Spring Boot, and React.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Service Architecture](#service-architecture)
4. [Port Configuration](#port-configuration)
5. [Quick Start](#quick-start)
6. [Development Workflow](#development-workflow)
7. [Database Management](#database-management)
8. [Microservice Communication](#microservice-communication)
9. [Troubleshooting](#troubleshooting)
10. [Production Deployment](#production-deployment)

## Architecture Overview

FitBuddy uses a microservices architecture with the following components:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Docker Network                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  │   React     │  │   FastAPI   │  │ Spring Boot │  │ PostgreSQL  │
│  │  Frontend   │  │   Backend   │  │ Analytics   │  │  Database   │
│  │             │  │             │  │  Service    │  │             │
│  │ Port: 3000  │  │ Port: 8000  │  │ Port: 8081  │  │ Port: 5432  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
│         │                │                │                │
│         └────────────────┼────────────────┼────────────────┘
│                          │                │
│                          ▼                ▼
│                   ┌─────────────┐  ┌─────────────┐
│                   │   HTTP      │  │  Database   │
│                   │   API       │  │  Queries    │
│                   │   Calls     │  │             │
│                   └─────────────┘  └─────────────┘
└─────────────────────────────────────────────────────────────────┘
```

### Service Communication Flow
1. **User** interacts with **React Frontend** (port 3000)
2. **Frontend** makes API calls to **FastAPI Backend** (port 8000)
3. **FastAPI Backend** communicates with **Spring Boot Analytics Service** (port 8081)
4. **Both Backend services** read/write to **PostgreSQL Database** (port 5432)

## Prerequisites

### Required Software
- **Docker Desktop** (latest version)
- **Docker Compose** (included with Docker Desktop)
- **Git** (for cloning the repository)
- **Make** (optional, for convenient commands)

### System Requirements
- **RAM**: Minimum 4GB, Recommended 8GB+
- **CPU**: 2+ cores
- **Disk**: 2GB free space
- **OS**: Windows 10/11, macOS, or Linux

### Verify Installation
```bash
# Check Docker version
docker --version

# Check Docker Compose version
docker-compose --version

# Verify Docker is running
docker ps
```

## Service Architecture

### 1. React Frontend Service
- **Technology**: React 18 + Vite + Tailwind CSS
- **Container**: `fitbuddy_frontend`
- **Base Image**: `nginx:alpine`
- **Build Process**: Multi-stage build with Node.js builder
- **Purpose**: User interface for the fitness application

### 2. FastAPI Backend Service
- **Technology**: Python 3.11 + FastAPI + SQLAlchemy + Alembic
- **Container**: `fitbuddy_backend`
- **Base Image**: `python:3.11-slim`
- **Purpose**: Main API server, authentication, data management

### 3. Spring Boot Analytics Service
- **Technology**: Java 8 + Spring Boot 2.7.18 + JPA + PostgreSQL
- **Container**: `fitbuddy_analytics`
- **Base Image**: `openjdk:17-jdk-slim`
- **Purpose**: Automated workout plan generation based on user goals

### 4. PostgreSQL Database
- **Technology**: PostgreSQL 15
- **Container**: `fitbuddy_db`
- **Base Image**: `postgres:15-alpine`
- **Purpose**: Centralized data storage for all services

## Port Configuration

### Exposed Ports
| Service | Internal Port | External Port | Protocol | Purpose |
|---------|---------------|---------------|----------|---------|
| Frontend | 80 | 3000 | HTTP | Web interface |
| Backend | 8000 | 8000 | HTTP | API endpoints |
| Analytics | 8081 | 8081 | HTTP | Plan generation API |
| Database | 5432 | 5432 | TCP | Database access |

### Internal Communication
- **Frontend → Backend**: `http://backend:8000` (Docker internal network)
- **Backend → Analytics**: `http://analytics:8081` (Docker internal network)
- **Backend → Database**: `postgresql://db:5432/postgres`
- **Analytics → Database**: `jdbc:postgresql://db:5432/postgres`

### Why These Ports?
- **3000**: Standard development port for React applications
- **8000**: Common port for Python web frameworks (FastAPI, Flask)
- **8081**: Alternative to 8080 (often used by other services)
- **5432**: Default PostgreSQL port

## Quick Start

### Development Environment

1. **Clone and navigate to the project directory:**
   ```bash
   git clone <repository-url>
   cd fitbuddy
   ```

2. **Build and start all services:**
   ```bash
   # Using Makefile (recommended)
   make build
   make up
   
   # Or using docker-compose directly
   docker-compose build
   docker-compose up -d
   ```

3. **Verify all services are running:**
   ```bash
   docker-compose ps
   ```

4. **Access the application:**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000
   - **API Documentation**: http://localhost:8000/docs
   - **Analytics Service**: http://localhost:8081/api/analytics/system-plans

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

## Microservice Communication

### How Services Talk to Each Other

#### 1. Frontend → Backend Communication
```javascript
// Frontend makes API calls to backend
const response = await fetch('http://localhost:8000/api/goals/', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  method: 'POST',
  body: JSON.stringify(goalData)
});
```

#### 2. Backend → Analytics Service Communication
```python
# FastAPI backend notifies Spring Boot service
async def notify_analytics_task(goal_id: int, user_id: int):
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.post(
            f"http://analytics:8081/api/analytics/generate-plans",
            json={"goal_id": goal_id, "user_id": user_id}
        )
        return response.status_code == 200
```

#### 3. Database Communication
```python
# FastAPI backend database connection
DATABASE_URL = "postgresql+psycopg://postgres:root123@db:5432/postgres"
```

```properties
# Spring Boot analytics service database connection
spring.datasource.url=jdbc:postgresql://db:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=root123
```

### Data Flow Example: Goal Creation → Plan Generation

1. **User creates goal** in React frontend
2. **Frontend sends POST** to FastAPI backend: `/api/goals/`
3. **FastAPI saves goal** to PostgreSQL database
4. **FastAPI notifies** Spring Boot analytics service: `/api/analytics/generate-plans`
5. **Spring Boot analyzes goal** and creates custom workout plan
6. **Spring Boot saves plan** to PostgreSQL database
7. **User sees plan** in "My Plans" section of frontend

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

## Services Details

### 1. PostgreSQL Database (`fitbuddy_db`)
- **Port:** 5432 (exposed for external access)
- **Database:** postgres
- **User:** postgres
- **Password:** root123 (development) / ${POSTGRES_PASSWORD} (production)
- **Volume:** `postgres_data:/var/lib/postgresql/data`
- **Health Check:** `pg_isready -U postgres -d postgres`

**Key Features:**
- Persistent data storage
- Shared between FastAPI and Spring Boot services
- Automatic initialization with `init.sql`

### 2. FastAPI Backend (`fitbuddy_backend`)
- **Port:** 8000
- **Health Check:** http://localhost:8000/api/health
- **API Docs:** http://localhost:8000/docs
- **Dependencies:** PostgreSQL database

**Key Features:**
- User authentication (JWT)
- Goal management
- Plan subscription system
- Progress tracking
- Database migrations (Alembic)

### 3. Spring Boot Analytics Service (`fitbuddy_analytics`)
- **Port:** 8081
- **Health Check:** http://localhost:8081/api/analytics/system-plans
- **Dependencies:** PostgreSQL database

**Key Features:**
- Automated plan generation
- Goal analysis
- Custom workout plan creation
- Scheduled plan generation (cron jobs)

### 4. React Frontend (`fitbuddy_frontend`)
- **Port:** 3000 (development) / 80 (production)
- **Health Check:** http://localhost/
- **Dependencies:** FastAPI backend

**Key Features:**
- User interface
- Goal creation and tracking
- Plan browsing and subscription
- Progress visualization

## Environment Variables

### Backend (FastAPI) Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql+psycopg://postgres:root123@db:5432/postgres` | Database connection string |
| `JWT_SECRET_KEY` | `your-super-secret-jwt-key-change-in-production` | JWT signing key |
| `JWT_ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Token expiration time |

### Analytics Service (Spring Boot) Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://db:5432/postgres` | Database JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | `postgres` | Database username |
| `SPRING_DATASOURCE_PASSWORD` | `root123` | Database password |

### Frontend Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000` | Backend API URL |

### Database Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_DB` | `postgres` | Database name |
| `POSTGRES_USER` | `postgres` | Database user |
| `POSTGRES_PASSWORD` | `root123` | Database password |

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

### Common Issues & Solutions

#### 1. Port Conflicts
**Problem:** Services can't start because ports are already in use
```bash
# Check which ports are in use
netstat -tulpn | grep :3000
netstat -tulpn | grep :8000
netstat -tulpn | grep :8081
netstat -tulpn | grep :5432

# Kill processes using these ports (if needed)
sudo lsof -ti:3000 | xargs kill -9
sudo lsof -ti:8000 | xargs kill -9
sudo lsof -ti:8081 | xargs kill -9
sudo lsof -ti:5432 | xargs kill -9
```

#### 2. Database Connection Issues
**Problem:** Services can't connect to PostgreSQL
**Symptoms:**
- "Connection refused" errors
- Services start but can't find data
- Analytics service shows "0 users found"

**Solutions:**
```bash
# Check database status
docker-compose ps
docker-compose logs db

# Wait for database to be ready
docker-compose logs db | grep "ready to accept connections"

# Test database connection
docker exec -it fitbuddy_db psql -U postgres -d postgres -c "SELECT 1;"
```

#### 3. Microservice Communication Failures
**Problem:** FastAPI can't reach Spring Boot analytics service
**Symptoms:**
- Plan generation not working
- HTTP timeout errors
- "Connection refused" to analytics service

**Solutions:**
```bash
# Check if analytics service is running
docker-compose ps | grep analytics

# Check analytics service logs
docker-compose logs analytics

# Test analytics service endpoint
curl http://localhost:8081/api/analytics/system-plans

# Check network connectivity between containers
docker exec -it fitbuddy_backend ping analytics
```

#### 4. Data Synchronization Issues
**Problem:** Spring Boot service can't find data created by FastAPI
**Symptoms:**
- Analytics service shows "0 goals found"
- Plan generation fails silently
- Inconsistent data between services

**Solutions:**
```bash
# Check if both services can see the same data
docker exec -it fitbuddy_db psql -U postgres -d postgres -c "SELECT COUNT(*) FROM goals;"
docker exec -it fitbuddy_db psql -U postgres -d postgres -c "SELECT COUNT(*) FROM users;"

# Restart analytics service to refresh database connection
docker-compose restart analytics

# Check analytics service database verification logs
docker-compose logs analytics | grep "Database Verification"
```

#### 5. Frontend Display Issues
**Problem:** Custom plans not showing in UI or white screen
**Symptoms:**
- "My Plans" shows count but no content
- White screen when clicking on plans
- API calls returning empty responses

**Solutions:**
```bash
# Check if API is returning data
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/plans/my-plans

# Check frontend logs
docker-compose logs frontend

# Verify API endpoint is correct
curl http://localhost:8000/api/plans/plan/7
```

#### 6. Build Failures
**Problem:** Docker images fail to build
**Symptoms:**
- "Build failed" errors
- Changes not reflected in running containers
- Outdated code running

**Solutions:**
```bash
# Clear Docker cache and rebuild
docker system prune -a
docker-compose build --no-cache

# Rebuild specific service
docker-compose build backend
docker-compose build frontend
docker-compose build analytics

# Force recreate containers
docker-compose up -d --force-recreate
```

#### 7. Container Health Check Failures
**Problem:** Health checks failing
**Symptoms:**
- Containers showing "unhealthy" status
- Services not responding to health checks

**Solutions:**
```bash
# Check health check status
docker-compose ps

# Check specific service health
curl http://localhost:8000/api/health
curl http://localhost:8081/api/analytics/system-plans
curl http://localhost:3000/

# Restart unhealthy containers
docker-compose restart backend
docker-compose restart analytics
```

### Debug Commands & Logs

```bash
# View all logs
make logs

# View specific service logs
make backend-logs
make frontend-logs
make db-logs

# Access container shells for debugging
make backend-shell
make db-shell

# Check service status
docker-compose ps

# Monitor logs in real-time
docker-compose logs -f backend
docker-compose logs -f analytics
```

### Clean Up Commands

```bash
# Stop and remove containers, networks, and volumes
make clean

# Remove only containers (keeps volumes)
docker-compose down

# Remove containers and volumes (keeps images)
docker-compose down -v

# Remove everything including images
docker-compose down --rmi all -v
```

## Development Workflow

### 1. Making Code Changes
```bash
# 1. Make changes to your code
# 2. Rebuild the affected service
docker-compose build backend
docker-compose build frontend
docker-compose build analytics

# 3. Restart the service
docker-compose up -d backend

# 4. Check logs for any issues
docker-compose logs -f backend
```

### 2. Testing Changes
```bash
# Test API endpoints
curl http://localhost:8000/api/health
curl http://localhost:8081/api/analytics/system-plans

# Test database connectivity
docker exec -it fitbuddy_db psql -U postgres -d postgres -c "SELECT 1;"

# Test frontend
open http://localhost:3000
```

### 3. Debugging Issues
```bash
# Check all service health
docker-compose ps

# View detailed logs
docker-compose logs backend | tail -50
docker-compose logs analytics | tail -50

# Access container for debugging
docker exec -it fitbuddy_backend bash
docker exec -it fitbuddy_analytics bash
```

## Production Deployment

### Environment Setup
```bash
# Set production environment variables
export POSTGRES_PASSWORD=your-secure-password
export JWT_SECRET_KEY=your-super-secret-jwt-key
export API_URL=https://your-domain.com

# Use production compose file
docker-compose -f docker-compose.prod.yml up -d
```

### Security Considerations
- ✅ **Non-root users**: All containers run as non-root users
- ✅ **Environment variables**: Sensitive data via env vars
- ✅ **Health checks**: All services have health monitoring
- ✅ **Resource limits**: Containers have memory/CPU limits
- ⚠️ **Change default passwords** in production
- ⚠️ **Use HTTPS** for production deployments
- ⚠️ **Regular security updates** for base images

## File Structure

```
fitbuddy/
├── Dockerfile.backend          # FastAPI backend Dockerfile
├── docker-compose.yml         # Development compose file
├── docker-compose.prod.yml    # Production compose file
├── docker.env                 # Environment variables
├── init.sql                   # Database initialization script
├── Makefile                   # Convenient commands
├── .dockerignore              # Backend ignore file
├── analytics-service/
│   ├── Dockerfile             # Spring Boot analytics Dockerfile
│   ├── pom.xml                # Maven dependencies
│   └── src/                   # Java source code
├── frontend/
│   ├── Dockerfile             # React frontend Dockerfile
│   ├── nginx.conf             # Nginx configuration
│   └── .dockerignore          # Frontend ignore file
├── docs/
│   ├── SPRING_BOOT_MICROSERVICE_INTEGRATION_GUIDE.md
│   └── LEARNING_GUIDE.md
└── DOCKER_README.md           # This comprehensive guide
```

## Key Learning Points

### Docker Concepts Applied
1. **Multi-stage builds**: Frontend uses Node.js builder + Nginx runtime
2. **Volume persistence**: Database data persists between container restarts
3. **Network isolation**: Services communicate via Docker internal network
4. **Health checks**: Ensure services are ready before dependent services start
5. **Environment variables**: Configuration management across environments

### Microservice Patterns
1. **Service discovery**: Services find each other via container names
2. **Shared database**: Both backend services use the same PostgreSQL instance
3. **Async communication**: FastAPI notifies Spring Boot asynchronously
4. **Graceful degradation**: System continues working even if analytics service fails

### Best Practices Demonstrated
1. **Separation of concerns**: Each service has a single responsibility
2. **Container optimization**: Minimal base images, non-root users
3. **Development workflow**: Easy rebuild and restart for development
4. **Production readiness**: Health checks, environment variables, security

---

**This guide serves as both documentation and a learning resource for understanding Docker-based microservice architectures. Use it as a reference for similar projects and troubleshooting common issues.**
