import { useEffect, useState } from "react";
import { apiGet } from "../services/http";
import type { StatsResponse } from "../types/api";

export function Stats() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    apiGet<StatsResponse>("/me/stats")
      .then((data) => setStats(data))
      .catch(() => setErreur("Impossible de charger les statistiques"))
      .finally(() => setChargement(false));
  }, []);

  return (
    <div className="page">
      <h1>Statistiques</h1>

      {chargement && <p>Chargement...</p>}
      {erreur && <p className="form-error">{erreur}</p>}

      {!chargement && !erreur && stats && stats.total === 0 && (
        <p>Aucune statistique pour l'instant, ta collection est vide.</p>
      )}

      {!chargement && !erreur && stats && stats.total > 0 && (
        <div className="stats-grid">
          <div className="stat-tile">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Livres dans la collection</div>
          </div>
          <div className="stat-tile">
            <div className="stat-value">{stats.par_statut.a_decouvrir}</div>
            <div className="stat-label">À découvrir</div>
          </div>
          <div className="stat-tile">
            <div className="stat-value">{stats.par_statut.en_cours}</div>
            <div className="stat-label">En cours</div>
          </div>
          <div className="stat-tile">
            <div className="stat-value">{stats.par_statut.termine}</div>
            <div className="stat-label">Terminés</div>
          </div>
          <div className="stat-tile">
            <div className="stat-value">
              {stats.note_moyenne !== null ? stats.note_moyenne.toFixed(1) : "—"}
            </div>
            <div className="stat-label">Note moyenne</div>
          </div>
        </div>
      )}
    </div>
  );
}