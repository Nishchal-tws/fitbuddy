from fastapi import FastAPI
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
import app.db.base  # noqa: F401  # ensure models are imported


settings = get_settings()
app = FastAPI(title=settings.app_name)

origins = [
    "http://localhost:5173",
    "http://localhost",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]

)
@app.lifespan("startup")
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


app.include_router(auth_routes.router, prefix="/api")
app.include_router(exercises_routes.router, prefix="/api")
app.include_router(workouts_routes.router, prefix="/api")
app.include_router(goals_routes.router, prefix="/api")
app.include_router(progress_routes.router, prefix="/api")
app.include_router(users_routes.router, prefix="/api")
app.include_router(plans_routes.router, prefix="/api")
