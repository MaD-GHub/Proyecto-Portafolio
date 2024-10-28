import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaHouseUser, FaUser, FaChartLine, FaCog, FaFolder, FaUsers, FaShieldAlt, FaPaintBrush, FaSignOutAlt } from 'react-icons/fa';
import { signOut } from 'firebase/auth'; // Importa el método signOut de Firebase Authentication
import { auth } from '../firebase'; // Asegúrate de tener configurado Firebase Authentication
import '../index.css'; // Asegúrate de añadir tus estilos en un archivo CSS adecuado

const Sidebar = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false); // Estado para controlar si el menú está expandido o contraído

  const handleLogout = async () => {
    try {
      await signOut(auth); // Cierra sesión correctamente usando Firebase Authentication
      alert("Cerraste sesión correctamente");
      navigate("/login"); // Redirige al usuario al inicio o al login
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Hubo un problema al cerrar sesión, intenta nuevamente.");
    }
  };

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded); // Cambiar el estado al hacer clic en el botón
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

      {/* Navegación */}
      <nav className="flex-grow p-6">
        <Link to="/dashboard" className="block py-2 px-0.2 mb-2 rounded hover:bg-purple-700">
          <FaHouseUser className="inline-block" />
          {isExpanded && <span className="ml-3">Inicio</span>}
        </Link>
        <Link to="/usuarios" className="block py-2 px-0.2 mb-2 rounded hover:bg-purple-700">
          <FaUser className="inline-block" />
          {isExpanded && <span className="ml-3">Usuarios</span>}
        </Link>
        <Link to="/solicitudes" className="block py-2 px-0.2 mb-2 rounded hover:bg-purple-700">
          <FaUser className="inline-block" />
          {isExpanded && <span className="ml-3">Solicitudes</span>}
        </Link>
        <Link to="/estadisticas" className="block py-2 px-0.2 mb-2 rounded hover:bg-purple-700">
          <FaChartLine className="inline-block" />
          {isExpanded && <span className="ml-3">Estadísticas</span>}
        </Link>
        <Link to="/configuracion" className="block py-2 px-0.2 mb-2 rounded hover:bg-purple-700">
          <FaCog className="inline-block" />
          {isExpanded && <span className="ml-3">Configuración</span>}
        </Link>
        <Link to="/gestion-contenido" className="block py-2 px-0.2 mb-2 rounded hover:bg-purple-700">
          <FaFolder className="inline-block" />
          {isExpanded && <span className="ml-3">Gestión de Contenido</span>}
        </Link>
        <Link to="/analisis" className="block py-2 px-0.2 mb-2 rounded hover:bg-purple-700">
          <FaChartLine className="inline-block" />
          {isExpanded && <span className="ml-3">Análisis y Seguimiento</span>}
        </Link>
        <Link to="/seguridad" className="block py-2 px-0.2 mb-2 rounded hover:bg-purple-700">
          <FaShieldAlt className="inline-block" />
          {isExpanded && <span className="ml-3">Herramientas de Seguridad</span>}
        </Link>
      </nav>

      <div className="p-6">
        <button onClick={handleLogout} className="w-full py-2 bg-red-600 text-white rounded-xl hover:bg-red-300">
          <FaSignOutAlt className="inline-block" />
          {isExpanded && <span className="ml-3">Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
