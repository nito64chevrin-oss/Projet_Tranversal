from pydantic import BaseModel, ConfigDict, EmailStr, Field



class BookBase(BaseModel):
    titre: str = Field(min_length=3, max_length=100)
    categorie: str = Field(min_length=3, max_length=50)
    description: str
    image_url: str
    annee: int = Field(gt=0)
    auteur: str = Field(min_length=2, max_length=80)
    nombre_pages: int = Field(gt=0)


class BookCreate(BookBase):
    """-"""


class BookResponse(BookBase):
    id: int
    model_config = ConfigDict(from_attributes=True)



class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=100)


class UserResponse(BaseModel):
    id: int
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)