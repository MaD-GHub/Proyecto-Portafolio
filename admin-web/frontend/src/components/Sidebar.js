// src/components/Sidebar.js

import React, { useState } from "react";
import "../styles/Sidebar.css"; // Estilos del Sidebar
import logo from "../img/Logo_blanco.png"; // Logo de la app
import { GrHomeRounded } from "react-icons/gr"; // Ícono de Home
import { TbSettingsPlus } from "react-icons/tb"; // Ícono de Mantenedor
import { SlGraph, SlSettings } from "react-icons/sl"; // Íconos de Analíticas y Configuración
import { FaRegUser } from "react-icons/fa"; // Ícono de Usuario
import { AiOutlineLogout } from "react-icons/ai"; // Ícono de Logout
import { useNavigate } from "react-router-dom"; // Hook para la redirección

const Sidebar = () => {
  const [activePage, setActivePage] = useState("home"); // Estado para manejar la página activa
  const navigate = useNavigate(); // Hook de redirección

  // Función para redirigir a la página de administración (Mantenedor)
  const handleMaintenanceClick = () => {
    navigate("/admin"); // Redirige a la ruta de Admin
    setActivePage("maintenance"); // Cambia la página activa para reflejar el cambio visual
  };

  // Nueva función para redirigir a la página de tareas
  const handleTaskAppClick = () => {
    navigate("/tasks"); // Redirige a la ruta de TaskApp
    setActivePage("tasks"); // Cambia la página activa para reflejar el cambio visual
  };

  // Función para redirigir a la página de Analíticas
  const handleAnalyticsClick = () => {
    navigate("/analytics"); // Redirige a la ruta de Analytics
    setActivePage("analytics"); // Cambia la página activa para reflejar el cambio visual
  };

  return (
    <>
      {/* Logo fuera del Sidebar */}
      <div className="floating-logo">
        <img src={logo} alt="FinaWise Logo" />
      </div>

      {/* Sidebar Superior */}
      <aside className="sidebar sidebar-top">
        <nav className="sidebar-nav">
          {/* Botón Home */}
          <button
            className={`sidebar-item ${activePage === "home" ? "active" : ""}`}
            onClick={() => {
              navigate("/home");
              setActivePage("home");
            }}
          >
            <GrHomeRounded size={18} />
          </button>

          {/* Botón Mantenedor (ahora con la redirección al admin) */}
          <button
            className={`sidebar-item ${
              activePage === "maintenance" ? "active" : ""
            }`}
            onClick={handleMaintenanceClick}
          >
            <TbSettingsPlus size={18} />
          </button>

          {/* Botón Analíticas */}
          <button
            className={`sidebar-item ${activePage === "analytics" ? "active" : ""}`}
            onClick={handleAnalyticsClick} // Redirige a la ruta de analíticas
          >
            <SlGraph size={18} />
          </button>

          {/* Botón Configuración */}
          <button
            className={`sidebar-item ${
              activePage === "settings" ? "active" : ""
            }`}
            onClick={() => setActivePage("settings")}
          >
            <SlSettings size={18} />
          </button>
        </nav>
      </aside>

      {/* Sidebar Inferior */}
      <aside className="sidebar sidebar-bottom">
        <nav className="sidebar-nav">
          {/* Botón Logout */}
          <button className="sidebar-item">
            <AiOutlineLogout size={18} />
          </button>

          {/* Botón Usuario */}
          <button className="sidebar-item">
            <FaRegUser size={18} />
          </button>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
