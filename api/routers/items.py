from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import func, select
from sqlmodel.ext.asyncio.session import AsyncSession

from db.database import get_session
from dependencies.deps import Pagination
from models.model import Book
from schemas.schemas import BookListResponse, BookResponse, ErrorResponse

router = APIRouter(prefix="/items", tags=["items"])


@router.get("", response_model=BookListResponse, summary="Lister le catalogue (recherche, filtre, pagination)")
async def list_items(
    q: Optional[str] = Query(default=None, min_length=2),
    categorie: Optional[str] = Query(default=None),
    pagination: Pagination = Depends(),
    session: AsyncSession = Depends(get_session),
) -> BookListResponse:
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

    statement = statement.order_by(Book.id).offset(pagination.offset).limit(pagination.limit)
    result = await session.exec(statement)
    books = result.all()

    return BookListResponse(total=total, page=pagination.page, limit=pagination.limit, results=books)


@router.get(
    "/{item_id}",
    response_model=BookResponse,
    summary="Détail d'un livre",
    responses={404: {"model": ErrorResponse, "description": "Item introuvable"}},
)
async def get_item(item_id: int, session: AsyncSession = Depends(get_session)) -> Book:
    book = await session.get(Book, item_id)
    if book is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item introuvable")
    return book
