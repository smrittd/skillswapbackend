from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from app.database.database import Base,engine
from app.routers import auth, skill, user


app = FastAPI()


origins = [
    "http://127.0.0.1:8000",
    "http://localhost:8000",
    "http://127.0.0.1:5500",  # Для Live Server в VS Code
    "http://localhost:5500"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user.router)
app.include_router(auth.router)
app.include_router(skill.router)
Base.metadata.create_all(bind=engine)


app.mount("/static", StaticFiles(directory="frontend"), name="static")

# 4. Отдаем главную HTML-страницу при заходе на корень сайта
@app.get('/')
def serve_frontend():
    return FileResponse("frontend/index.html")