import { useState } from "react";
import type { Entry, Statut } from "../types/api";

interface EntryCardProps {
  entree: Entry;
  onModifier: (id: number, data: { statut?: Statut; note?: number; commentaire?: string }) => void;
  onSupprimer: (id: number) => void;
}

export function EntryCard({ entree, onModifier, onSupprimer }: EntryCardProps) {
  const [commentaire, setCommentaire] = useState(entree.commentaire ?? "");

  return (
    <div className="entry-card">
      <div className="entry-title">{entree.item.titre}</div>
      <div>{entree.item.auteur}</div>
      <select
        value={entree.statut}
        onChange={(e) => onModifier(entree.id, { statut: e.target.value as Statut })}
      >
        <option value="a_decouvrir">À découvrir</option>
        <option value="en_cours">En cours</option>
        <option value="termine">Terminé</option>
      </select>
      <select
        value={entree.note ?? ""}
        onChange={(e) => onModifier(entree.id, { note: Number(e.target.value) })}
      >
        <option value="" disabled>
          Note
        </option>
        <option value="1">1 / 5</option>
        <option value="2">2 / 5</option>
        <option value="3">3 / 5</option>
        <option value="4">4 / 5</option>
        <option value="5">5 / 5</option>
      </select>
      <input
        type="text"
        placeholder="Commentaire"
        value={commentaire}
        onChange={(e) => setCommentaire(e.target.value)}
        onBlur={() => {
          if (commentaire !== (entree.commentaire ?? "")) {
            onModifier(entree.id, { commentaire });
          }
        }}
      />
      <div className="entry-date">Ajouté le {new Date(entree.date_ajout).toLocaleDateString("fr-FR")}</div>
      <button type="button" onClick={() => onSupprimer(entree.id)}>
        Retirer
      </button>
    </div>
  );
}
