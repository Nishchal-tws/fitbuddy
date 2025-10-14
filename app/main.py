from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.db.session import engine, Base
from sqlalchemy import inspect, text
from app.api.routes import auth as auth_routes
from app.api.routes import exercises as exercises_routes
from app.api.routes import workouts as workouts_routes
from app.api.routes import goals as goals_routes
from app.api.routes import users as users_routes
from app.api.routes import plans as plans_routes
from app.api.routes import progress as progress_routes
from app.api.routes import admin as admin_routes
from app.api.routes import health as health_routes
from app.api.routes import reports as reports_routes
import app.db.base  # noqa: F401  # ensure models are imported


settings = get_settings()
app = FastAPI(title=settings.app_name)

origins = [
    "http://localhost:3000",  # Your current React port
    "http://localhost:5173",  # The default Vite port
    "http://localhost",
    "http://127.0.0.1:3000",  # Alternative localhost format
    "http://127.0.0.1:5173",  # Alternative localhost format
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    # Safe migration: add duration_minutes to workout_sessions if missing
    try:
        with engine.connect() as connection:
            inspector = inspect(connection)
            columns = [col["name"] for col in inspector.get_columns("workout_sessions")]
            if "duration_minutes" not in columns:
                connection.execute(text("ALTER TABLE workout_sessions ADD COLUMN duration_minutes INTEGER"))
                connection.commit()
    except Exception:
        # Ignore if database doesn't support ALTER or table doesn't exist yet
        pass


@app.options("/{path:path}")
def options_handler(path: str):
    """Handle CORS preflight requests"""
    return {"message": "OK"}

@app.get("/api/health")
def health_check():
    """Health check endpoint for Docker"""
    return {"status": "healthy", "message": "FitBuddy API is running"}

app.include_router(auth_routes.router, prefix="/api")
app.include_router(exercises_routes.router, prefix="/api")
app.include_router(workouts_routes.router, prefix="/api")
app.include_router(goals_routes.router, prefix="/api")
app.include_router(progress_routes.router, prefix="/api")
app.include_router(users_routes.router, prefix="/api")
app.include_router(plans_routes.router, prefix="/api")
app.include_router(admin_routes.router, prefix="/api")
app.include_router(health_routes.router, prefix="/api")
app.include_router(reports_routes.router, prefix="/api")
