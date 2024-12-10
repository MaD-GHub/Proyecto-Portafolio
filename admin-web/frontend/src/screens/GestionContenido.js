import React, { useState } from "react";
import GestionNoticias from "../components/gestionNoticias";
import GestionLecturas from "../components/gestionLecturas"; // Nuevo componente de Lecturas
import GestionArticulos from "../components/gestionArticulos"; // Nuevo componente de Artículos
import GestionGlosario from "../components/gestionGlosario"; // Nuevo componente de Glosario
import { FaNewspaper } from "react-icons/fa";
import Header from "../components/Header";
import "../styles/GestionContenido.css"
import "../styles/personalizado.css"

const GestionContenido = () => {
  // Estado para determinar qué componente mostrar
  const [activeTab, setActiveTab] = useState("noticias");

  // Función para renderizar el componente adecuado
  const renderActiveComponent = () => {
    switch (activeTab) {
      case "noticias":
        return <GestionNoticias />;
      case "lecturas":
        return <GestionLecturas />;
      case "articulos":
        return <GestionArticulos />;
      case "glosario":
        return <GestionGlosario />;
      default:
        return <GestionNoticias />;
    }
  };

  return (
    <div className="admin-screen-analytics">
        <Header title="Gestion de contenido" subtitle="Modifica y agrega contenido a la app!" />
      <div className="main-content-analytics">

        {/* Contenedor de botones de navegación */}
        <div className="chart-wrapper px-3">
          <div className="chart-header-wrapper px-4">
            <span className="text-lg">Selecciona una categoría:</span>
          </div>
          <div className="first-line-analytics2">
            <button
              onClick={() => setActiveTab("noticias")}
              className={`activity-card ${
                activeTab === "noticias"
                  ? "bg-[#8b428d] text-white"
                  : "bg-[#404950] text-[#d3d3d3]"
              }`}
            >
              <FaNewspaper size={30} color="#cfcfcf" />
              Noticias
            </button>
            <button
              onClick={() => setActiveTab("lecturas")}
              className={`activity-card ${
                activeTab === "lecturas"
                  ? "bg-[#8b428d] text-white"
                  : "bg-[#404950] text-[#d3d3d3]"
              }`}
            >
              <FaNewspaper size={30} color="#cfcfcf" />
              Lecturas
            </button>
            <button
              onClick={() => setActiveTab("articulos")}
              className={`activity-card ${
                activeTab === "articulos"
                  ? "bg-[#8b428d] text-white"
                  : "bg-[#404950] text-[#d3d3d3]"
              }`}
            >
              <FaNewspaper size={30} color="#cfcfcf" />
              Artículos
            </button>
            <button
              onClick={() => setActiveTab("glosario")}
              className={`activity-card ${
                activeTab === "glosario"
                  ? "bg-[#8b428d] text-white"
                  : "bg-[#404950] text-[#d3d3d3]"
              }`}
            >
              <FaNewspaper size={30} color="#cfcfcf" />
              Glosario
            </button>
          </div>
        </div>

        {/* Renderizar el componente activo */}
        <div className="chart-wrapper mt-6">{renderActiveComponent()}</div>
      </div>
    </div>
  );
};

export default GestionContenido;