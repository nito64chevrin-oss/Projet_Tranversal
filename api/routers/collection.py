from typing import Literal, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from db.database import get_session
from dependencies.deps import get_current_user
from models.model import Book, CollectionEntry, User
from schemas.schemas import (
    BookResponse,
    CollectionEntryCreate,
    CollectionEntryResponse,
    CollectionEntryUpdate,
    ErrorResponse,
    StatsResponse,
    Statut,
)

router = APIRouter(prefix="/me", tags=["collection"])


async def build_entry_response(entry: CollectionEntry, session: AsyncSession) -> CollectionEntryResponse:
    book = await session.get(Book, entry.item_id)
    return CollectionEntryResponse(
        id=entry.id,
        statut=entry.statut,
        note=entry.note,
        commentaire=entry.commentaire,
        date_ajout=entry.date_ajout,
        item=BookResponse.model_validate(book),
    )


NON_AUTHENTIFIE = {401: {"model": ErrorResponse, "description": "Non authentifié"}}
ENTREE_INTROUVABLE = {404: {"model": ErrorResponse, "description": "Entrée introuvable"}}


@router.get(
    "/collection",
    response_model=list[CollectionEntryResponse],
    summary="Lister ma collection (filtre par statut, tri par date ou note)",
    responses=NON_AUTHENTIFIE,
)
async def list_collection(
    statut: Optional[Statut] = Query(default=None),
    tri: Literal["date", "note"] = Query(default="date"),
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> list[CollectionEntryResponse]:
    statement = select(CollectionEntry).where(CollectionEntry.user_id == current_user.id)

    if statut:
        statement = statement.where(CollectionEntry.statut == statut)

    if tri == "note":
        statement = statement.order_by(CollectionEntry.note.desc())
    else:
        statement = statement.order_by(CollectionEntry.date_ajout.desc())

    result = await session.exec(statement)
    entries = result.all()

    return [await build_entry_response(entry, session) for entry in entries]


@router.post(
    "/collection",
    response_model=CollectionEntryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ajouter un livre à ma collection",
    responses={
        **NON_AUTHENTIFIE,
        404: {"model": ErrorResponse, "description": "Item introuvable"},
        409: {"model": ErrorResponse, "description": "Item déjà présent dans la collection"},
    },
)
async def create_collection_entry(
    data: CollectionEntryCreate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> CollectionEntryResponse:
    book = await session.get(Book, data.item_id)
    if book is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item introuvable")

    result = await session.exec(
        select(CollectionEntry).where(
            CollectionEntry.user_id == current_user.id,
            CollectionEntry.item_id == data.item_id,
        )
    )
    if result.first() is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Item déjà présent dans la collection")

    entry = CollectionEntry(
        statut=data.statut,
        note=data.note,
        commentaire=data.commentaire,
        user_id=current_user.id,
        item_id=data.item_id,
    )
    session.add(entry)
    await session.commit()
    await session.refresh(entry)

    return await build_entry_response(entry, session)


@router.patch(
    "/collection/{entry_id}",
    response_model=CollectionEntryResponse,
    summary="Modifier une entrée de ma collection",
    responses={**NON_AUTHENTIFIE, **ENTREE_INTROUVABLE},
)
async def update_collection_entry(
    entry_id: int,
    data: CollectionEntryUpdate,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> CollectionEntryResponse:
    entry = await session.get(CollectionEntry, entry_id)
    if entry is None or entry.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entrée introuvable")

    if data.statut is not None:
        entry.statut = data.statut
    if data.note is not None:
        entry.note = data.note
    if data.commentaire is not None:
        entry.commentaire = data.commentaire

    session.add(entry)
    await session.commit()
    await session.refresh(entry)

    return await build_entry_response(entry, session)


@router.delete(
    "/collection/{entry_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Supprimer une entrée de ma collection",
    responses={**NON_AUTHENTIFIE, **ENTREE_INTROUVABLE},
)
async def delete_collection_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> None:
    entry = await session.get(CollectionEntry, entry_id)
    if entry is None or entry.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Entrée introuvable")

    await session.delete(entry)
    await session.commit()


@router.get(
    "/stats",
    response_model=StatsResponse,
    summary="Statistiques de ma collection",
    responses=NON_AUTHENTIFIE,
)
async def get_stats(
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session),
) -> StatsResponse:
    result = await session.exec(select(CollectionEntry).where(CollectionEntry.user_id == current_user.id))
    entries = result.all()

    par_statut = {"a_decouvrir": 0, "en_cours": 0, "termine": 0}
    notes = []

    for entry in entries:
        if entry.statut in par_statut:
            par_statut[entry.statut] += 1
        if entry.note is not None:
            notes.append(entry.note)

    note_moyenne = sum(notes) / len(notes) if notes else None

    return StatsResponse(total=len(entries), par_statut=par_statut, note_moyenne=note_moyenne)