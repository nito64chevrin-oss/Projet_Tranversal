import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="app-header">
      <Link to="/" className="logo">
        Ma Collection
      </Link>
      <nav>
        <Link to="/">Catalogue</Link>
        {isAuthenticated && <Link to="/collection">Ma collection</Link>}
        {isAuthenticated && <Link to="/stats">Statistiques</Link>}
        {isAuthenticated ? (
          <>
            <span className="user-email">{user?.email}</span>
            <button type="button" onClick={logout}>
              Déconnexion
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Connexion</Link>
            <Link to="/register">Inscription</Link>
          </>
        )}
      </nav>
    </header>
  );
}