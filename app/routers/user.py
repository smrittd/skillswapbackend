from fastapi import APIRouter,HTTPException,Depends
from sqlalchemy.orm import Session
from schemas.user import UserCreate, UserResponce
from models.user import User
from database import get_db

router = APIRouter(prefix="/users", tags=["Users"])

@router.post('/', response_model=UserResponce)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail='Email already registered')
    

    new_user = User(
        email = user.email,
        username = user.usernaname,
        password = user.password,
        skill = user.skill
    )

    db.add()
    db.commit()
    db.refresh(new_user)
    return new_user



    