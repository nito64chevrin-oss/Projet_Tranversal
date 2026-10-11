# Ma Collection

Application de gestion d'une bibliothèque de livres : catalogue public (recherche, filtre par catégorie, pagination) et collection personnelle (statut, note, commentaire, statistiques).

- `api/` : API REST en FastAPI + SQLModel (PostgreSQL en accès asynchrone), authentification JWT. Voir [api/README.md](api/README.md).
- `web/` : interface React + TypeScript + Vite. Voir [web/README.md](web/README.md).

## Prérequis

- Python 3.10 ou plus
- Node.js 20 ou plus (avec npm)
- Docker Desktop (pour PostgreSQL)

## Lancement

Il faut deux terminaux : un pour l'API, un pour l'interface.

### 1. Configuration

Créer le fichier `api/.env` à partir de l'exemple :

```bash
cp api/.env.example api/.env
```

Dans `api/.env` :

- remplacer `change-me` par un mot de passe, dans `POSTGRES_PASSWORD` **et** dans `DATABASE_URL` ;
- remplacer `JWT_SECRET_KEY` par une valeur aléatoire, générée par exemple avec :

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

### 2. Base PostgreSQL

Docker Desktop doit être lancé. Depuis la racine du projet :

```bash
docker compose up -d
```

### 3. API (terminal 1)

Toutes les commandes se lancent depuis le dossier `api/`.

```bash
cd api
python -m venv .venv
```

Activer l'environnement virtuel :

```bash
# Windows (PowerShell)
.venv\Scripts\Activate.ps1
# macOS / Linux
source .venv/bin/activate
```

Installer les dépendances :

```bash
pip install -r ../requirement.txt
```

Peupler la base (80 livres sur 4 catégories, relançable sans créer de doublons) puis démarrer le serveur :

```bash
python seed.py
uvicorn main:app --reload
```

L'API est disponible sur http://localhost:8000 et sa documentation sur http://localhost:8000/docs.

### 4. Interface web (terminal 2)

```bash
cd web
npm install
npm run dev
```

L'application est disponible sur http://localhost:5173.

## Réinitialiser la base

Arrêter l'API, puis depuis la racine du projet :

```bash
docker compose down -v
docker compose up -d
```

Relancer ensuite `python seed.py` depuis `api/`.
