from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
	email: EmailStr
	full_name: str | None = None
	experience_level: str | None = None

	model_config = {
		"from_attributes": True,
	}
# by uysing the above line model_config the fast api converting the db to pydantic model automatically 

class UserCreate(UserBase):
	password: str


class UserRead(UserBase):
	id: int


class UserUpdate(BaseModel):
	full_name: str | None = None
	experience_level: str | None = None

	model_config = {
		"from_attributes": True,
	}

