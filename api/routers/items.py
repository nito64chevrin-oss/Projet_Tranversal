from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlmodel import func, select
from sqlmodel.ext.asyncio.session import AsyncSession

from db.database import get_session
from models.model import Book
from schemas.schemas import BookResponse

router = APIRouter(prefix="/items", tags=["items"])


class BookListResponse(BaseModel):
    """Réponse paginée pour GET /items, telle qu'imposée par le contrat."""

    total: int
    page: int
    limit: int
    results: list[BookResponse]


@router.get("", response_model=BookListResponse)
async def list_items(
    q: Optional[str] = Query(default=None, min_length=2),
    categorie: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=12, ge=1, le=50),
    session: AsyncSession = Depends(get_session),
):
    statement = select(Book)
    count_statement = select(func.count()).select_from(Book)

    if categorie:
        statement = statement.where(Book.categorie == categorie)
        count_statement = count_statement.where(Book.categorie == categorie)

    if q:
        statement = statement.where(Book.titre.ilike(f"%{q}%"))
        count_statement = count_statement.where(Book.titre.ilike(f"%{q}%"))

    total_result = await session.exec(count_statement)
    total = total_result.one()

    statement = statement.offset((page - 1) * limit).limit(limit)
    result = await session.exec(statement)
    books = result.all()

    return BookListResponse(total=total, page=page, limit=limit, results=books)


@router.get("/{item_id}", response_model=BookResponse)
async def get_item(item_id: int, session: AsyncSession = Depends(get_session)):
    book = await session.get(Book, item_id)
    if book is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item introuvable")
    return book