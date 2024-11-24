import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaHouseUser, FaUser, FaChartLine, FaCog, FaFolder, FaUsers, FaShieldAlt, FaSignOutAlt, FaFileAlt, FaTools, FaCaretDown, FaCaretUp } from 'react-icons/fa';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import '../index.css';


const Sidebar = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [gestionVisible, setGestionVisible] = useState(false);
  const [administracionVisible, setAdministracionVisible] = useState(false);

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

  const toggleGestion = () => {
    setGestionVisible(!gestionVisible);
  };

  const toggleAdministracion = () => {
    setAdministracionVisible(!administracionVisible);
  };

  return (
    <aside className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="p-6 flex items-center justify-between border-b border-purple-700">
        <button onClick={toggleSidebar} className="text-white">
          <FaBars />
        </button>
        {isExpanded && (
          <Link to="/dashboard"> 
            <img src="/Logo_Finawase.png" alt="Logo de la App" className="h-35 px-10" />
          </Link>
  )}
      </div>

      <nav className="flex-grow p-6">
        <div>
          <button onClick={toggleGestion} className="block py-2 px-0.2 mb-2 rounded hover:bg-purple-700 text-white w-full text-left flex items-center justify-between">
            <span>Gestión</span>
            {gestionVisible ? <FaCaretUp /> : <FaCaretDown />}
          </button>
          {gestionVisible && (
            <div className="pl-4">
              <Link to="/usuarios" className="block py-2 px-0.2 mb-2 rounded hover:bg-purple-700">
                <FaUser className="inline-block" />
                {isExpanded && <span className="ml-3">Gestión de Usuarios</span>}
              </Link>
              <Link to="/solicitudes" className="block py-2 px-0.2 mb-2 rounded hover:bg-purple-700">
                <FaFileAlt className="inline-block" />
                {isExpanded && <span className="ml-3">Gestión de Solicitudes</span>}
              </Link>
              <Link to="/categorias" className="block py-2 px-0.2 mb-2 rounded hover:bg-purple-700">
                <FaFolder className="inline-block" />
                {isExpanded && <span className="ml-3">Gestión de Categorías</span>}
              </Link>
              <Link to="/gestion-contenido" className="block py-2 px-0.2 mb-2 rounded hover:bg-purple-700">
                <FaFolder className="inline-block" />
                {isExpanded && <span className="ml-3">Gestión de Contenido</span>}
              </Link>
              <Link to="/configuracion" className="block py-2 px-0.2 mb-2 rounded hover:bg-purple-700">
                <FaCog className="inline-block" />
                {isExpanded && <span className="ml-3">Configuración</span>}
              </Link>
            </div>
          )}
        </div>

        <div>
          <button onClick={toggleAdministracion} className="block py-2 px-0.2 mb-2 rounded hover:bg-purple-700 text-white w-full text-left flex items-center justify-between">
            <span>Administración</span>
            {administracionVisible ? <FaCaretUp /> : <FaCaretDown />}
          </button>
          {administracionVisible && (
            <div className="pl-4">
              <Link to="/estadisticas" className="block py-2 px-0.2 mb-2 rounded hover:bg-purple-700">
                <FaChartLine className="inline-block" />
                {isExpanded && <span className="ml-3">Estadísticas</span>}
              </Link>
              <Link to="/analisis" className="block py-2 px-0.2 mb-2 rounded hover:bg-purple-700">
                <FaChartLine className="inline-block" />
                {isExpanded && <span className="ml-3">Análisis y Seguimiento</span>}
              </Link>
              <Link to="/seguridad" className="block py-2 px-0.2 mb-2 rounded hover:bg-purple-700">
                <FaShieldAlt className="inline-block" />
                {isExpanded && <span className="ml-3">Herramientas de Seguridad</span>}
              </Link>
              <Link to="/configuracion" className="block py-2 px-0.2 mb-2 rounded hover:bg-purple-700">
                <FaCog className="inline-block" />
                {isExpanded && <span className="ml-3">Configuración</span>}
              </Link>
            </div>
          )}
        </div>
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
