from sqlalchemy import Column, Integer, String, Boolean
from app.database.database import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = 'users'


    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True,index=True)
    username = Column(String, unique=True)
    password = Column(String)
    is_active = Column(Boolean, default=True)

    skills = relationship('Skill', back_populates='owner')
    
