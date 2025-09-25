from pydantic import BaseModel
from typing import Literal


class ExerciseBase(BaseModel):
	name: str
	category: Literal["Cardio", "Strength", "Flexibility"]
	description: str | None = None

	model_config = {"from_attributes": True}


class ExerciseCreate(ExerciseBase):
	pass


class ExerciseUpdate(BaseModel):
	name: str | None = None
	category: str | None = None
	description: str | None = None


class ExerciseRead(ExerciseBase):
	id: int


