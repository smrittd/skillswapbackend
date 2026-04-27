from sqlalchemy import ForeignKey, String, Integer, Column
from sqlalchemy.orm import relationship
from app.database.database import Base

class Skill(Base):
    __tablename__ = 'skills'


    id = Column(Integer, primary_key=True, index = True)
    title = Column(String, index=True)
    description = Column(String)

    user_id = Column(Integer, ForeignKey('users.id'))

    owner = relationship('User', back_populates='skills')

    
