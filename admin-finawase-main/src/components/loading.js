import React, { useEffect, useState } from "react";
import "../index.css";
import Logo from "../img/Logo_finawise_blanco_shadowpurple.png"; // Ruta del logo

const LoadingScreen = ({ isLoading }) => {
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => setShowLoading(false), 300); // Agrega un retraso para la animación de salida
    }
  }, [isLoading]);

  return (
    <>
      {showLoading && (
        <div className="loading-screen">
          <div className="loading-logo-container">
            <img src={Logo} alt="Finawise Logo" className="loading-logo" />
          </div>
        </div>
      )}
    </>
  );
};

export default LoadingScreen;
