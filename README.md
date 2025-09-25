# Fitness Journal System — FastAPI Backend

This is the Week 2 deliverable: a complete backend foundation built with FastAPI, SQLAlchemy, and PostgreSQL-compatible configuration. It includes JWT authentication, user-scoped CRUD for workouts, goals, and progress, and a private exercise library per user.

## Quickstart

1) Create and activate a virtualenv (Windows PowerShell):

```bash
python -m venv venv
./venv/Scripts/Activate.ps1
```

2) Install dependencies:

```bash
pip install -r requirements.txt
```

3) Set environment variables (optional). Defaults are sensible for local dev:

```bash
# Example for local PostgreSQL
$env:DATABASE_URL = "postgresql+psycopg2://postgres:postgres@localhost:5432/fitbuddy"
# Secret used to sign JWTs. Use a long random string in real environments.
$env:JWT_SECRET_KEY = "devsupersecret"
$env:JWT_ALGORITHM = "HS256"
$env:ACCESS_TOKEN_EXPIRE_MINUTES = "60"
```

If you don't set `DATABASE_URL`, the app will fall back to a local SQLite database file `sqlite:///./fitbuddy.db` for easy local runs.

4) Run the server:

```bash
uvicorn app.main:app --reload
```

Open the interactive docs at `http://127.0.0.1:8000/docs`.

## Features

- User registration and login with JWT auth (passwords hashed via passlib-bcrypt)
- Private Exercise library per user (CRUD)
- WorkoutSession, Goal, and Progress — fully user-scoped CRUD
- Pydantic models for validation; sensitive fields excluded from responses
- Auto-creates database tables at startup

## Project Structure

```
app/
  api/
    routes/
      __init__.py
      auth.py
      exercises.py
      goals.py
      progress.py
      workouts.py
    deps.py
  core/
    config.py
  db/
    base.py
    session.py
  models/
    __init__.py
    goal.py
    progress.py
    user.py
    workout.py
    exercise.py
  schemas/
    __init__.py
    auth.py
    exercise.py
    goal.py
    progress.py
    user.py
    workout.py
  security.py
  main.py
```

## Notes
- Alembic is included in requirements for future migrations, but not required for Week 2; tables are created at startup via SQLAlchemy `create_all`.
- Switch to PostgreSQL by setting `DATABASE_URL` as shown above.

