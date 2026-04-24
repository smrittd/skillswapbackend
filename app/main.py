from fastapi import FastAPI

from app.database.database import Base,engine
from app.routers import user

app = FastAPI()

app.include_router(user.router)

Base.metadata.create_all(bind=engine)


@app.get('/')
def root():
    return {"message": "SkillSwap API is running"}