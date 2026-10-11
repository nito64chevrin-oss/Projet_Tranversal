import math

from models.model import Book


def distance(a: Book, b: Book, ecart_annees: int, ecart_pages: int) -> float:
    # 0 si même catégorie, 1 sinon
    d_categorie = 0 if a.categorie == b.categorie else 1
    # écarts ramenés entre 0 et 1 pour que les trois critères pèsent pareil
    d_annee = abs(a.annee - b.annee) / ecart_annees
    d_pages = abs(a.nombre_pages - b.nombre_pages) / ecart_pages
    return math.sqrt(d_categorie ** 2 + d_annee ** 2 + d_pages ** 2)


def k_plus_proches_voisins(livre: Book, tous_les_livres: list[Book], k: int) -> list[Book]:
    annees = [b.annee for b in tous_les_livres]
    pages = [b.nombre_pages for b in tous_les_livres]
    # max(..., 1) évite une division par zéro si tous les livres ont la même valeur
    ecart_annees = max(max(annees) - min(annees), 1)
    ecart_pages = max(max(pages) - min(pages), 1)

    autres = [b for b in tous_les_livres if b.id != livre.id]
    autres.sort(key=lambda b: distance(livre, b, ecart_annees, ecart_pages))
    return autres[:k]
