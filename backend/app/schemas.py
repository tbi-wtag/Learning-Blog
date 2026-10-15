from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id:int
    username: str
    email: EmailStr
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class ResourceDetailOut(BaseModel):
    id: int
    resource_id: int
    link: str
    created_at: datetime

class ResourceCreate(BaseModel):
    title: str
    description: str
    link: str

class ResourceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    link: Optional[str] = None

class ResourceOut(BaseModel):
    id: int
    title: str
    description: str
    user_id: int
    created_at: datetime
    details: Optional[ResourceDetailOut] = None


