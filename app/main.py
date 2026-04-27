from fastapi import FastAPI

from app.database.database import Base,engine
from app.routers import auth, user


app = FastAPI()

app.include_router(user.router)
app.include_router(auth.router)
Base.metadata.create_all(bind=engine)


@app.get('/')
def root():
    return {"message": "SkillSwap API is running"}