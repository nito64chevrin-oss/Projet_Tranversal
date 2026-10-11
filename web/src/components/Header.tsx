import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="app-header">
      <Link to="/" className="logo">
        Ma Collection
      </Link>
      <nav>
        <NavLink to="/" end>
          Catalogue
        </NavLink>
        {isAuthenticated && <NavLink to="/collection">Ma collection</NavLink>}
        {isAuthenticated && <NavLink to="/stats">Statistiques</NavLink>}
        {isAuthenticated ? (
          <>
            <span className="user-email">{user?.email}</span>
            <button type="button" onClick={logout}>
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Connexion</NavLink>
            <NavLink to="/register">Inscription</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}