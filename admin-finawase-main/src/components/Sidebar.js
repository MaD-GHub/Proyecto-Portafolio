import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaBars, FaHouseUser, FaUser, FaChartLine, FaFolder, FaShieldAlt, FaSignOutAlt, FaQuestionCircle } from "react-icons/fa";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useTheme } from "../contexts/ThemeContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(() => {
    const savedIsExpanded = localStorage.getItem("isSidebarExpanded");
    return savedIsExpanded !== null ? JSON.parse(savedIsExpanded) : false;
  });
  const [isAdmin, setIsAdmin] = useState(true);
  const { isDarkMode, toggleTheme } = useTheme();

   // Cargar el estado de `isExpanded` desde localStorage
   useEffect(() => {
    const savedIsExpanded = localStorage.getItem("isSidebarExpanded");
    if (savedIsExpanded !== null) {
      setIsExpanded(JSON.parse(savedIsExpanded));
    }
  }, []);

  // Guardar el estado de `isExpanded` en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem("isSidebarExpanded", JSON.stringify(isExpanded));
  }, [isExpanded]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Cerraste sesión correctamente");
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Hubo un problema al cerrar sesión, intenta nuevamente.");
    }
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <aside className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {/* Botón para contraer/expandir el menú */}
      <div className="p-6 flex items-center justify-between border-b border-purple-700">
        <button onClick={toggleSidebar} className="text-white">
          <FaBars />
        </button>
        {isExpanded && <img src="/Logo_Finawase.png" alt="Logo de la App" className="h-24 px-10" />}
      </div>

      {/* Switch para alternar entre Administración y Gestión */}
      <div className="p-4 flex items-center justify-between">
        {isExpanded && <span className="font-semibold">Administración</span>}
        <label className="swap swap-flip">
          <input
            type="checkbox"
            checked={!isAdmin}
            onChange={() => setIsAdmin(!isAdmin)}
          />
          <div className="swap-on">Gestión</div>
          <div className="swap-off">Admin</div>
        </label>
      </div>

      {/* Switch para modo oscuro */}
      <div className="p-4 flex items-center justify-between">
        {isExpanded && <span className="font-semibold">Modo Oscuro</span>}
        <label className="swap swap-rotate">
          <input
            type="checkbox"
            checked={isDarkMode}
            onChange={toggleTheme}
          />
          <svg
            className="swap-on fill-current w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M5.64 17.74A9 9 0 0112 3a9 9 0 100 18 9 9 0 01-6.36-2.26z"></path>
          </svg>
          <svg
            className="swap-off fill-current w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path d="M21 12.79A9 9 0 118.21 3.55a7 7 0 1010.24 10.24 8.94 8.94 0 012.55-.96z"></path>
          </svg>
        </label>
      </div>

      {/* Opciones de navegación según la sección seleccionada */}
      <nav className="flex-grow p-4 space-y-4">
        {isAdmin ? (
          <>
            <Link to="/dashboard" className="block py-2 px-2 rounded-lg hover:bg-purple-700">
              <FaHouseUser className="inline-block" />
              {isExpanded && <span className="ml-3">Inicio</span>}
            </Link>
            <Link to="/usuarios" className="block py-2 px-2 rounded-lg hover:bg-purple-700">
              <FaUser className="inline-block" />
              {isExpanded && <span className="ml-3">Usuarios</span>}
            </Link>
            <Link to="/estadisticas" className="block py-2 px-2 rounded-lg hover:bg-purple-700">
              <FaChartLine className="inline-block" />
              {isExpanded && <span className="ml-3">Estadísticas</span>}
            </Link>
            <Link to="/seguridad" className="block py-2 px-2 rounded-lg hover:bg-purple-700">
              <FaShieldAlt className="inline-block" />
              {isExpanded && <span className="ml-3">Herramientas de Seguridad</span>}
            </Link>
            <Link to="/configuracion" className="block py-2 px-2 rounded-lg hover:bg-purple-700">
              <FaFolder className="inline-block" />
              {isExpanded && <span className="ml-3">Configuración</span>}
            </Link>
          </>
        ) : (
          <>
            <Link to="/gestion-contenido" className="block py-2 px-2 rounded-lg hover:bg-purple-700">
              <FaFolder className="inline-block" />
              {isExpanded && <span className="ml-3">Gestión de Contenido</span>}
            </Link>
            <Link to="/categorias" className="block py-2 px-2 rounded-lg hover:bg-purple-700">
              <FaFolder className="inline-block" />
              {isExpanded && <span className="ml-3">Gestión de Categorias</span>}
            </Link>
            <Link to="/solicitudes" className="block py-2 px-2 rounded-lg hover:bg-purple-700">
              <FaQuestionCircle className="inline-block" />
              {isExpanded && <span className="ml-3">Gestión de Solicitudes</span>}
            </Link>
          </>
        )}
      </nav>

      <div className="p-4">
        <button onClick={handleLogout} className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
          <FaSignOutAlt className="inline-block" />
          {isExpanded && <span className="ml-3">Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
