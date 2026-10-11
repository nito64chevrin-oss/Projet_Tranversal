# Préparation de la soutenance - Ma Collection

Soutenance de 15 minutes : démonstration de bout en bout, puis explication du code sur un point choisi par chaque intervenant.

---

## 1. Lancer le projet le jour J

### La veille

- Vérifier que Docker Desktop démarre bien.
- Faire un `git pull` pour avoir la dernière version.
- Lancer une fois tout le projet en suivant les étapes ci-dessous.

### Avant de passer (5 minutes avant)

**1. Démarrer Docker Desktop**, attendre "Engine running" (icône baleine en bas à droite).

**2. Démarrer la base** (terminal 1, à la racine du projet) :

```powershell
docker compose up -d
```

**3. Démarrer l'API** (même terminal) :

```powershell
.venv\Scripts\Activate.ps1
cd api
uvicorn main:app --reload
```

Laisser ce terminal ouvert. Si le catalogue est vide (base réinitialisée), lancer `python seed.py` depuis `api/` avant `uvicorn`.

**4. Démarrer le site** (terminal 2) :

```powershell
cd web
npm run dev
```

**5. Ouvrir dans le navigateur** :

- http://localhost:5173 : le site
- http://localhost:8000/docs : la documentation de l'API

### Préparer la démo

- Créer un compte de démo à l'avance (ex. `demo@demo.fr` / `motdepasse`) et y ajouter 3 ou 4 livres avec des statuts et des notes différents, pour que la collection et les stats ne soient pas vides.
- Le token expire au bout de 30 minutes : se reconnecter juste avant de passer.

### Si ça plante

| Problème | Cause probable | Solution |
| --- | --- | --- |
| `docker` n'est pas reconnu | VS Code ouvert avant Docker | Fermer complètement VS Code et le rouvrir |
| `Could not import module "main"` | `uvicorn` lancé depuis la racine | `cd api` puis relancer |
| `ERR_CONNECTION_REFUSED` dans le navigateur | L'API ne tourne pas | Relancer `uvicorn` dans `api/` |
| Erreur de connexion à la base au démarrage de l'API | Le conteneur Postgres est arrêté | `docker compose up -d` |
| Catalogue vide | Base vide | `python seed.py` dans `api/` |
| Déconnecté tout seul | Token expiré (30 min) | Se reconnecter |

---

## 2. Fonctionnalités du site

### Comptes

- Inscription (email + mot de passe de 8 caractères minimum), connexion, déconnexion.
- Après l'inscription, l'utilisateur est connecté automatiquement.
- Le token est gardé dans le `localStorage` : on reste connecté après un rechargement de la page.
- Au chargement, le site vérifie le token avec `/auth/me` ; s'il est expiré ou invalide, l'utilisateur est déconnecté.

### Catalogue (public)

- 80 livres répartis sur 4 catégories : Littérature, BD, Manga, Guide.
- Recherche par titre (à partir de 2 caractères), avec un délai de 400 ms (debounce) pour ne pas envoyer une requête à chaque touche.
- Filtre par catégorie.
- Pagination de 12 livres par page, avec boutons Précédent / Suivant.
- Chaque catégorie a sa couleur (bandeau des cartes, étiquette, fiche).

### Fiche d'un livre

- Titre, auteur, année, nombre de pages, description.
- Bouton "Ajouter à ma collection" si l'utilisateur est connecté, sinon un lien vers la connexion.
- Message clair si le livre est déjà dans la collection.
- **Livres similaires** : les 5 livres les plus proches, calculés par un k-NN (voir section 5).

### Ma collection (connecté)

- Liste des livres ajoutés, avec la date d'ajout.
- Modification du statut (À découvrir, En cours, Terminé), de la note (1 à 5) et du commentaire directement dans la liste.
- Suppression d'une entrée.
- Filtre par statut et tri par date d'ajout ou par note.

### Statistiques (connecté)

- Nombre total de livres, répartition par statut, note moyenne.

### Pages protégées

- `/collection` et `/stats` redirigent vers `/login` si l'utilisateur n'est pas connecté.

### Interface

- Responsive : lisible en largeur 375 px (2 livres par ligne sur mobile).
- Chaque écran qui appelle l'API gère les 3 états : chargement, erreur et liste vide.

---

## 3. Scénario de démo (5 minutes environ)

