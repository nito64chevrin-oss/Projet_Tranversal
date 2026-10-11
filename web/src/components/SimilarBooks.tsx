import { useEffect, useState } from "react";
import { apiGet } from "../services/http";
import { BookCard } from "./BookCard";
import type { Item } from "../types/api";

interface SimilarBooksProps {
  itemId: number;
}

export function SimilarBooks({ itemId }: SimilarBooksProps) {
  const [livres, setLivres] = useState<Item[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    setChargement(true);
    setErreur(null);
    apiGet<Item[]>(`/items/${itemId}/similaires?k=5`)
      .then((data) => setLivres(data))
      .catch(() => setErreur("Impossible de charger les livres similaires"))
      .finally(() => setChargement(false));
  }, [itemId]);

  return (
    <section className="similar-books">
      <h2>Livres similaires</h2>
      {chargement && <p>Chargement...</p>}
      {erreur && <p className="form-error">{erreur}</p>}
      {!chargement && !erreur && livres.length === 0 && <p>Aucun livre similaire.</p>}
      {!chargement && !erreur && livres.length > 0 && (
        <div className="book-grid">
          {livres.map((livre) => (
            <BookCard key={livre.id} item={livre} />
          ))}
        </div>
      )}
    </section>
  );
}
