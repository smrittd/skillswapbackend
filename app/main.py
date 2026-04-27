from fastapi import FastAPI

from app.database.database import Base,engine
from app.routers import auth, skill, user


app = FastAPI()

app.include_router(user.router)
app.include_router(auth.router)
app.include_router(skill.router)
Base.metadata.create_all(bind=engine)


@app.get('/')
def root():
    return {"message": "SkillSwap API is running"}