import React, { useState } from "react";
import "../styles/Sidebar.css"; // Estilos del Sidebar
import logo from "../img/Logo_blanco.png"; // Logo de la app
import { GrHomeRounded } from "react-icons/gr"; // Ícono de Home
import { TbSettingsPlus } from "react-icons/tb"; // Ícono de Mantenedor
import { SlGraph, SlSettings } from "react-icons/sl"; // Íconos de Analíticas y Configuración
import { FaRegUser } from "react-icons/fa"; // Ícono de Usuario
import { AiOutlineLogout } from "react-icons/ai"; // Ícono de Logout

const Sidebar = () => {
  const [activePage, setActivePage] = useState("home"); // Estado para manejar la página activa

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
            onClick={() => setActivePage("home")}
          >
            <GrHomeRounded size={18} />
          </button>

          {/* Botón Mantenedor */}
          <button
            className={`sidebar-item ${
              activePage === "maintenance" ? "active" : ""
            }`}
            onClick={() => setActivePage("maintenance")}
          >
            <TbSettingsPlus size={18} />
          </button>

          {/* Botón Analíticas */}
          <button
            className={`sidebar-item ${
              activePage === "analytics" ? "active" : ""
            }`}
            onClick={() => setActivePage("analytics")}
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
