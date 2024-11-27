import React from "react";
import Card from "./Card";
import "../styles/Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard">
      {/* Fila 1: Métricas principales */}
      <div className="dashboard-row">
        <Card title="Physical Activity" type="card-graph">
          {/* Aquí irá un gráfico */}
        </Card>
        <Card title="Calories Burned" type="card-graph">
          {/* Aquí irá un gráfico */}
        </Card>
        <Card title="Activity Time" type="card-graph">
          {/* Aquí irá un gráfico */}
        </Card>
      </div>

      {/* Fila 2: Información adicional */}
      <div className="dashboard-row">
        <Card title="Sleep Time" type="card-small">
          {/* Información adicional */}
        </Card>
        <Card title="Weight Loss Plan" type="card-small">
          {/* Información adicional */}
        </Card>
        <Card title="My Activities" type="card-small">
          {/* Información adicional */}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
