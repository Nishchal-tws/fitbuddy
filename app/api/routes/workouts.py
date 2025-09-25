from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.workout import WorkoutSession
from app.schemas.workout import WorkoutCreate, WorkoutRead, WorkoutUpdate

router = APIRouter(prefix="/workouts", tags=["workouts"])


@router.post("/", response_model=WorkoutRead, status_code=status.HTTP_201_CREATED)
def create_workout(payload: WorkoutCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
	workout = WorkoutSession(
		title=payload.title,
		notes=payload.notes,
		performed_at=payload.performed_at,
		duration_minutes=payload.duration_minutes,
		owner_id=current_user.id,
	)
	db.add(workout)
	db.commit()
	db.refresh(workout)
	return workout


@router.get("/", response_model=list[WorkoutRead])
def list_workouts(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
	rows = db.execute(
		select(WorkoutSession).where(WorkoutSession.owner_id == current_user.id).order_by(WorkoutSession.performed_at.desc())
	).scalars().all()
	return rows


@router.get("/{workout_id}", response_model=WorkoutRead)
def get_workout(workout_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
	workout = db.get(WorkoutSession, workout_id)
	if not workout or workout.owner_id != current_user.id:
		raise HTTPException(status_code=404, detail="Workout not found")
	return workout


@router.patch("/{workout_id}", response_model=WorkoutRead)
def update_workout(workout_id: int, payload: WorkoutUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
	workout = db.get(WorkoutSession, workout_id)
	if not workout or workout.owner_id != current_user.id:
		raise HTTPException(status_code=404, detail="Workout not found")
	data = payload.model_dump(exclude_unset=True)
	for k, v in data.items():
		setattr(workout, k, v)
	db.add(workout)
	db.commit()
	db.refresh(workout)
	return workout


@router.delete("/{workout_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workout(workout_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
	workout = db.get(WorkoutSession, workout_id)
	if not workout or workout.owner_id != current_user.id:
		raise HTTPException(status_code=404, detail="Workout not found")
	db.delete(workout)
	db.commit()
	return None
