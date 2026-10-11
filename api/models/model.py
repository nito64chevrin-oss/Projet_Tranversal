from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import DateTime
from sqlmodel import Field, SQLModel


class Book(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    titre: str = Field(min_length=3, max_length=100)
    categorie: str = Field(min_length=2, max_length=50)
    description: str
    image_url: str
    annee: int = Field(gt=0)
    auteur: str = Field(min_length=2, max_length=80)
    nombre_pages: int = Field(gt=0)


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str


class CollectionEntry(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    statut: str
    note: Optional[int] = None
    commentaire: Optional[str] = None
    date_ajout: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_type=DateTime(timezone=True),
    )
    user_id: int = Field(foreign_key="user.id")
    item_id: int = Field(foreign_key="book.id")