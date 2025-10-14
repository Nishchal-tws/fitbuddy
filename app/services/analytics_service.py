import httpx
import logging
from typing import Optional
from app.services.rabbitmq_service import rabbitmq_service
from app.services.redis_service import redis_service

logger = logging.getLogger(__name__)

class AnalyticsServiceClient:
    def __init__(self, base_url: str = "http://analytics:8081"):
        self.base_url = base_url
        
    async def notify_new_goal(self, goal_id: int = None, user_id: int = None) -> bool:
        """
        Notify the analytics service about a new goal that needs a plan generated.
        Uses RabbitMQ for background processing instead of direct HTTP calls.
        """
        try:
            # Publish message to RabbitMQ for background processing
            success = rabbitmq_service.publish_progress_analysis(
                user_id=user_id,
                analysis_type="goal_analysis",
                period="immediate"
            )
            
            if success:
                logger.info(f"Successfully queued goal analysis for goal {goal_id}, user {user_id}")
                return True
            else:
                logger.error(f"Failed to queue goal analysis for goal {goal_id}")
                return False
                    
        except Exception as e:
            logger.error(f"Unexpected error queuing goal analysis: {e}")
            return False
    
    async def seed_system_plans(self) -> bool:
        """
        Seed system workout plans in the analytics service.
        Keep this as HTTP call since it's a one-time admin operation.
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
    
    async def calculate_calories(self, workout_id: int, duration_minutes: int) -> Optional[float]:
        """
        Calculate calories burned for a workout session.
        Uses hybrid approach: Check cache first, then queue for processing.
        """
        try:
            # Check Redis cache first
            cache_key = f"calories:workout:{workout_id}:duration:{duration_minutes}"
            cached_calories = redis_service.get(cache_key)
            
            if cached_calories is not None:
                logger.info(f"Retrieved cached calories for workout {workout_id}: {cached_calories}")
                return float(cached_calories)
            
            # If not in cache, publish to RabbitMQ for background processing
            success = rabbitmq_service.publish_workout_processing(
                workout_id=workout_id,
                user_id=1  # We'll get this from the workout data in the queue processor
            )
            
            if success:
                logger.info(f"Queued calorie calculation for workout {workout_id}")
                # Return a default estimate while processing in background
                estimated_calories = duration_minutes * 8.0  # Rough estimate
                return estimated_calories
            else:
                logger.error(f"Failed to queue calorie calculation for workout {workout_id}")
                return None
                    
        except Exception as e:
            logger.error(f"Unexpected error calculating calories: {e}")
            return None
    
    async def get_cached_calories(self, workout_id: int, duration_minutes: int) -> Optional[float]:
        """
        Get cached calorie calculation result.
        """
        try:
            cache_key = f"calories:workout:{workout_id}:duration:{duration_minutes}"
            cached_calories = redis_service.get(cache_key)
            
            if cached_calories is not None:
                return float(cached_calories)
            return None
            
        except Exception as e:
            logger.error(f"Error getting cached calories: {e}")
            return None
    
    async def trigger_weekly_analysis(self, user_id: int) -> bool:
        """
        Trigger weekly progress analysis for a user.
        """
        try:
            success = rabbitmq_service.publish_progress_analysis(
                user_id=user_id,
                analysis_type="weekly",
                period="current_week"
            )
            
            if success:
                logger.info(f"Queued weekly analysis for user {user_id}")
                return True
            else:
                logger.error(f"Failed to queue weekly analysis for user {user_id}")
                return False
                
        except Exception as e:
            logger.error(f"Error triggering weekly analysis: {e}")
            return False
    
    async def trigger_monthly_analysis(self, user_id: int) -> bool:
        """
        Trigger monthly progress analysis for a user.
        """
        try:
            success = rabbitmq_service.publish_progress_analysis(
                user_id=user_id,
                analysis_type="monthly",
                period="current_month"
            )
            
            if success:
                logger.info(f"Queued monthly analysis for user {user_id}")
                return True
            else:
                logger.error(f"Failed to queue monthly analysis for user {user_id}")
                return False
                
        except Exception as e:
            logger.error(f"Error triggering monthly analysis: {e}")
            return False
    
    async def generate_report(self, user_id: int, report_type: str) -> bool:
        """
        Generate automated report for a user.
        """
        try:
            success = rabbitmq_service.publish_report_generation(
                user_id=user_id,
                report_type=report_type
            )
            
            if success:
                logger.info(f"Queued {report_type} report generation for user {user_id}")
                return True
            else:
                logger.error(f"Failed to queue {report_type} report generation for user {user_id}")
                return False
                
        except Exception as e:
            logger.error(f"Error generating report: {e}")
            return False

# Global instance
analytics_client = AnalyticsServiceClient()