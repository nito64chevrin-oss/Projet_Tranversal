# Interface Ma Collection

Interface React + TypeScript (mode strict) + Vite, qui consomme l'API du dossier `api/`.

L'installation et le lancement sont décrits dans le [README racine](../README.md). L'API doit tourner sur http://localhost:8000.

## Scripts

| Commande          | Effet                                       |
| ----------------- | ------------------------------------------- |
| `npm run dev`     | Serveur de développement (port 5173)        |
| `npm run build`   | Vérification TypeScript et build de production |
| `npm run lint`    | ESLint                                      |
| `npm run preview` | Sert le build de production                 |

## Pages

| Route         | Page                                          | Connexion requise |
| ------------- | --------------------------------------------- | ----------------- |
| `/`           | Catalogue : recherche, filtre, pagination     | non               |
| `/items/:id`  | Détail d'un livre, ajout à la collection      | non               |
| `/login`      | Connexion                                     | non               |
| `/register`   | Inscription                                   | non               |
| `/collection` | Ma collection : filtre, tri, statut, note, commentaire | oui      |
| `/stats`      | Statistiques                                  | oui               |

## Structure

```
src/types/api.ts      types du contrat d'API, écrits à la main
src/services/http.ts  client HTTP unique (en-tête Authorization, format d'erreur)
src/context/          AuthContext (token, utilisateur) et CollectionContext
src/hooks/            useLocalStorage (générique) et useDebounce
src/components/       Header, BookCard, EntryCard, ProtectedRoute
src/pages/            une page par route
```

## Stockage du token

Le token JWT est stocké dans le `localStorage`. Le risque : un script injecté dans la page (faille XSS) peut le lire et l'envoyer ailleurs. L'alternative est un cookie `HttpOnly` posé par l'API, que le JavaScript ne peut pas lire.
