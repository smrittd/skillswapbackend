from fastapi import APIRouter,HTTPException,Depends
from app.dependencies.user import get_current_user
from sqlalchemy.orm import Session
from app.schemas.user import UserCreate, UserResponce
from app.models.user import User
from app.database.database import get_db
from app.utils.user import hash_password
router = APIRouter(prefix="/users", tags=["Users"])

@router.post('/', response_model=UserResponce)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail='Email already registered')
    
    db_user_username = db.query(User).filter(User.username == user.username).first()

    if db_user_username:
        raise HTTPException(status_code=400, detail='Username already taken')
    
    hashed_pwd = hash_password(user.password)
    new_user = User(
        email = user.email,
        username = user.username,
        password = hashed_pwd,
        skill = user.skill
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user



@router.get('/me', response_model=UserResponce)
def get_my_progile(current_user: User = Depends(get_current_user)):
    return current_user