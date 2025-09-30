from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.exercise import Exercise


SYSTEM_EXERCISES = [
	{"name": "Push-Up", "category": "strength", "description": "Bodyweight push exercise for chest, triceps, shoulders."},
	{"name": "Squat", "category": "strength", "description": "Lower body compound movement targeting quads and glutes."},
	{"name": "Plank", "category": "core", "description": "Isometric core stabilization exercise."},
	{"name": "Burpee", "category": "conditioning", "description": "Full-body conditioning movement with a jump."},
	{"name": "Deadlift", "category": "strength", "description": "Posterior chain compound lift."},
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


if __name__ == "__main__":
	seed_system_exercises()
	print("Seed complete.")


