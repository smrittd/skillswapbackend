from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

class UserInfo(BaseModel):
    id: int
    username: str
    email: EmailStr


    model_config = ConfigDict(from_attributes=True)

class SkillBase(BaseModel):
    title: str = Field(..., max_length=100, min_length=1)
    description: Optional[str] = None

class SkillCreate(SkillBase):
    pass

class SkillResponse(SkillBase):
    id: int
    user_id: int

    owner: UserInfo

    model_config = ConfigDict(from_attributes=True)