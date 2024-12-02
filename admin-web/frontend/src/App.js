// src/App.js

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./screens/Login";
import HomeScreen from "./screens/HomeScreen";
import AdminScreen from "./screens/AdminScreen"; // Importamos la pantalla del administrador
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar"; // Sidebar común
import TaskApp from "./taskApp"; // Importa el componente de TaskApp
import Analytics from "./screens/Analytics"; // Importa la pantalla de Analytics
import { AuthProvider } from "./AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta pública para el login */}
          <Route path="/" element={<Login />} />

          {/* Ruta protegida para el HomeScreen */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <div className="app-layout">
                  <Sidebar /> {/* Sidebar solo visible en la ruta protegida */}
                  <HomeScreen />
                </div>
              </ProtectedRoute>
            }
          />

          {/* Ruta protegida para la AdminScreen */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <div className="app-layout">
                  <Sidebar /> {/* Sidebar visible solo para administradores */}
                  <AdminScreen />
                </div>
              </ProtectedRoute>
            }
          />

          {/* Ruta protegida para la TaskApp (formulario de tareas) */}
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <div className="app-layout">
                  <Sidebar /> {/* Sidebar visible en la ruta de tareas */}
                  <TaskApp /> {/* Renderiza el formulario de tareas */}
                </div>
              </ProtectedRoute>
            }
          />

          {/* Ruta protegida para la Analytics */}
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <div className="app-layout">
                  <Sidebar /> {/* Sidebar visible en la ruta de analíticas */}
                  <Analytics /> {/* Renderiza la vista de Analytics */}
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
