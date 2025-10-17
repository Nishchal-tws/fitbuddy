from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import Session
from typing import List, Optional

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.workout import Workout, SavedPlan
from app.models.goal import Goal
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
    Get all plans that the current user has subscribed to, plus their custom goal-based plans.
    """
    print(f"DEBUG: Getting plans for user {current_user.id} ({current_user.email})")
    
    # Get subscribed plans
    saved_plans = db.execute(
        select(SavedPlan).where(SavedPlan.user_id == current_user.id)
        .order_by(SavedPlan.id.desc())
    ).scalars().all()
    print(f"DEBUG: Found {len(saved_plans)} subscribed plans")
    
    # Get custom plans created for this user (goal-based plans)
    # Only include plans from incomplete goals (since completed goals should have their plans deleted)
    custom_plans = db.execute(
        select(Workout).where(
            and_(
                Workout.owner_id == current_user.id,
                or_(
                    Workout.goal_id.is_(None),  # Plans without goal association (legacy)
                    Goal.is_completed == False  # Plans from incomplete goals
                )
            )
        ).outerjoin(Goal, Workout.goal_id == Goal.id)
        .order_by(Workout.created_at.desc())
    ).scalars().all()
    print(f"DEBUG: Found {len(custom_plans)} custom plans")
    
    # Debug: Print the actual query result
    for plan in custom_plans:
        print(f"DEBUG: Custom plan found - ID: {plan.id}, Title: {plan.title}, Owner: {plan.owner_id}")
    
    # Convert custom plans to SavedPlan format for consistency
    custom_saved_plans = []
    for plan in custom_plans:
        print(f"DEBUG: Converting custom plan {plan.id}: {plan.title}")
        # Create a virtual SavedPlan entry for custom plans
        custom_saved_plan = SavedPlan(
            id=plan.id + 1000000,  # Use a high offset to avoid conflicts
            user_id=current_user.id,
            workout_id=plan.id,
            start_date=None  # Custom plans don't have a start date initially
        )
        custom_saved_plans.append(custom_saved_plan)
    
    # Combine both lists
    all_plans = saved_plans + custom_saved_plans
    print(f"DEBUG: Total plans to return: {len(all_plans)}")
    
    # Sort by creation date (most recent first)
    # Handle mixed types: datetime for subscribed plans, int for custom plans
    def sort_key(plan):
        if plan.start_date:
            return plan.start_date
        else:
            # For custom plans without start_date, use a very old date
            from datetime import datetime, timedelta
            return datetime.now() - timedelta(days=365)  # Put custom plans at the end
    
    all_plans.sort(key=sort_key, reverse=True)
    
    # Debug: Return debug info in response
    if len(all_plans) == 0:
        print("DEBUG: No plans found - this might be the issue!")
        # Let's try a direct database query to debug
        direct_query = db.execute(select(Workout).where(Workout.owner_id == current_user.id)).scalars().all()
        print(f"DEBUG: Direct query found {len(direct_query)} plans")
        for plan in direct_query:
            print(f"DEBUG: Direct query plan - ID: {plan.id}, Title: {plan.title}")
        
        # Return debug info instead of empty list
        return [{
            "id": 999999,
            "user_id": current_user.id,
            "workout_id": 0,
            "start_date": None,
            "debug_info": {
                "user_id": current_user.id,
                "custom_plans_found": len(custom_plans),
                "subscribed_plans_found": len(saved_plans),
                "direct_query_found": len(direct_query),
                "custom_plans": [{"id": p.id, "title": p.title, "owner_id": p.owner_id} for p in custom_plans],
                "direct_query_plans": [{"id": p.id, "title": p.title, "owner_id": p.owner_id} for p in direct_query]
            }
        }]
    
    return all_plans


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


@router.get("/debug/{user_id}")
def debug_user_plans(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Debug endpoint to check user plans.
    """
    # Get custom plans for the user
    custom_plans = db.execute(
        select(Workout).where(Workout.owner_id == user_id)
    ).scalars().all()
    
    result = {
        "user_id": user_id,
        "custom_plans_count": len(custom_plans),
        "custom_plans": []
    }
    
    for plan in custom_plans:
        result["custom_plans"].append({
            "id": plan.id,
            "title": plan.title,
            "owner_id": plan.owner_id
        })
    
    return result