1. **Catalogue** : taper "jojo" dans la recherche, filtrer sur "Manga", changer de page.
2. **Fiche** : ouvrir un livre, montrer les livres similaires, cliquer sur l'un d'eux.
3. **Protection** : sans être connecté, aller sur `/collection` : redirection vers `/login`.
4. **Inscription** : créer un compte, on arrive directement connecté.
5. **Collection** : ajouter 2 ou 3 livres, essayer d'ajouter deux fois le même (message d'erreur), changer un statut, mettre une note, écrire un commentaire, trier par note, filtrer par statut, supprimer une entrée.
6. **Stats** : montrer le total, la répartition et la note moyenne.
7. **API** : ouvrir `/docs`, montrer les routes, faire un login, coller le token dans "Authorize", appeler `/me/collection`.
8. **Sécurité** : appeler `/me/collection` sans token : réponse 401 au format `{"erreur": {...}}`.

---

## 4. Questions possibles - Backend (FastAPI)

**Comment est organisé le backend ?**
En modules, comme demandé : `routers/` (les routes), `models/` (les tables SQLModel), `schemas/` (les schémas Pydantic d'entrée et de sortie), `dependencies/` (utilisateur courant et pagination), `core/` (config, sécurité, k-NN) et `db/` (connexion à la base). `main.py` ne contient aucune route : il crée l'application, configure le CORS, déclare les handlers d'erreur et inclut les routers.

**Pourquoi séparer `models` et `schemas` ?**
Les models décrivent les tables de la base, les schémas décrivent ce qui entre et sort de l'API. Par exemple, la table `User` contient `password_hash`, mais le schéma `UserResponse` ne contient que `id` et `email`. Comme chaque route a un `response_model`, FastAPI filtre la réponse : le hash ne peut jamais sortir de l'API.

**C'est quoi `Depends` et où l'utilisez-vous ?**
C'est l'injection de dépendances de FastAPI : on déclare ce dont la route a besoin, FastAPI l'appelle et passe le résultat. On l'utilise pour la session de base (`get_session`), l'utilisateur connecté (`get_current_user`) et la pagination (`Pagination`).

**Où est la dépendance dans une dépendance ?**
`get_current_user` dépend elle-même de `get_session` : pour retrouver l'utilisateur à partir du token, elle a besoin d'une session. FastAPI résout la chaîne tout seul.

**À quoi sert le `yield` dans `get_session` ?**
Ce qui est avant le `yield` s'exécute avant la route (ouverture de la session), ce qui est après s'exécute une fois la réponse envoyée (fermeture). Le `async with` garantit que la session est fermée même en cas d'erreur.

**Pourquoi tout est en `async` / `await` ?**
Pendant qu'une requête attend la base de données, le serveur peut traiter d'autres requêtes au lieu de bloquer. On utilise un driver asynchrone (`asyncpg`) et des sessions asynchrones.

**Comment validez-vous les paramètres ?**
Avec `Query()` et Pydantic. `page` doit être supérieur ou égal à 1, `limit` entre 1 et 50, `q` doit faire au moins 2 caractères, la note entre 1 et 5, le statut est un `Literal` qui n'accepte que les 3 valeurs. Si une valeur est invalide, FastAPI renvoie une 422 automatiquement.

**Comment avez-vous fait le format d'erreur uniforme ?**
Avec deux handlers d'exception dans `main.py` : un pour les `HTTPException` (404, 401, 409...) et un pour les erreurs de validation (422). Les deux renvoient `{"erreur": {"code": ..., "message": ...}}`. Le front lit toujours ce même format.

**Quels codes HTTP renvoyez-vous ?**
201 à la création (inscription, ajout à la collection), 204 à la suppression, 401 si le token manque ou est invalide, 404 si le livre ou l'entrée n'existe pas, 409 si l'email est déjà pris ou si le livre est déjà dans la collection, 422 si les données sont invalides.

**Comment empêchez-vous d'ajouter deux fois le même livre ?**
Avant l'ajout, on cherche une entrée avec le même `user_id` et le même `item_id` ; si elle existe, on renvoie 409. Amélioration possible : ajouter aussi une contrainte d'unicité sur le couple (`user_id`, `item_id`) dans la base, pour être protégé même si deux requêtes arrivent en même temps.

**Comment le script `seed.py` évite-t-il les doublons ?**
Pour chaque livre, il vérifie si un livre avec le même titre existe déjà ; si oui, il passe au suivant. On peut le relancer autant de fois qu'on veut.

**Comment est calculée la page de statistiques ?**
On récupère les entrées de l'utilisateur, on compte par statut et on fait la moyenne des notes renseignées (les entrées sans note ne comptent pas dans la moyenne). Si aucune note, `note_moyenne` vaut `null`.

**Comment la documentation `/docs` est-elle rendue exploitable ?**
Chaque route a un `summary`, un `response_model` et ses codes d'erreur déclarés dans `responses`. Le bouton "Authorize" permet de coller le token pour tester les routes protégées.

---

## 5. Questions possibles - Le k-NN (livres similaires)

**Comment fonctionnent les livres similaires ?**
C'est un algorithme des k plus proches voisins. Pour un livre, on calcule sa distance avec tous les autres livres, on trie du plus proche au plus loin et on garde les 5 premiers. Route : `GET /items/{item_id}/similaires?k=5`, code dans `api/core/knn.py`.

**Comment est calculée la distance ?**
Avec trois critères :
- catégorie : 0 si c'est la même, 1 sinon ;
- année : écart entre les deux années, divisé par l'écart maximal du catalogue ;
- nombre de pages : même principe.

On fait ensuite une distance euclidienne : racine carrée de la somme des carrés des trois écarts.

**Pourquoi diviser par l'écart maximal (normaliser) ?**
Sans ça, le nombre de pages (de 46 à 1900) écraserait tout : un écart de 100 pages pèserait beaucoup plus qu'un écart de 50 ans. En ramenant chaque critère entre 0 et 1, les trois critères ont le même poids.

**Pourquoi ne pas avoir utilisé scikit-learn ?**
Le calcul tient en une vingtaine de lignes, on peut l'expliquer ligne par ligne, et on évite une grosse dépendance pour 80 livres.

**Est-ce que ça tiendrait avec beaucoup plus de livres ?**
À chaque requête, on compare avec tous les livres puis on trie : le coût augmente avec la taille du catalogue. Pour 80 livres c'est instantané. Avec des milliers de livres, on pourrait précalculer les voisins une fois (par exemple dans le seed) ou utiliser une structure adaptée.

**Quelles sont les limites ?**
Une catégorie différente compte autant qu'un écart maximal d'années : les voisins sont donc presque toujours de la même catégorie. On ne tient pas compte de l'auteur ni de la description ; on pourrait les ajouter (par exemple comparer les mots des descriptions).

---

## 6. Questions possibles - Base de données

**Le sujet demandait SQLite, pourquoi PostgreSQL ?**
*(Adapter selon ce qui a été validé avec le professeur.)* PostgreSQL est la base qu'on retrouve en entreprise. Grâce à SQLModel, le code des routes n'a presque pas changé : il a suffi de changer l'URL de connexion, le driver (`asyncpg` au lieu de `aiosqlite`) et deux détails (voir ci-dessous).

**Qu'est-ce qui a changé en passant à PostgreSQL ?**
- La date d'ajout est stockée avec son fuseau horaire (`DateTime(timezone=True)`), sinon PostgreSQL refusait les dates en UTC.
- Pour le tri par note, on ajoute `nulls_last()` : PostgreSQL met les valeurs vides en premier en tri décroissant, alors qu'on veut les livres sans note à la fin.

**À quoi sert Docker ici ?**
Docker lance PostgreSQL dans un conteneur avec une seule commande (`docker compose up -d`), sans l'installer sur la machine. La configuration est dans `docker-compose.yml`, et les données sont gardées dans un volume (elles ne disparaissent pas quand on arrête le conteneur).

**Où sont l'utilisateur et le mot de passe de la base ?**
Dans `api/.env`, qui n'est pas versionné. Le `docker-compose.yml` lit ce fichier avec `env_file`, donc aucun mot de passe n'est écrit dans un fichier commité.

**Comment réinitialiser la base ?**
`docker compose down -v` supprime le conteneur et le volume, puis `docker compose up -d` et `python seed.py`.

---

## 7. Questions possibles - Sécurité

**Comment sont stockés les mots de passe ?**
Hachés avec bcrypt (via passlib). On ne stocke jamais le mot de passe en clair, et il n'est jamais journalisé.

**Pourquoi bcrypt et pas SHA-256 ou MD5 ?**
SHA-256 et MD5 sont faits pour être rapides : un attaquant peut tester des milliards de mots de passe par seconde. Bcrypt est volontairement lent et ajoute un sel aléatoire à chaque mot de passe : deux mots de passe identiques donnent des hash différents, et les attaques par force brute ou par tables précalculées deviennent très coûteuses.

**Le hash peut-il sortir de l'API ?**
Non : aucun `response_model` ne contient `password_hash`. Même si on renvoie l'objet `User` complet, FastAPI ne garde que les champs de `UserResponse` (`id` et `email`).

**Comment fonctionne l'authentification ?**
À la connexion, l'API vérifie le mot de passe et renvoie un token JWT signé avec la clé secrète. Ce token contient l'id de l'utilisateur (`sub`) et une date d'expiration (`exp`). Le front l'envoie dans l'en-tête `Authorization: Bearer <token>`. Pour chaque route protégée, `get_current_user` vérifie la signature et l'expiration, puis retrouve l'utilisateur en base.

**Pourquoi un token de 30 minutes ?**
Si le token est volé, il n'est utilisable que 30 minutes. Plus la durée est courte, plus le risque est faible, mais plus l'utilisateur doit se reconnecter souvent. 30 minutes est un compromis. La vraie solution serait un "refresh token" pour renouveler le token sans redemander le mot de passe.

**Où est la clé secrète JWT ?**
Dans `api/.env`, qui est dans le `.gitignore`. Le dépôt contient seulement `.env.example` avec une fausse valeur. L'API refuse de démarrer si la clé manque.

**Quel est le risque de stocker le JWT dans le `localStorage` ?**
N'importe quel script exécuté sur la page peut lire le `localStorage`. Si le site a une faille XSS (un script malveillant injecté), l'attaquant peut voler le token et se faire passer pour l'utilisateur.

**Quelle est l'alternative ?**
Un cookie `HttpOnly` (et `Secure`, `SameSite`) posé par l'API : le navigateur l'envoie automatiquement, mais le JavaScript ne peut pas le lire, donc un script XSS ne peut pas le voler. Il faut alors se protéger contre les attaques CSRF (c'est le rôle de `SameSite`).

**Comment est configuré le CORS ?**
Une seule origine autorisée : `http://localhost:5173`, le serveur Vite. On n'utilise jamais `allow_origins=["*"]` avec `allow_credentials=True` : n'importe quel site pourrait alors appeler l'API au nom de l'utilisateur.

**Êtes-vous protégés contre les injections SQL ?**
Oui : toutes les requêtes passent par l'ORM (SQLModel / SQLAlchemy), qui utilise des requêtes paramétrées. Même pour la recherche (`ilike(f"%{q}%")`), la valeur tapée par l'utilisateur est envoyée comme paramètre, jamais collée dans le texte SQL.

**Un utilisateur peut-il modifier la collection d'un autre ?**
Non, c'est vérifié côté serveur : pour modifier ou supprimer une entrée, on vérifie que `entry.user_id` est égal à l'id de l'utilisateur connecté. Sinon on renvoie 404. Masquer un bouton dans l'interface ne protège rien, puisqu'on peut appeler l'API directement.

**Pourquoi 404 et pas 403 quand l'entrée appartient à un autre ?**
Pour ne pas révéler qu'une entrée avec cet id existe. Du point de vue de l'utilisateur, une entrée qui n'est pas à lui n'existe pas.

---

## 8. Questions possibles - Frontend (React / TypeScript)

**Comment est organisé le front ?**
`types/api.ts` pour les types du contrat, `services/http.ts` pour le client HTTP, `context/` pour les deux Contexts, `hooks/` pour les hooks personnalisés, `components/` pour les composants réutilisables, `pages/` pour une page par route.

**Comment garantissez-vous le typage ?**
`strict: true` dans le tsconfig, aucun `any` dans le code. Les types du contrat sont écrits à la main dans `types/api.ts`. Le statut est une union littérale : `type Statut = "a_decouvrir" | "en_cours" | "termine"`, donc TypeScript refuse toute autre valeur.

**Où utilisez-vous `unknown` ?**
Dans la fiche d'un livre, quand l'ajout échoue : l'erreur attrapée est de type `unknown`. On vérifie avec la fonction `estApiError` (dans `http.ts`) que c'est bien une erreur de l'API avant d'afficher son message. C'est un "type guard" : après la vérification, TypeScript sait que c'est un `ApiError`.

**Comment fonctionne le client HTTP ?**
Tous les appels passent par `services/http.ts` (`apiGet`, `apiPost`, `apiPatch`, `apiDelete`). Il ajoute l'en-tête `Authorization` si un token existe, et si la réponse est une erreur, il lit le format `{"erreur": ...}` de l'API et lance un objet typé `ApiError`. Il n'y a aucun `fetch` ailleurs dans le code.

**Quels hooks personnalisés avez-vous ?**
- `useLocalStorage<T>` : générique, comme un `useState` mais la valeur est aussi enregistrée dans le `localStorage`. Il sert à garder le token.
- `useDebounce<T>` : renvoie la valeur seulement quand elle n'a pas changé pendant 400 ms. Il sert à la recherche du catalogue.

**Pourquoi un debounce sur la recherche ?**
Sans lui, taper "jojo" enverrait 4 requêtes. Avec le debounce, la requête part seulement quand l'utilisateur arrête de taper pendant 400 ms.

**À quoi servent les deux Contexts ?**
- `AuthContext` : le token, l'utilisateur connecté et les fonctions `login`, `register`, `logout`, accessibles depuis toutes les pages.
- `CollectionContext` : la liste des entrées et les fonctions pour charger, ajouter, modifier et supprimer.
Ça évite de passer ces données de composant en composant par les props.

**Comment fonctionnent les routes protégées ?**
Le composant `ProtectedRoute` entoure `/collection` et `/stats`. S'il n'y a pas de token, il redirige vers `/login` avec `<Navigate>`. Si le token est expiré, l'appel à `/auth/me` échoue au chargement, le token est supprimé et l'utilisateur est redirigé.

**Pourquoi `key={item.id}` et pas l'index ?**
React utilise la `key` pour savoir quel élément a changé. Avec l'index, si on supprime un élément au milieu de la liste, les éléments suivants changent d'index et React peut mélanger leurs états (par exemple le commentaire en cours de saisie). L'id est stable.

**Comment gérez-vous chargement, erreur et vide ?**
Chaque écran qui appelle l'API a un état `chargement`, un état `erreur` et teste si la liste est vide, avec un message pour chaque cas.

**Comment sont faites les couleurs par catégorie ?**
Les cartes ont un attribut `data-categorie`, et le CSS définit une couleur par catégorie avec des sélecteurs comme `[data-categorie="BD"]`. Pas de logique en plus dans le TypeScript.

**Pourquoi aucune librairie de composants ?**
C'était imposé par le sujet. Tout le style est dans un seul fichier CSS (`index.css`), organisé par section.

---

## 9. Limites connues (à assumer si on te les montre)

- **SQLite imposé par le sujet** : le projet utilise PostgreSQL (vérifier que c'est accepté).
- **Lint** : `npm run lint` signale encore des règles très strictes de la config Vite (`setState` dans un `useEffect`). Le build TypeScript passe sans erreur.
- **Doublons** : la vérification est faite dans le code, pas par une contrainte en base.
- **Commentaire** : on ne peut pas remettre un commentaire à vide (`null`) avec le PATCH.
- **Filtre de la collection** : si on change le statut d'un livre alors qu'un filtre est actif, il reste affiché jusqu'au prochain chargement.
- **Token** : pas de refresh token, l'utilisateur doit se reconnecter après 30 minutes.
- **Historique Git** : le sujet demande des commits répartis sur les séances.

---

## 10. Questions générales

**Qu'est-ce qui a été le plus difficile ?**
*(Réponse personnelle.)* Par exemple : faire correspondre exactement le contrat d'API entre le front et le back, ou le passage à PostgreSQL (fuseaux horaires des dates).

**Que feriez-vous avec plus de temps ?**
Des tests (pytest et vitest), un refresh token, le token dans un cookie `HttpOnly`, un thème sombre, la contrainte d'unicité en base, le déploiement en ligne.

**Comment avez-vous travaillé avec le contrat d'API ?**
Le contrat fixe les routes, les paramètres, les codes de retour et le format des réponses. Le front a ses types écrits à partir du contrat, le back a ses schémas Pydantic : les deux parties peuvent avancer séparément et se brancher à la fin.
