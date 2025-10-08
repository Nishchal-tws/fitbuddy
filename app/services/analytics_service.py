import httpx
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class AnalyticsServiceClient:
    def __init__(self, base_url: str = "http://localhost:8081"):
        self.base_url = base_url
        
    async def notify_new_goal(self, goal_id: int = None, user_id: int = None) -> bool:
        """
        Notify the analytics service about a new goal that needs a plan generated.
        If goal_id is None, triggers general plan generation.
        """
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                if goal_id is not None:
                    response = await client.post(
                        f"{self.base_url}/api/analytics/generate-plans",
                        json={"goal_id": goal_id, "user_id": user_id}
                    )
                else:
                    response = await client.post(
                        f"{self.base_url}/api/analytics/generate-plans"
                    )
                
                if response.status_code == 200:
                    logger.info(f"Successfully notified analytics service about goal {goal_id}")
                    return True
                else:
                    logger.error(f"Analytics service returned status {response.status_code}: {response.text}")
                    return False
                    
        except httpx.TimeoutException:
            logger.error("Timeout while notifying analytics service")
            return False
        except httpx.ConnectError:
            logger.error("Could not connect to analytics service")
            return False
        except Exception as e:
            logger.error(f"Unexpected error notifying analytics service: {e}")
            return False
    
    async def seed_system_plans(self) -> bool:
        """
        Seed system workout plans in the analytics service.
        """
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/api/analytics/seed-plans"
                )
                
                if response.status_code == 200:
                    logger.info("Successfully seeded system plans")
                    return True
                else:
                    logger.error(f"Failed to seed plans: {response.status_code} - {response.text}")
                    return False
                    
        except Exception as e:
            logger.error(f"Error seeding system plans: {e}")
            return False

# Global instance
analytics_client = AnalyticsServiceClient()
