import React, { useState } from "react";
import { FaNewspaper, FaRegClipboard, FaUserAlt, FaUsers } from "react-icons/fa"; // Importamos los iconos
import { MdOutlineQueryStats, MdAutoGraph, MdOutlineEnergySavingsLeaf } from "react-icons/md";
import { BiCategory } from "react-icons/bi";
import { TbHealthRecognition } from "react-icons/tb";
import { HiOutlineUsers } from "react-icons/hi2";
import { FaAnglesUp } from "react-icons/fa6";
import Header from "../components/Header"; // Componente Header
import "../styles/Analytics.css"; // Estilos específicos para Analytics

const Analytics = () => {
  // Estado para saber cuál card ha sido seleccionada
  const [selectedCard, setSelectedCard] = useState(null);

  // Función para cambiar la card seleccionada
  const handleCardClick = (cardName) => {
    setSelectedCard(cardName); // Establece la card seleccionada
  };

  // Función para verificar si una card está seleccionada
  const getCardClass = (cardName) => {
    return selectedCard === cardName ? "activity-card-analytics selected-analytics" : "activity-card-analytics";
  };

  return (
    <div className="admin-screen-analytics">
      <Header title="Analytics" subtitle="Visualiza las métricas y datos" />
      <div className="main-content-analytics">
        {/* Primera sección - Recuadros de actividad */}
        <div className="first-line-analytics">
          <div
            className={getCardClass("comparacion")}
            onClick={() => handleCardClick("comparacion")}
          >
            <MdOutlineQueryStats size={30} color="#cfcfcf"/>
            <h3>Comparacion Ingresos vs Gastos</h3>
          </div>
          <div
            className={getCardClass("salud")}
            onClick={() => handleCardClick("salud")}
          >
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
            <h3>Indicador de Salud Financiera GeneraL</h3>
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
          {/* Nuevas cards con descripción de gráficos */}
          <div
            className={getCardClass("ahorro")}
            onClick={() => handleCardClick("ahorro")}
          >
            <MdOutlineEnergySavingsLeaf size={30} color="#cfcfcf" />
            <h3>Tasa de Ahorro Promedio Mensual</h3>
          </div>
          {/* <div
            className={getCardClass("visitas")}
            onClick={() => handleCardClick("visitas")}
          >
            <FaRegClipboard size={30} color="#cfcfcf" />
            <h3>Visitas Mensuales</h3>
            <h2>2,000</h2>
          </div>
          <div
            className={getCardClass("ventas")}
            onClick={() => handleCardClick("ventas")}
          >
            <FaUsers size={30} color="#cfcfcf" />
            <h3>Ventas del Mes</h3>
            <h2>350</h2>
          </div>
          <div
            className={getCardClass("facturacion")}
            onClick={() => handleCardClick("facturacion")}
          >
            <FaUserAlt size={30} color="#cfcfcf" />
            <h3>Facturación Total</h3>
            <h2>$10,000</h2>
          </div> */}
        </div>

        {/* Sección de gráfico dinámico */}
        {selectedCard && (
          <div className="graph-section-analytics">
            <div className="graph-card-analytics">
              <h3>{`Gráfico de ${selectedCard}`}</h3>
              <div className="graph-container-analytics">
                {/* Aquí puedes poner el componente gráfico que desees */}
                <p>Gráfico relacionado con {selectedCard}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
