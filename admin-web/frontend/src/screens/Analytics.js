// src/pages/Analytics.js
import React, { useState } from "react";
import { FaNewspaper, FaRegClipboard, FaUserAlt, FaUsers } from "react-icons/fa";
import { MdOutlineQueryStats, MdAutoGraph, MdOutlineEnergySavingsLeaf } from "react-icons/md";
import { BiCategory } from "react-icons/bi";
import { TbHealthRecognition } from "react-icons/tb";
import { HiOutlineUsers } from "react-icons/hi2";
import { FaAnglesUp } from "react-icons/fa6"; // Ícono para Evolución del Balance Promedio
import Header from "../components/Header";
import "../styles/Analytics.css"; // Estilos específicos para Analytics
import MonthlyBalanceGraph from "../components/graphs/MonthlyBalanceGraph"; // Importamos el gráfico de Comparación Ingresos vs Gastos
import AverageBalanceEvolutionGraph from "../components/graphs/AverageBalanceEvolutionGraph"; // Importamos el gráfico de Evolución del Balance Promedio
import SavingsRateGraph from "../components/graphs/SavingsRateGraph"; // Importamos el gráfico de Tasa de Ahorro Promedio

const Analytics = () => {
  const [selectedCard, setSelectedCard] = useState(null);

  // Función para manejar el click en las cards
  const handleCardClick = (cardName) => {
    console.log("Cambiando selectedCard a:", cardName);
    setSelectedCard(cardName);
  };

  // Función para asignar clases a las cards según si están seleccionadas
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
          <div className={getCardClass("ahorros")} onClick={() => handleCardClick("ahorros")}>
            <BiCategory size={30} color="#cfcfcf" />
            <h3>Categorías de Metas de Ahorro</h3>
          </div>
          <div className={getCardClass("tareas")} onClick={() => handleCardClick("tareas")}>
            <TbHealthRecognition size={30} color="#cfcfcf" />
            <h3>Indicador de Salud Financiera General</h3>
          </div>
          <div className={getCardClass("usuarios")} onClick={() => handleCardClick("usuarios")}>
            <HiOutlineUsers size={30} color="#cfcfcf" />
            <h3>Usuarios Registrados</h3>
          </div>
          <div className={getCardClass("activos")} onClick={() => handleCardClick("activos")}>
            <FaAnglesUp size={30} color="#cfcfcf" />
            <h3>Evolución del Balance Promedio</h3>
          </div>
          <div className={getCardClass("ahorro")} onClick={() => handleCardClick("ahorro")}>
            <MdOutlineEnergySavingsLeaf size={30} color="#cfcfcf" />
            <h3>Tasa de ahorro promedio</h3>
          </div>
        </div>

        {/* Sección de gráfico dinámico */}
        {selectedCard && (
          <div className="graph-section-analytics">
            <div className="graph-card-analytics">
              <div className="graph-container-analytics">
                {/* Condición para mostrar el gráfico correcto */}
                {selectedCard === "comparacion" && <MonthlyBalanceGraph />} {/* Gráfico de Comparación Ingresos vs Gastos */}
                {selectedCard === "salud" && <div>Gráfico Variación de las Categorías de Gastos</div>}
                {selectedCard === "ahorros" && <div>Gráfico Categorías de Metas de Ahorro</div>}
                {selectedCard === "tareas" && <div>Gráfico Indicador de Salud Financiera General</div>}
                {selectedCard === "usuarios" && <div>Gráfico Usuarios Registrados</div>}
                {selectedCard === "activos" && <AverageBalanceEvolutionGraph />} {/* Gráfico de Evolución del Balance Promedio */}
                {selectedCard === "ahorro" && <SavingsRateGraph />} {/* Gráfico Tasa de Ahorro Promedio */}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
