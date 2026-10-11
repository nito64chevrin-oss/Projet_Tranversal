import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CollectionProvider } from "./context/CollectionContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Header } from "./components/Header";
import { Catalogue } from "./pages/Catalogue";
import { ItemDetail } from "./pages/ItemDetail";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Collection } from "./pages/Collection";
import { Stats } from "./pages/Stats";

export function App() {
  return (
    <AuthProvider>
      <CollectionProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Catalogue />} />
            <Route path="/items/:id" element={<ItemDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/collection"
              element={
                <ProtectedRoute>
                  <Collection />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stats"
              element={
                <ProtectedRoute>
                  <Stats />
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </CollectionProvider>
    </AuthProvider>
  );
}