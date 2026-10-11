import { createContext, useContext, useState, type ReactNode } from "react";
import { apiDelete, apiGet, apiPatch, apiPost } from "../services/http";
import type { Entry, Statut, Tri } from "../types/api";

interface NouvelleEntree {
  item_id: number;
  statut: Statut;
  note?: number;
  commentaire?: string;
}

interface CollectionContextType {
  entries: Entry[];
  chargement: boolean;
  erreur: string | null;
  chargerCollection: (statut: Statut | "", tri: Tri) => Promise<void>;
  ajouterEntree: (data: NouvelleEntree) => Promise<void>;
  modifierEntree: (id: number, data: Partial<NouvelleEntree>) => Promise<void>;
  supprimerEntree: (id: number) => Promise<void>;
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

export function CollectionProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function chargerCollection(statut: Statut | "", tri: Tri): Promise<void> {
    setChargement(true);
    setErreur(null);
    const params = new URLSearchParams();
    if (statut) {
      params.set("statut", statut);
    }
    params.set("tri", tri);
    try {
      const data = await apiGet<Entry[]>(`/me/collection?${params.toString()}`);
      setEntries(data);
    } catch {
      setErreur("Impossible de charger la collection");
    } finally {
      setChargement(false);
    }
  }

  async function ajouterEntree(data: NouvelleEntree): Promise<void> {
    const entree = await apiPost<Entry>("/me/collection", data);
    setEntries((prec) => [...prec, entree]);
  }

  async function modifierEntree(id: number, data: Partial<NouvelleEntree>): Promise<void> {
    const entree = await apiPatch<Entry>(`/me/collection/${id}`, data);
    setEntries((prec) => prec.map((e) => (e.id === id ? entree : e)));
  }

  async function supprimerEntree(id: number): Promise<void> {
    await apiDelete<void>(`/me/collection/${id}`);
    setEntries((prec) => prec.filter((e) => e.id !== id));
  }

  const value: CollectionContextType = {
    entries,
    chargement,
    erreur,
    chargerCollection,
    ajouterEntree,
    modifierEntree,
    supprimerEntree,
  };

  return <CollectionContext.Provider value={value}>{children}</CollectionContext.Provider>;
}

export function useCollection(): CollectionContextType {
  const context = useContext(CollectionContext);
  if (context === undefined) {
    throw new Error("useCollection doit être utilisé dans un CollectionProvider");
  }
  return context;
}