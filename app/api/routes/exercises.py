from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.exercise import Exercise
from app.schemas.exercise import ExerciseCreate, ExerciseRead, ExerciseUpdate

router = APIRouter(prefix="/exercises", tags=["exercises"])


@router.post("/", response_model=ExerciseRead, status_code=status.HTTP_201_CREATED)
def create_exercise(payload: ExerciseCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
	ex = Exercise(
		name=payload.name,
		category=payload.category,
		description=payload.description,
		owner_id=current_user.id,
	)
	db.add(ex)
	db.commit()
	db.refresh(ex)
	return ex


@router.get("/", response_model=list[ExerciseRead])
def list_exercises(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Use raw SQL to avoid SQLAlchemy relationship issues
    result = db.execute(text("""
        SELECT id, name, category, description, owner_id 
        FROM exercises 
        WHERE owner_id IS NULL OR owner_id = :user_id
        ORDER BY name
    """), {"user_id": current_user.id})
    
    exercises = []
    for row in result.fetchall():
        exercises.append({
            "id": row[0],
            "name": row[1],
            "category": row[2],
            "description": row[3],
            "owner_id": row[4]
        })
    
    return exercises


@router.get("/{exercise_id}", response_model=ExerciseRead)
def get_exercise(exercise_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
	ex = db.get(Exercise, exercise_id)
	if not ex or ex.owner_id != current_user.id:
		raise HTTPException(status_code=404, detail="Exercise not found")
	return ex


@router.patch("/{exercise_id}", response_model=ExerciseRead)
def update_exercise(exercise_id: int, payload: ExerciseUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
	ex = db.get(Exercise, exercise_id)
	if not ex or ex.owner_id != current_user.id:
		raise HTTPException(status_code=404, detail="Exercise not found")
	data = payload.model_dump(exclude_unset=True) # .model_dump is used to convert the pydantic model to a dictionary and the exclude_unset = True is used to ignore everything else that has been default value or was not provided
	for key, value in data.items():
		setattr(ex, key, value)
	db.add(ex)
	db.commit()
	db.refresh(ex)
	return ex


@router.delete("/{exercise_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_exercise(exercise_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
	ex = db.get(Exercise, exercise_id)
	if not ex or ex.owner_id != current_user.id:
		raise HTTPException(status_code=404, detail="Exercise not found")
	db.delete(ex)
	db.commit()
	return None


