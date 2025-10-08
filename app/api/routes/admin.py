from fastapi import APIRouter, Depends, HTTPException, status
from app.services.analytics_service import analytics_client
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/seed-plans")
async def seed_system_plans():
    """
    Seed system workout plans in the analytics service.
    This should be called once during setup.
    """
    try:
        success = await analytics_client.seed_system_plans()
        if success:
            return {"message": "System plans seeded successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to seed system plans"
            )
    except Exception as e:
        logger.error(f"Error seeding system plans: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error seeding system plans: {str(e)}"
        )


@router.post("/trigger-plan-generation")
async def trigger_plan_generation():
    """
    Manually trigger plan generation for new goals.
    """
    try:
        success = await analytics_client.notify_new_goal(None, None)
        if success:
            return {"message": "Plan generation triggered successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to trigger plan generation"
            )
    except Exception as e:
        logger.error(f"Error triggering plan generation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error triggering plan generation: {str(e)}"
        )
