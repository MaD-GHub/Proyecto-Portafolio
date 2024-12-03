
// Analytics.js
import React, { useState } from "react";
import { FaNewspaper, FaRegClipboard, FaUserAlt, FaUsers } from "react-icons/fa"; // Importamos los iconos
import { MdOutlineQueryStats, MdAutoGraph, MdOutlineEnergySavingsLeaf } from "react-icons/md";
import { BiCategory } from "react-icons/bi";
import { TbHealthRecognition } from "react-icons/tb";
import { HiOutlineUsers } from "react-icons/hi2";
import { FaAnglesUp } from "react-icons/fa6";
import Header from "../components/Header";
import "../styles/Analytics.css"; // Estilos específicos para Analytics
import MonthlyBalanceGraph from "../components/graphs/MonthlyBalanceGraph"; // Importamos el gráfico
import VariationCategoriesbyRegionCommuneGraph from "../components/graphs/VariationCategoriesbyRegionCommuneGraph";
import VariationCategorySavingsbyRegionGraph from "../components/graphs/VariationCategorySavingsbyRegionGraph";


const Analytics = () => {
  const [selectedCard, setSelectedCard] = useState(null);

  const handleCardClick = (cardName) => {
    setSelectedCard(cardName);
  };

  const getCardClass = (cardName) => {
    return selectedCard === cardName ? "activity-card-analytics selected-analytics" : "activity-card-analytics";
  };

  return (
    <div className="admin-screen-analytics">
      <Header title="Analytics" subtitle="Visualiza las métricas y datos" />
      <div className="main-content-analytics">
        {/* Primera sección - Recuadros de actividad */}
        <div className="first-line-analytics">
          <div className={getCardClass("comparacion")} onClick={() => handleCardClick("comparacion")}>
            <MdOutlineQueryStats size={30} color="#cfcfcf" />
            <h3>Comparación Ingresos vs Gastos</h3>
          </div>
          <div className={getCardClass("salud")} onClick={() => handleCardClick("salud")}>
            <MdAutoGraph size={30} color="#cfcfcf" />
            <h3>Variación de las Categorías de Gastos</h3>
          </div>
          <div
            className={getCardClass("ahorros")}
            onClick={() => handleCardClick("ahorros")}
          >
            <BiCategory  size={30} color="#cfcfcf" />
            <h3>Categorías de Metas de Ahorro</h3>
          </div>
          <div
            className={getCardClass("tareas")}
            onClick={() => handleCardClick("tareas")}
          >
            <TbHealthRecognition size={30} color="#cfcfcf" />
            <h3>Indicador de Salud Financiera General</h3>
          </div>
          <div
            className={getCardClass("usuarios")}
            onClick={() => handleCardClick("usuarios")}
          >
            <HiOutlineUsers  size={30} color="#cfcfcf" />
            <h3>Usuarios Registrados</h3>
          </div>
          <div
            className={getCardClass("activos")}
            onClick={() => handleCardClick("activos")}
          >
            <FaAnglesUp size={30} color="#cfcfcf" />
            <h3>Evolución del Balance Promedio</h3>
          </div>
        </div>

        {/* Sección de gráfico dinámico */}
        {selectedCard && (
          <div className="graph-section-analytics">
            <div className="graph-card-analytics">
              <h3>{`Gráfico de ${selectedCard}`}</h3>
              <div className="graph-container-analytics">
                {/* Aquí se renderiza el gráfico correspondiente */}
                {selectedCard === "comparacion" && <MonthlyBalanceGraph />}
                {selectedCard === "salud" && <VariationCategoriesbyRegionCommuneGraph />}
                {selectedCard === "ahorros" && <VariationCategorySavingsbyRegionGraph />}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
