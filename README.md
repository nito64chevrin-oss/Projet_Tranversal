# Ma Collection

Application de gestion d'une bibliothèque de livres : catalogue public (recherche, filtre par catégorie, pagination) et collection personnelle (statut, note, commentaire, statistiques).

- `api/` : API REST en FastAPI + SQLModel (SQLite asynchrone), authentification JWT. Voir [api/README.md](api/README.md).
- `web/` : interface React + TypeScript + Vite. Voir [web/README.md](web/README.md).

## Prérequis

- Python 3.10 ou plus
- Node.js 20 ou plus (avec npm)

## Lancement

Il faut deux terminaux : un pour l'API, un pour l'interface.

### 1. API (terminal 1)

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

Installer les dépendances et créer le fichier `.env` :

```bash
pip install -r ../requirement.txt
cp .env.example .env
```

Dans `.env`, remplacer `JWT_SECRET_KEY` par une valeur aléatoire, générée par exemple avec :

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Peupler la base (80 livres sur 4 catégories, relançable sans créer de doublons) puis démarrer le serveur :

```bash
python seed.py
uvicorn main:app --reload
```

L'API est disponible sur http://localhost:8000 et sa documentation sur http://localhost:8000/docs.

### 2. Interface web (terminal 2)

```bash
cd web
npm install
npm run dev
```

L'application est disponible sur http://localhost:5173.

## Réinitialiser la base

Arrêter l'API, supprimer `api/collection.db`, puis relancer `python seed.py` depuis `api/`.
