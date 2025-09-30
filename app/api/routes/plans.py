from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.models.workout import Workout
from app.schemas.workout import WorkoutRead


router = APIRouter(prefix="/plans", tags=["plans"])


@router.get("/", response_model=list[WorkoutRead])
def list_plans(level: str | None = Query(default=None), db: Session = Depends(get_db)):
	stmt = select(Workout).where(Workout.owner_id.is_(None))
	if level:
		stmt = stmt.where(Workout.level == level)
	rows = db.execute(stmt).scalars().all()
	return rows


