from datetime import datetime
from pydantic import BaseModel


class WorkoutBase(BaseModel):
	title: str
	notes: str | None = None
	performed_at: datetime | None = None
	duration_minutes: int | None = None

	model_config = {"from_attributes": True}


class WorkoutCreate(WorkoutBase):
	pass


class WorkoutUpdate(BaseModel):
	title: str | None = None
	notes: str | None = None
	performed_at: datetime | None = None
	duration_minutes: int | None = None


class WorkoutRead(WorkoutBase):
	id: int

