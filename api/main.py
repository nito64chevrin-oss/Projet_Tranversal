import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from db.database import init_db
from routers.auth import router as auth_router
from routers.collection import router as collection_router
from routers.items import router as items_router

load_dotenv()

CORS_ORIGIN = os.getenv("CORS_ORIGIN")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[CORS_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"erreur": {"code": exc.status_code, "message": exc.detail}},
    )


app.include_router(auth_router)
app.include_router(items_router)
app.include_router(collection_router)