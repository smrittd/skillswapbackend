from fastapi import APIRouter,HTTPException,Depends, status
from typing import List
from app.dependencies.user import get_current_user
from sqlalchemy.orm import Session, joinedload
from app.models.user import User
from app.schemas.skill import SkillCreate, SkillResponse
from app.models.skill import Skill
from app.database.database import get_db


router = APIRouter(prefix="/skills", tags=["Skills"])


@router.post('/', response_model=SkillResponse)
def create_skills(skill: SkillCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    new_skill = Skill(
        title = skill.title,
        description = skill.description,
        user_id = current_user.id
    )
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)

    return new_skill


@router.get('/', response_model=List[SkillResponse])
def get_skills(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    skills = db.query(Skill).filter(Skill.user_id == current_user.id).offset(skip).limit(limit).all()
    return skills


@router.get('/public', response_model=List[SkillResponse])
def get_public_skills(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """
    Публичная лента. Возвращает все навыки всех пользователей вместе с информацией об авторе.
    """
    skills = db.query(Skill).options(joinedload(Skill.owner)).offset(skip).limit(limit).all()
    return skills