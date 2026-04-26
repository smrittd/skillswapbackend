from fastapi import APIRouter,HTTPException,Depends
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserResponce
from app.models.user import User
from app.database.database import get_db

router = APIRouter(prefix="/users", tags=["Users"])

@router.post('/', response_model=UserResponce)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail='Email already registered')
    
    db_user_username = db.query(User).filter(User.username == user.username).first()

    if db_user_username:
        raise HTTPException(status_code=400, detail='Username already taken')


    new_user = User(
        email = user.email,
        username = user.username,
        password = user.password,
        skill = user.skill
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user



    