import { useEffect, useState } from "react";
import { useCollection } from "../context/CollectionContext";
import { EntryCard } from "../components/EntryCard";
import type { Statut, Tri } from "../types/api";

export function Collection() {
  const { entries, chargement, erreur, chargerCollection, modifierEntree, supprimerEntree } =
    useCollection();
  const [statut, setStatut] = useState<Statut | "">("");
  const [tri, setTri] = useState<Tri>("date");
  const [erreurAction, setErreurAction] = useState<string | null>(null);

  useEffect(() => {
    chargerCollection(statut, tri);
  }, [statut, tri]);

  async function handleModifier(
    id: number,
    data: { statut?: Statut; note?: number; commentaire?: string }
  ): Promise<void> {
    setErreurAction(null);
    try {
      await modifierEntree(id, data);
    } catch {
      setErreurAction("Impossible de modifier cette entrée");
    }
  }

  async function handleSupprimer(id: number): Promise<void> {
    setErreurAction(null);
    try {
      await supprimerEntree(id);
    } catch {
      setErreurAction("Impossible de supprimer cette entrée");
    }
  }

  return (
    <div className="page">
      <h1>Ma collection</h1>

      <div className="filters">
        <select value={statut} onChange={(e) => setStatut(e.target.value as Statut | "")}>
          <option value="">Tous les statuts</option>
          <option value="a_decouvrir">À découvrir</option>
          <option value="en_cours">En cours</option>
          <option value="termine">Terminé</option>
        </select>
        <select value={tri} onChange={(e) => setTri(e.target.value as Tri)}>
          <option value="date">Trier par date d'ajout</option>
          <option value="note">Trier par note</option>
        </select>
      </div>

      {erreurAction && <p className="form-error">{erreurAction}</p>}
      {chargement && <p>Chargement...</p>}
      {erreur && <p className="form-error">{erreur}</p>}
      {!chargement && !erreur && entries.length === 0 && <p>Aucun livre dans ta collection.</p>}

      {!chargement && !erreur && entries.length > 0 && (
        <div className="entry-list">
          {entries.map((entree) => (
            <EntryCard
              key={entree.id}
              entree={entree}
              onModifier={handleModifier}
              onSupprimer={handleSupprimer}
            />
          ))}
        </div>
      )}
    </div>
  );
}
