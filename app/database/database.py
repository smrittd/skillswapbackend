from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

DATABASE_URL = 'postgresql://postgres:12345@localhost/skillswap'


engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(bind = engine)

Base = declarative_base()
