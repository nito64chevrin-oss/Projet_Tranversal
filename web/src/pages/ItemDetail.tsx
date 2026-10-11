import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiGet, estApiError } from "../services/http";
import { useAuth } from "../context/AuthContext";
import { useCollection } from "../context/CollectionContext";
import { SimilarBooks } from "../components/SimilarBooks";
import type { Item } from "../types/api";

export function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { ajouterEntree } = useCollection();

  const [item, setItem] = useState<Item | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);
  const [ajout, setAjout] = useState(false);
  const [erreurAjout, setErreurAjout] = useState<string | null>(null);

  useEffect(() => {
    setChargement(true);
    setErreur(null);
    apiGet<Item>(`/items/${id}`)
      .then((data) => setItem(data))
      .catch(() => setErreur("Ce livre n'existe pas"))
      .finally(() => setChargement(false));
  }, [id]);

  async function handleAjouter(): Promise<void> {
    if (!item) return;
    setAjout(true);
    setErreurAjout(null);
    try {
      await ajouterEntree({ item_id: item.id, statut: "a_decouvrir" });
      navigate("/collection");
    } catch (e: unknown) {
      setErreurAjout(estApiError(e) ? e.message : "Impossible d'ajouter ce livre à ta collection");
      setAjout(false);
    }
  }

  return (
    <div className="page">
      {chargement && <p>Chargement...</p>}
      {erreur && <p className="form-error">{erreur}</p>}

      {!chargement && !erreur && item && (
        <div className="item-detail" data-categorie={item.categorie}>
          <div className="item-info">
            <span className="book-tag">{item.categorie}</span>
            <h1>{item.titre}</h1>
            <p className="book-author">
              {item.auteur} — {item.annee}
            </p>
            <p>{item.nombre_pages} pages</p>
            <p>{item.description}</p>

            {erreurAjout && <p className="form-error">{erreurAjout}</p>}

            {isAuthenticated ? (
              <button type="button" onClick={handleAjouter} disabled={ajout}>
                {ajout ? "Ajout..." : "Ajouter à ma collection"}
              </button>
            ) : (
              <p>
                <Link to="/login">Connecte-toi</Link> pour ajouter ce livre à ta collection.
              </p>
            )}
          </div>
        </div>
      )}

      {!chargement && !erreur && item && <SimilarBooks itemId={item.id} />}
    </div>
  );
}