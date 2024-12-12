import React from "react";
import "../styles/Header.css";

const Header = ({ title, subtitle }) => {
  return (
    <header className="header">
      {/* Contenedor del título y subtítulo */}
      <div className="header-title">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      {/* Elementos del lado derecho 
      <div className="right-section">
        <input type="text" placeholder="Buscar algo..." className="search-bar" />
        <button className="premium-button">Premium</button>
      </div>*/}
    </header>
  );
};

export default Header;
