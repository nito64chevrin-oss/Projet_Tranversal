export type Statut = "a_decouvrir" | "en_cours" | "termine";

export type Tri = "date" | "note";

export interface Item {
  id: number;
  titre: string;
  categorie: string;
  description: string;
  image_url: string;
  annee: number;
  auteur: string;
  nombre_pages: number;
}

export interface ItemsListResponse {
  total: number;
  page: number;
  limit: number;
  results: Item[];
}

export interface Entry {
  id: number;
  statut: Statut;
  note: number | null;
  commentaire: string | null;
  date_ajout: string;
  item: Item;
}

export interface StatsResponse {
  total: number;
  par_statut: Record<Statut, number>;
  note_moyenne: number | null;
}

export interface User {
  id: number;
  email: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface ApiError {
  code: number;
  message: string;
}