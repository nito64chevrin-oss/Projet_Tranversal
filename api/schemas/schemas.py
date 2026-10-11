from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class BookBase(BaseModel):
    titre: str = Field(min_length=3, max_length=100)
    categorie: str = Field(min_length=2, max_length=50)
    description: str
    image_url: str
    annee: int = Field(gt=0)
    auteur: str = Field(min_length=2, max_length=80)
    nombre_pages: int = Field(gt=0)


class BookCreate(BookBase):
    pass


class BookResponse(BookBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class BookListResponse(BaseModel):
    total: int
    page: int
    limit: int
    results: list[BookResponse]


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)


Statut = Literal["a_decouvrir", "en_cours", "termine"]


class CollectionEntryCreate(BaseModel):
    item_id: int
    statut: Statut
    note: Optional[int] = Field(default=None, ge=1, le=5)
    commentaire: Optional[str] = None


class CollectionEntryUpdate(BaseModel):
    statut: Optional[Statut] = None
    note: Optional[int] = Field(default=None, ge=1, le=5)
    commentaire: Optional[str] = None


class CollectionEntryResponse(BaseModel):
    id: int
    statut: Statut
    note: Optional[int]
    commentaire: Optional[str]
    date_ajout: datetime
    item: BookResponse

    model_config = ConfigDict(from_attributes=True)


class StatsResponse(BaseModel):
    total: int
    par_statut: dict[str, int]
    note_moyenne: Optional[float]


class ErrorDetail(BaseModel):
    code: int
    message: str


class ErrorResponse(BaseModel):
    erreur: ErrorDetail
