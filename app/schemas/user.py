from pydantic import BaseModel, EmailStr, ConfigDict, Field

class UserBase(BaseModel):
    email: EmailStr
    username: str
    skill: str

class UserCreate(UserBase):
    password: str

class UserResponce(UserBase):
    id: int
    is_active: bool


    model_config = ConfigDict(from_attributes=True)