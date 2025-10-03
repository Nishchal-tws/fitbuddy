from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.exercise import Exercise
from app.models.user import User
from app.models.workout import WorkoutSession, Workout
from app.models.goal import Goal
from app.models.progress import Progress
from datetime import date, timedelta
import random


SYSTEM_EXERCISES = [
	# Cardio Exercises (10)
	{"name": "Running", "category": "Cardio", "description": "Aerobic exercise that improves cardiovascular health and burns calories effectively."},
	{"name": "Cycling", "category": "Cardio", "description": "Low-impact cardio exercise that strengthens legs and improves endurance."},
	{"name": "Swimming", "category": "Cardio", "description": "Full-body cardio workout that's easy on joints and builds endurance."},
	{"name": "Jump Rope", "category": "Cardio", "description": "High-intensity cardio exercise that improves coordination and burns calories quickly."},
	{"name": "Rowing", "category": "Cardio", "description": "Full-body cardio workout that engages both upper and lower body muscles."},
	{"name": "Elliptical", "category": "Cardio", "description": "Low-impact cardio machine that provides a full-body workout."},
	{"name": "Stair Climbing", "category": "Cardio", "description": "High-intensity cardio exercise that strengthens legs and glutes."},
	{"name": "Dancing", "category": "Cardio", "description": "Fun cardio exercise that improves coordination and burns calories."},
	{"name": "Boxing", "category": "Cardio", "description": "High-intensity cardio workout that improves agility and upper body strength."},
	{"name": "HIIT", "category": "Cardio", "description": "High-Intensity Interval Training that maximizes calorie burn in minimal time."},
	
	# Strength Exercises (10)
	{"name": "Push-ups", "category": "Strength", "description": "Bodyweight exercise that strengthens chest, shoulders, and triceps."},
	{"name": "Pull-ups", "category": "Strength", "description": "Upper body exercise that targets back, biceps, and shoulders."},
	{"name": "Squats", "category": "Strength", "description": "Compound exercise that strengthens legs, glutes, and core."},
	{"name": "Deadlifts", "category": "Strength", "description": "Full-body compound movement that builds overall strength and power."},
	{"name": "Bench Press", "category": "Strength", "description": "Upper body exercise that targets chest, shoulders, and triceps."},
	{"name": "Overhead Press", "category": "Strength", "description": "Shoulder exercise that builds upper body strength and stability."},
	{"name": "Rows", "category": "Strength", "description": "Back exercise that improves posture and strengthens the posterior chain."},
	{"name": "Lunges", "category": "Strength", "description": "Single-leg exercise that strengthens legs and improves balance."},
	{"name": "Planks", "category": "Strength", "description": "Isometric core exercise that strengthens the entire core region."},
	{"name": "Dips", "category": "Strength", "description": "Upper body exercise that targets triceps, chest, and shoulders."},
	
	# Flexibility Exercises (10)
	{"name": "Yoga", "category": "Flexibility", "description": "Mind-body practice that improves flexibility, strength, and mental well-being."},
	{"name": "Stretching", "category": "Flexibility", "description": "Basic flexibility exercise that improves range of motion and reduces muscle tension."},
	{"name": "Pilates", "category": "Flexibility", "description": "Low-impact exercise that improves flexibility, core strength, and posture."},
	{"name": "Tai Chi", "category": "Flexibility", "description": "Gentle martial art that improves balance, flexibility, and mental focus."},
	{"name": "Dynamic Stretching", "category": "Flexibility", "description": "Active stretching that prepares muscles for movement and improves flexibility."},
	{"name": "Static Stretching", "category": "Flexibility", "description": "Held stretches that improve flexibility and help with muscle recovery."},
	{"name": "Foam Rolling", "category": "Flexibility", "description": "Self-massage technique that improves flexibility and reduces muscle soreness."},
	{"name": "Mobility Work", "category": "Flexibility", "description": "Exercises that improve joint range of motion and movement quality."},
	{"name": "Breathing Exercises", "category": "Flexibility", "description": "Techniques that improve lung capacity and promote relaxation."},
	{"name": "Meditation", "category": "Flexibility", "description": "Mindfulness practice that reduces stress and improves mental flexibility."},
]


def seed_system_exercises() -> None:
	with SessionLocal() as db:
		for item in SYSTEM_EXERCISES:
			existing = db.execute(select(Exercise).where(Exercise.name == item["name"]))
			exists = existing.scalars().first()
			if exists:
				continue
			ex = Exercise(
				name=item["name"],
				category=item["category"],
				description=item.get("description"),
				owner_id=None,
			)
			db.add(ex)
			db.commit()
			# no need to refresh for seeding


def seed_sample_progress() -> None:
	"""Create sample progress data for demonstration purposes."""
	with SessionLocal() as db:
		# Clear existing progress data first
		existing_progress = db.execute(select(Progress)).scalars().all()
		for progress in existing_progress:
			db.delete(progress)
		db.commit()
		print("Cleared existing progress data.")
		
		# Get a user to associate progress with (if any exist)
		user = db.execute(select(User)).scalars().first()
		if not user:
			print("No users found. Skipping sample progress creation.")
			return
		
		# Create sample progress data for the last 30 days
		today = date.today()
		progress_entries = []
		
		# Weight tracking (decreasing trend)
		base_weight = 75.0
		for i in range(30):
			entry_date = today - timedelta(days=29-i)
			weight = base_weight - (i * 0.1) + random.uniform(-0.5, 0.5)
			progress_entries.append({
				"date": entry_date,
				"metric_name": "Weight",
				"metric_value": round(weight, 1),
				"unit": "kg",
				"owner_id": user.id
			})
		
		# Workout duration tracking
		for i in range(20):
			entry_date = today - timedelta(days=random.randint(0, 29))
			duration = random.uniform(30, 90)
			progress_entries.append({
				"date": entry_date,
				"metric_name": "Workout Duration",
				"metric_value": round(duration, 0),
				"unit": "minutes",
				"owner_id": user.id
			})
		
		# Steps tracking
		for i in range(25):
			entry_date = today - timedelta(days=random.randint(0, 29))
			steps = random.randint(5000, 15000)
			progress_entries.append({
				"date": entry_date,
				"metric_name": "Steps",
				"metric_value": steps,
				"unit": "steps",
				"owner_id": user.id
			})
		
		# Calories burned
		for i in range(15):
			entry_date = today - timedelta(days=random.randint(0, 29))
			calories = random.randint(200, 800)
			progress_entries.append({
				"date": entry_date,
				"metric_name": "Calories Burned",
				"metric_value": calories,
				"unit": "calories",
				"owner_id": user.id
			})
		
		# Add all progress entries to database
		for entry_data in progress_entries:
			progress = Progress(**entry_data)
			db.add(progress)
		
		db.commit()
		print(f"Created {len(progress_entries)} sample progress entries for user: {user.full_name}")


if __name__ == "__main__":
	seed_system_exercises()
	seed_sample_progress()
	print("Seed complete.")


