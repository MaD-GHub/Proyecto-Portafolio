import React from "react";
import PropTypes from "prop-types";

const DashboardCard = ({ title, content, icon }) => {
  return (
    <div className="card">
      {icon && <div className="card-icon">{icon}</div>}
      <h3 className="card-title">{title}</h3>
      <p className="card-content">{content}</p>
    </div>
  );
};

DashboardCard.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string,
  icon: PropTypes.element, // Permite pasar un icono como prop opcional
};

export default DashboardCard;
