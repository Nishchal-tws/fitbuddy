from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, and_
from sqlalchemy.orm import Session
from typing import List, Optional

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.workout import Workout, SavedPlan
from app.schemas.plan import PlanRead, SavedPlanCreate, SavedPlanRead

router = APIRouter(prefix="/plans", tags=["plans"])


@router.get("/", response_model=List[PlanRead])
def list_plans(
    level: Optional[str] = Query(None, description="Filter by experience level (beginner, intermediate, advanced)"),
    db: Session = Depends(get_db)
):
    """
    Get all available workout plans (system plans where owner_id is NULL).
    Can filter by experience level.
    """
    query = select(Workout).where(Workout.owner_id.is_(None))
    
    if level:
        query = query.where(Workout.level == level.lower())
    
    plans = db.execute(query.order_by(Workout.created_at.desc())).scalars().all()
    return plans


@router.get("/my-plans", response_model=List[SavedPlanRead])
def get_user_plans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all plans that the current user has subscribed to.
    """
    saved_plans = db.execute(
        select(SavedPlan).where(SavedPlan.user_id == current_user.id)
        .order_by(SavedPlan.id.desc())
    ).scalars().all()
    
    return saved_plans


@router.post("/subscribe/{plan_id}", response_model=SavedPlanRead, status_code=status.HTTP_201_CREATED)
def subscribe_to_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Subscribe the current user to a specific workout plan.
    """
    # Check if the plan exists and is a system plan
    plan = db.get(Workout, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    if plan.owner_id is not None:
        raise HTTPException(status_code=400, detail="Cannot subscribe to user-specific plans")
    
    # Check if user is already subscribed to this plan
    existing_subscription = db.execute(
        select(SavedPlan).where(
            and_(
                SavedPlan.user_id == current_user.id,
                SavedPlan.workout_id == plan_id
            )
        )
    ).scalar_one_or_none()
    
    if existing_subscription:
        raise HTTPException(status_code=400, detail="Already subscribed to this plan")
    
    # Create new subscription
    saved_plan = SavedPlan(
        user_id=current_user.id,
        workout_id=plan_id
    )
    
    db.add(saved_plan)
    db.commit()
    db.refresh(saved_plan)
    
    return saved_plan


@router.delete("/unsubscribe/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def unsubscribe_from_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Unsubscribe the current user from a specific workout plan.
    """
    saved_plan = db.execute(
        select(SavedPlan).where(
            and_(
                SavedPlan.user_id == current_user.id,
                SavedPlan.workout_id == plan_id
            )
        )
    ).scalar_one_or_none()
    
    if not saved_plan:
        raise HTTPException(status_code=404, detail="Subscription not found")
    
    db.delete(saved_plan)
    db.commit()
    
    return None


@router.get("/{plan_id}", response_model=PlanRead)
def get_plan(
    plan_id: int,
    db: Session = Depends(get_db)
):
    """
    Get details of a specific workout plan.
    """
    plan = db.get(Workout, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    return plan