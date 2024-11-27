import React from "react";
import "../styles/Card.css";

const Card = ({ title, children, type }) => {
  return (
    <div className={`card ${type}`}>
      <h3>{title}</h3>
      {children}
    </div>
  );
};

export default Card;
