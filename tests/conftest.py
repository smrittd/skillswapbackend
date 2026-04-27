import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database.database import Base, get_db

# 1. Создаем временную базу данных SQLite специально для тестов
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 2. Функция, которая подменит реальную БД на тестовую
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

# Говорим FastAPI: "Когда кто-то просит get_db, давай им override_get_db"
app.dependency_overrides[get_db] = override_get_db

# 3. Фикстура (fixture) клиента. Она создает таблицы перед тестами и удаляет после
@pytest.fixture(scope="module")
def client():
    # Создаем таблицы в тестовой БД
    Base.metadata.create_all(bind=engine)
    
    # Отдаем клиента для тестов
    with TestClient(app) as c:
        yield c
        
    # Удаляем таблицы после прохождения всех тестов
    Base.metadata.drop_all(bind=engine)