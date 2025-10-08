# FitBuddy Microservice Docker Setup Guide

## 🐳 Complete Docker Setup

You're absolutely right! With Docker, you don't need to run services separately. Here's how to run the complete microservice architecture:

## Quick Start

```bash
# 1. Build and start all services
docker-compose up --build

# 2. Seed system plans (run this after services are healthy)
curl -X POST http://localhost:8000/api/admin/seed-plans

# 3. Run integration test
python test_integration.py

# 4. Access the application
# Frontend: http://localhost:3000
# FastAPI: http://localhost:8000/docs
# Spring Boot: http://localhost:8081/api/analytics/system-plans
```

## 🏗️ Architecture Overview

Your Docker setup now includes:

- **Database**: PostgreSQL on port 5432
- **FastAPI Backend**: Port 8000 (handles real-time requests)
- **Spring Boot Analytics**: Port 8081 (intelligent plan generation)
- **React Frontend**: Port 3000 (user interface)

## 📋 Services

### 1. Database (PostgreSQL)
- **Container**: `fitbuddy_db`
- **Port**: 5432
- **Health Check**: Automatic PostgreSQL readiness check

### 2. FastAPI Backend
- **Container**: `fitbuddy_backend`
- **Port**: 8000
- **Features**: 
  - User authentication
  - Goal management
  - Plan browsing/subscription
  - Workout logging
  - Analytics service communication

### 3. Spring Boot Analytics
- **Container**: `fitbuddy_analytics`
- **Port**: 8081
- **Features**:
  - Intelligent plan generation
  - Goal analysis
  - Scheduled processing (nightly at 2 AM)
  - System plan management

### 4. React Frontend
- **Container**: `fitbuddy_frontend`
- **Port**: 3000
- **Features**:
  - User authentication
  - Dashboard
  - Goals management
  - Plans browsing and subscription
  - Progress tracking

## 🚀 Testing Both Flows

### Flow 1: Goal-Driven Plan Generation
1. Go to http://localhost:3000
2. Register/Login as a user
3. Create a goal like "Lose 5kg in 2 months"
4. Wait a few seconds (or trigger manually)
5. Check Plans page for your custom generated plan

### Flow 2: Direct Plan Selection
1. Go to Plans page
2. Browse available system plans
3. Filter by experience level (Beginner/Intermediate/Advanced)
4. Subscribe to a plan
5. View your subscribed plans in "My Plans" tab

## 🔧 Management Commands

```bash
# View logs
docker-compose logs -f                    # All services
docker-compose logs -f backend           # FastAPI only
docker-compose logs -f analytics         # Spring Boot only
docker-compose logs -f frontend          # React only

# Restart specific service
docker-compose restart analytics

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up --build --force-recreate

# Check service health
docker-compose ps
```

## 🧪 Testing

```bash
# Run full integration test
python test_integration.py

# Test specific flows
python test_integration.py --local        # If running services locally

# Manual API testing
curl http://localhost:8000/api/health
curl http://localhost:8081/api/analytics/system-plans
```

## 🔍 Monitoring

### Health Checks
All services have built-in health checks:
- **Database**: PostgreSQL connection test
- **FastAPI**: HTTP health endpoint
- **Spring Boot**: Analytics API endpoint
- **Frontend**: Web server availability

### Logs
```bash
# Real-time monitoring
docker-compose logs -f --tail=100

# Specific service logs
docker-compose logs analytics | grep "Plan Generation"
docker-compose logs backend | grep "Goal"
```

## 🛠️ Development

### Making Changes
1. **Code Changes**: Edit files in your IDE
2. **Restart Service**: `docker-compose restart [service-name]`
3. **Full Rebuild**: `docker-compose up --build`

### Database Migrations
```bash
# Run migrations (automatic on startup)
docker-compose exec backend alembic upgrade head

# Create new migration
docker-compose exec backend alembic revision --autogenerate -m "Description"
```

## 🎯 Key Benefits

1. **One Command Setup**: `docker-compose up` starts everything
2. **Isolated Services**: Each service runs in its own container
3. **Automatic Dependencies**: Services start in correct order
4. **Health Monitoring**: Built-in health checks
5. **Easy Scaling**: Can scale individual services
6. **Development Friendly**: Hot reloading for development

## 🚨 Troubleshooting

### Services Not Starting
```bash
# Check service status
docker-compose ps

# Check logs for errors
docker-compose logs [service-name]

# Restart everything
docker-compose down && docker-compose up --build
```

### Database Connection Issues
```bash
# Check database logs
docker-compose logs db

# Test database connection
docker-compose exec backend python -c "from app.db.session import engine; print('DB Connected')"
```

### Spring Boot Not Generating Plans
```bash
# Check analytics logs
docker-compose logs analytics

# Manual trigger
curl -X POST http://localhost:8081/api/analytics/generate-plans

# Check if goals exist
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/goals/
```

This Docker setup gives you a complete, production-ready microservice architecture that you can start with a single command! 🎉
