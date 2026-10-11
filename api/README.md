# API Ma Collection

API REST en FastAPI + SQLModel, base PostgreSQL en accès asynchrone (asyncpg), lancée avec Docker (`docker-compose.yml` à la racine).

L'installation et le lancement sont décrits dans le [README racine](../README.md).

## Configuration (`.env`)

Le fichier `.env` n'est pas versionné. Le copier depuis `.env.example`. Il sert à la fois à l'API et au conteneur PostgreSQL.

| Variable             | Rôle                                         |
| -------------------- | -------------------------------------------- |
| `POSTGRES_USER`      | Utilisateur créé par le conteneur PostgreSQL |
| `POSTGRES_PASSWORD`  | Mot de passe de cet utilisateur              |
| `POSTGRES_DB`        | Nom de la base créée par le conteneur        |
| `DATABASE_URL`       | URL de connexion de l'API (mêmes valeurs que ci-dessus) |
| `JWT_SECRET_KEY`     | Clé de signature des tokens (obligatoire)    |
| `JWT_ALGORITHM`      | Algorithme de signature (`HS256`)            |
| `JWT_EXPIRE_MINUTES` | Durée de validité du token, en minutes       |
| `CORS_ORIGIN`        | Seule origine autorisée (`http://localhost:5173`) |

Le token expire au bout de 30 minutes : en cas de vol, il n'est utilisable que peu de temps.

## Structure

```
main.py           assemblage de l'application (CORS, handlers d'erreur, routers)
seed.py           peuplement du catalogue
core/config.py    lecture du .env
core/security.py  hachage bcrypt et tokens JWT
core/knn.py       k plus proches voisins pour les livres similaires
db/database.py    moteur asynchrone et dépendance get_session (yield)
dependencies/     get_current_user et pagination
models/           tables SQLModel : Book, User, CollectionEntry
schemas/          schémas Pydantic d'entrée et de sortie
routers/          auth, items, collection
```

## Routes

Les routes `/me/*` et `/auth/me` demandent l'en-tête `Authorization: Bearer <token>`.

| Méthode | Route                       | Description                                   |
| ------- | --------------------------- | --------------------------------------------- |
| POST    | `/auth/register`            | Inscription (201, 409 si email déjà pris)     |
| POST    | `/auth/login`               | Connexion, renvoie le token (401 si invalide) |
| GET     | `/auth/me`                  | Utilisateur connecté                          |
| GET     | `/items`                    | Catalogue : `q`, `categorie`, `page`, `limit` |
| GET     | `/items/{item_id}`          | Détail d'un livre (404)                       |
| GET     | `/items/{item_id}/similaires` | Les `k` livres les plus proches (défaut 5, 404) |
| GET     | `/me/collection`            | Ma collection : `statut`, `tri` (`date` ou `note`) |
| POST    | `/me/collection`            | Ajout (201, 404 item inexistant, 409 déjà présent) |
| PATCH   | `/me/collection/{entry_id}` | Modification (404)                            |
| DELETE  | `/me/collection/{entry_id}` | Suppression (204, 404)                        |
| GET     | `/me/stats`                 | Total, répartition par statut, note moyenne   |

Toutes les erreurs ont le même format :

```json
{ "erreur": { "code": 404, "message": "Item introuvable" } }
```

## Tester dans /docs

1. Appeler `POST /auth/register` puis `POST /auth/login`.
2. Copier la valeur de `access_token`.
3. Cliquer sur "Authorize" et coller le token.

## Sécurité

- Mots de passe hachés avec bcrypt, le hash n'apparaît dans aucune réponse.
- Secret JWT dans `.env`, hors du dépôt Git.
- CORS limité à l'origine du serveur Vite.
- Requêtes construites avec l'ORM, jamais par concaténation de chaînes.
- Une entrée de collection n'est modifiable ou supprimable que par son propriétaire (vérifié côté serveur, sinon 404).

## Livres similaires (k-NN)

Pour un livre donné, l'API calcule sa distance avec tous les autres livres puis renvoie les `k` plus proches. La distance combine trois critères, chacun ramené entre 0 et 1 :

- catégorie : 0 si identique, 1 sinon ;
- année : écart d'années divisé par l'écart maximal du catalogue ;
- nombre de pages : même principe.

Distance = racine carrée de la somme des carrés des trois écarts (distance euclidienne).
