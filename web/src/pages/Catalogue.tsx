import { useEffect, useState } from "react";
import { apiGet } from "../services/http";
import { useDebounce } from "../hooks/useDebounce";
import { BookCard } from "../components/BookCard";
import type { ItemsListResponse } from "../types/api";

export function Catalogue() {
  const [recherche, setRecherche] = useState("");
  const [categorie, setCategorie] = useState("");
  const [page, setPage] = useState(1);
  const [donnees, setDonnees] = useState<ItemsListResponse | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  const rechercheDebattue = useDebounce(recherche, 400);

  useEffect(() => {
    setChargement(true);
    setErreur(null);

    const params = new URLSearchParams();
    if (rechercheDebattue.length >= 2) {
      params.set("q", rechercheDebattue);
    }
    if (categorie) {
      params.set("categorie", categorie);
    }
    params.set("page", String(page));

    apiGet<ItemsListResponse>(`/items?${params.toString()}`)
      .then((data) => setDonnees(data))
      .catch(() => setErreur("Impossible de charger le catalogue"))
      .finally(() => setChargement(false));
  }, [rechercheDebattue, categorie, page]);

  const nbPages = donnees ? Math.max(1, Math.ceil(donnees.total / donnees.limit)) : 1;

  return (
    <div className="page">
      <h1>Catalogue</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Rechercher un titre..."
          value={recherche}
          onChange={(e) => {
            setRecherche(e.target.value);
            setPage(1);
          }}
        />
        <select
          value={categorie}
          onChange={(e) => {
            setCategorie(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Tous les genres</option>
          <option value="Littérature">Littérature</option>
          <option value="BD">BD</option>
          <option value="Manga">Manga</option>
          <option value="Guide">Guide</option>
        </select>
      </div>

      {chargement && <p>Chargement...</p>}
      {erreur && <p className="form-error">{erreur}</p>}
      {!chargement && !erreur && donnees && donnees.results.length === 0 && (
        <p>Aucun livre trouvé.</p>
      )}

      {!chargement && !erreur && donnees && donnees.results.length > 0 && (
        <div className="book-grid">
          {donnees.results.map((item) => (
            <BookCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {!erreur && donnees && donnees.total > 0 && (
        <div className="pagination">
          <button type="button" onClick={() => setPage(page - 1)} disabled={page <= 1}>
            Précédent
          </button>
          <span>
            Page {page} / {nbPages}
          </span>
          <button type="button" onClick={() => setPage(page + 1)} disabled={page >= nbPages}>
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}