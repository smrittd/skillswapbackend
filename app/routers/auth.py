from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from app.database.database import get_db
from app.models.user import User
from app.utils.user import verify_password, create_access_token


router = APIRouter(tags=['Auth'])

@router.post('/login')
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):

    user = db.query(User).filter(User.username == form_data.username).first()

    if not user:
        raise HTTPException(
            status_code=400, detail='Неверный логин или пароль'
        )
    
    if not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=400, detail='Неверный логин или пароль'
        )
    
    access_token = create_access_token(data = {'sub': user.username})

    return {"access_token": access_token, "token_type": "bearer"}