from contextlib import asynccontextmanager
from fastapi import FastAPI
from db.database import init_db
from routers.auth import router

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(lifespan=lifespan)
app.include_router(router)

from routers.items import router as items_router
app.include_router(items_router)