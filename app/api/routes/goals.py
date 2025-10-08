from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session
import asyncio
import logging

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.goal import Goal
from app.schemas.goal import GoalCreate, GoalRead, GoalUpdate
from app.services.analytics_service import analytics_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/goals", tags=["goals"])


@router.post("/", response_model=GoalRead, status_code=status.HTTP_201_CREATED)
async def create_goal(payload: GoalCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
	goal = Goal(
		title=payload.title,
		description=payload.description,
		target_date=payload.target_date,
		is_completed=payload.is_completed,
		owner_id=current_user.id,
	)
	db.add(goal)
	db.commit()
	db.refresh(goal)

	# Internal async helper to handle notification safely
	async def notify_analytics_task(goal_id: int, user_id: int):
		try:
			success = await analytics_client.notify_new_goal(goal_id, user_id)
			if success:
				logger.info(f"✅ Analytics service notified successfully for goal {goal_id}")
			else:
				logger.warning(f"⚠️ Analytics service responded but did not confirm success for goal {goal_id}")
		except Exception as e:
			logger.error(f"❌ Error while notifying analytics service for goal {goal_id}: {e}")

	# Notify analytics service about new goal (async, non-blocking)
	try:
		asyncio.create_task(notify_analytics_task(goal.id, current_user.id))
		logger.info(f"Goal {goal.id} created for user {current_user.id}, analytics service notification scheduled")
	except Exception as e:
		logger.error(f"Failed to schedule analytics service notification: {e}")
		# Don't fail the goal creation if analytics notification fails

	return goal


@router.get("/", response_model=list[GoalRead])
def list_goals(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
	rows = db.execute(select(Goal).where(Goal.owner_id == current_user.id).order_by(Goal.id.desc())).scalars().all()
	return rows


@router.get("/{goal_id}", response_model=GoalRead)
def get_goal(goal_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
	goal = db.get(Goal, goal_id)
	if not goal or goal.owner_id != current_user.id:
		raise HTTPException(status_code=404, detail="Goal not found")
	return goal


@router.patch("/{goal_id}", response_model=GoalRead)
def update_goal(goal_id: int, payload: GoalUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
	goal = db.get(Goal, goal_id)
	if not goal or goal.owner_id != current_user.id:
		raise HTTPException(status_code=404, detail="Goal not found")
	data = payload.model_dump(exclude_unset=True)
	for k, v in data.items():
		setattr(goal, k, v)
	db.add(goal)
	db.commit()
	db.refresh(goal)
	return goal


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(goal_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
	goal = db.get(Goal, goal_id)
	if not goal or goal.owner_id != current_user.id:
		raise HTTPException(status_code=404, detail="Goal not found")
	db.delete(goal)
	db.commit()
	return None

