from typing import Optional
from pydantic import EmailStr
from sqlmodel import Field, SQLModel
from pydantic import BaseModel


class Book(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    titre: str = Field(min_length=3, max_length=100)
    categorie: str = Field(min_length=3, max_length=50)
    description: str
    image_url: str
    annee: int = Field(gt=0)
    auteur: str = Field(min_length=2, max_length=80)
    nombre_pages: int = Field(gt=0)

class User(SQLModel, table=True):
    id: Optional[int] = Field(default= None, primary_key= True)
    email: str = Field(unique= True, index=True)
    password_hash: str

class UserCreate(BaseModel):
    email: EmailStr 
    password: str = Field(min_length=8, max_length= 100)

class UserResponse(BaseModel):
    id: int
    email: EmailStr 