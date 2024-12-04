import React from "react";
import Header from "../components/Header"; // Header con título y subtítulo
import { Link } from "react-router-dom"; // Importamos Link para el enrutamiento
import "../styles/HomeScreen.css";

const HomeScreen = () => {
  return (
    <div className="home-screen-container">
      <div className="main-content-wrapper">
        {/* Header */}
        <Header
          title="Hola, Admin!"
          subtitle="Listo para los nuevos cambios?"
        />

        {/* Primera línea: 55% gráficos, 45% card vacía */}
        <div className="first-section-home">
          <div className="contenido-home1">
            <h2>Contenido de mantendor</h2>
            <h5>
              ¿Deseas entrar al contenido de mantendor?<br></br>
              haz click aqui!
            </h5>
            {/* Cambié <a> por <Link> para usar react-router-dom */}
            <Link to="/admin" className="myButton-home1">
              Entrar a mantendor
            </Link>
          </div>
          <div className="contenido-first-line2"></div>
        </div>

        {/* Card Vacía */}
        <div className="second-section-home">
          <div className="contenido-home2">
            <h2>Contenido de gerencia</h2>
            <h5>
              ¿Deseas entrar al contenido de gerencia?<br></br>
              haz click aqui!
            </h5>
            {/* Cambié <a> por <Link> para usar react-router-dom */}
            <Link to="/analytics" className="myButton-home1">
              Entrar a gerencia
            </Link>
          </div>
          <div className="contenido-second-line2"></div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
