import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./screens/Login";
import HomeScreen from "./screens/HomeScreen";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar"; // Importa el Sidebar
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
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
