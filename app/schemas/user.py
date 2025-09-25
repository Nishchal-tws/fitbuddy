from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
	email: EmailStr
	full_name: str | None = None

	model_config = {
		"from_attributes": True,
	}


class UserCreate(UserBase):
	password: str


class UserRead(UserBase):
	id: int

