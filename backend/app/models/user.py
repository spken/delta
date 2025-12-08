"""
User model for storing GitLab authentication data.
"""
from sqlalchemy import Column, Integer, String, Text
from app.core.database import Base


class User(Base):
    """User table for local authentication context."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    gitlab_user_id = Column(String(255), unique=True, nullable=False, index=True)
    access_token = Column(Text, nullable=False)
    refresh_token = Column(Text, nullable=True)
    username = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)

    def __repr__(self):
        return f"<User {self.gitlab_user_id}>"
