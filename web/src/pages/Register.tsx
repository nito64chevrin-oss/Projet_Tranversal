import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setErreur(null);
    setChargement(true);
    try {
      await register(email, password);
      navigate("/collection");
    } catch {
      setErreur("Impossible de créer le compte");
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="page">
      <form onSubmit={handleSubmit} className="auth-form">
        <h1>Inscription</h1>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="password">Mot de passe</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        {erreur && <p className="form-error">{erreur}</p>}
        <button type="submit" disabled={chargement}>
          {chargement ? "Création..." : "Créer mon compte"}
        </button>
        <p>
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </form>
    </div>
  );
}