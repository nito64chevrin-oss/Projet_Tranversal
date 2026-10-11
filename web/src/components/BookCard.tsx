import { Link } from "react-router-dom";
import type { Item } from "../types/api";

interface BookCardProps {
  item: Item;
}

export function BookCard({ item }: BookCardProps) {
  return (
    <Link to={`/items/${item.id}`} className="book-card" data-categorie={item.categorie}>
      <div className="book-info">
        <span className="book-tag">{item.categorie}</span>
        <div className="book-title">{item.titre}</div>
        <div className="book-author">{item.auteur}</div>
        <div className="book-meta">
          {item.annee} · {item.nombre_pages} pages
        </div>
      </div>
    </Link>
  );
}