import os

from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", 30))

CORS_ORIGIN = os.getenv("CORS_ORIGIN", "http://localhost:5173")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL manquant : copier .env.example en .env et le remplir")

if not JWT_SECRET_KEY:
    raise RuntimeError("JWT_SECRET_KEY manquant : copier .env.example en .env et le remplir")
