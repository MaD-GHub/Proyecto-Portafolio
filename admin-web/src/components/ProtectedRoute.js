import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Si está cargando, no redirigimos nada aún
  if (loading) {
    return <div>Loading...</div>; // Puedes colocar un spinner o algo similar
  }

  // Si el usuario no está autenticado, redirigir a la página de login
  if (!user) {
    return <Navigate to="/" />; // Redirige al login si no está autenticado
  }

  return children;
};

export default ProtectedRoute;
