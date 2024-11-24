import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import withAdminAuth from "../components/withAdminAuth";
import GestionNoticias from "../components/gestionNoticias";
import GestionLecturas from "../components/gestionLecturas"; // Nuevo componente de Lecturas
import GestionArticulos from "../components/gestionArticulos"; // Nuevo componente de Artículos
import GestionPreguntas from "../components/gestionPreguntas"; // Nuevo componente de Preguntas
import GestionGlosario from "../components/gestionGlosario"; // Nuevo componente de Glosario



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
      case "preguntas":
        return <GestionPreguntas />;
        case "glosario":
        return <GestionGlosario />;
      default:
        return <GestionNoticias />;
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Gestión de Contenido</h1>

        {/* Contenedor fijo para los botones de navegación */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <button
            onClick={() => setActiveTab("noticias")}
            className={`btn ${activeTab === "noticias" ? "btn-primary" : "btn-outline"} w-40`}
          >
            Noticias
          </button>
          <button
            onClick={() => setActiveTab("lecturas")}
            className={`btn ${activeTab === "lecturas" ? "btn-primary" : "btn-outline"} w-40`}
          >
            Lecturas Recomendadas
          </button>
          <button
            onClick={() => setActiveTab("articulos")}
            className={`btn ${activeTab === "articulos" ? "btn-primary" : "btn-outline"} w-40`}
          >
            Artículos
          </button>
          <button
            onClick={() => setActiveTab("preguntas")}
            className={`btn ${activeTab === "preguntas" ? "btn-primary" : "btn-outline"} w-40`}
          >
            Preguntas
          </button>
          <button
            onClick={() => setActiveTab("glosario")}
            className={`btn ${activeTab === "glosario" ? "btn-primary" : "btn-outline"} w-40`}
          >
            Glosario
          </button>
        </div>

        {/* Renderizar el componente activo */}
        <div className="mt-4">
          {renderActiveComponent()}
        </div>
      </div>
    </div>
  );
};

export default withAdminAuth(GestionContenido);