@router.get("/test-debug")
def test_debug(
    db: Session = Depends(get_db)
):
    """
    Simple test endpoint to check database connection.
    """
    # Test basic database query
    all_workouts = db.execute(select(Workout)).scalars().all()
    
    result = {
        "total_workouts": len(all_workouts),
        "workouts": []
    }
    
    for workout in all_workouts:
        result["workouts"].append({
            "id": workout.id,
            "title": workout.title,
            "owner_id": workout.owner_id
        })
    
    return result


@router.get("/plan/{plan_id}", response_model=PlanRead)
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


@router.get("/plan/{plan_id}/exercises")
def get_plan_exercises(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get exercises for a specific workout plan.
    Generates exercises based on plan level and type.
    """
    plan = db.get(Workout, plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    # Check if user has access to this plan (either subscribed or it's their custom plan)
    if plan.owner_id != current_user.id:
        # Check if user is subscribed to this plan
        saved_plan = db.execute(
            select(SavedPlan).where(
                SavedPlan.user_id == current_user.id,
                SavedPlan.workout_id == plan_id
            )
        ).scalar_one_or_none()
        
        if not saved_plan:
            raise HTTPException(status_code=403, detail="Access denied")
    
    # Generate exercises based on plan characteristics
    exercises = generate_exercises_for_plan(plan)
    
    return {
        "plan_id": plan_id,
        "plan_title": plan.title,
        "plan_level": plan.level,
        "plan_duration": plan.duration_days,
        "exercises": exercises
    }


def generate_exercises_for_plan(plan):
    """
    Generate exercises for a workout plan based on its level and characteristics.
    """
    level = plan.level.lower() if plan.level else "beginner"
    duration = plan.duration_days or 30
    
    # Define exercise templates based on level
    exercise_templates = {
        "beginner": [
            {"name": "Push-ups", "sets": 3, "reps": "8-12", "rest": "60s", "category": "Strength"},
            {"name": "Bodyweight Squats", "sets": 3, "reps": "10-15", "rest": "60s", "category": "Strength"},
            {"name": "Plank", "sets": 3, "reps": "30-45s", "rest": "60s", "category": "Core"},
            {"name": "Walking", "sets": 1, "reps": "20-30 min", "rest": "0s", "category": "Cardio"},
            {"name": "Jumping Jacks", "sets": 3, "reps": "15-20", "rest": "45s", "category": "Cardio"}
        ],
        "intermediate": [
            {"name": "Push-ups", "sets": 4, "reps": "12-15", "rest": "60s", "category": "Strength"},
            {"name": "Squats", "sets": 4, "reps": "12-15", "rest": "60s", "category": "Strength"},
            {"name": "Lunges", "sets": 3, "reps": "10-12 each", "rest": "60s", "category": "Strength"},
            {"name": "Plank", "sets": 3, "reps": "45-60s", "rest": "60s", "category": "Core"},
            {"name": "Mountain Climbers", "sets": 3, "reps": "20-30", "rest": "45s", "category": "Cardio"},
            {"name": "Burpees", "sets": 3, "reps": "8-12", "rest": "90s", "category": "Cardio"}
        ],
        "advanced": [
            {"name": "Push-ups", "sets": 4, "reps": "15-20", "rest": "60s", "category": "Strength"},
            {"name": "Pistol Squats", "sets": 3, "reps": "5-8 each", "rest": "90s", "category": "Strength"},
            {"name": "Pull-ups", "sets": 4, "reps": "8-12", "rest": "90s", "category": "Strength"},
            {"name": "Handstand Push-ups", "sets": 3, "reps": "3-5", "rest": "120s", "category": "Strength"},
            {"name": "Plank", "sets": 3, "reps": "60-90s", "rest": "60s", "category": "Core"},
            {"name": "Burpees", "sets": 4, "reps": "12-15", "rest": "90s", "category": "Cardio"},
            {"name": "Sprint Intervals", "sets": 1, "reps": "10x 30s", "rest": "30s", "category": "Cardio"}
        ]
    }
    
    # Get exercises for the plan level
    base_exercises = exercise_templates.get(level, exercise_templates["beginner"])
    
    # Adjust exercises based on plan duration
    if duration <= 14:
        # Short plan - focus on core exercises
        exercises = base_exercises[:4]
    elif duration <= 30:
        # Medium plan - include all exercises
        exercises = base_exercises
    else:
        # Long plan - add more variety
        exercises = base_exercises + [
            {"name": "Dead Bug", "sets": 3, "reps": "10-12 each", "rest": "60s", "category": "Core"},
            {"name": "Russian Twists", "sets": 3, "reps": "20-30", "rest": "60s", "category": "Core"}
        ]
    
    return exercises