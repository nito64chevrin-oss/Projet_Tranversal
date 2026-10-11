from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from core.security import create_acces_token, hash_password, verify
from db.database import get_session
from dependencies.deps import get_current_user
from models.model import User
from schemas.schemas import ErrorResponse, TokenResponse, UserCreate, UserLogin, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Créer un compte",
    responses={409: {"model": ErrorResponse, "description": "Email déjà utilisé"}},
)
async def register(data: UserCreate, session: AsyncSession = Depends(get_session)) -> User:
    result = await session.exec(select(User).where(User.email == data.email))
    if result.first() is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email déjà utilisé")

    new_user = User(email=data.email, password_hash=hash_password(data.password))
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)

    return new_user


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Se connecter et obtenir un token",
    responses={401: {"model": ErrorResponse, "description": "Identifiants invalides"}},
)
async def login(data: UserLogin, session: AsyncSession = Depends(get_session)) -> TokenResponse:
    result = await session.exec(select(User).where(User.email == data.email))
    user = result.first()

    if user is None or not verify(data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email ou mot de passe invalide")

    access_token = create_acces_token(user.id)
    return TokenResponse(access_token=access_token, token_type="bearer")


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Utilisateur connecté",
    responses={401: {"model": ErrorResponse, "description": "Non authentifié"}},
)
async def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user
