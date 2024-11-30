import React from "react";
import Header from "../components/Header"; // Header con título y subtítulo
import "../styles/HomeScreen.css";
import FinancialActivityChart from "../components/FinancialActivityChart"; // Componente de gráficos

const HomeScreen = () => {
  return (
    <div className="home-screen-container">
      <div className="main-content-wrapper">
        {/* Header */}
        <Header title="Hola, Admin!" subtitle="Listo para los nuevos cambios?" />

        {/* Primera línea: 55% gráficos, 45% card vacía */}
        <div className="first-section">
          <div className="chart-wrapper">
            {/* Barra superior */}
            <div className="chart-header-wrapper">
              <span>Resumen Financiero</span>
              <span>s</span>
            </div>

            {/* Gráficos */}
            <div className="chart-group-wrapper">
              <div className="chart-item">
                <FinancialActivityChart
                  title="Ingresos"
                  color="green"
                  total="$3,343,304"
                  transactions="32,900"
                />
              </div>
              <div className="chart-divider"></div>
              <div className="chart-item">
                <FinancialActivityChart
                  title="Gastos"
                  color="red"
                  total="$2,214,540"
                  transactions="21,300"
                />
              </div>
              <div className="chart-divider"></div>
              <div className="chart-item">
                <FinancialActivityChart
                  title="Ahorros"
                  color="orange"
                  total="$1,120,780"
                  transactions="15,000"
                />
              </div>
            </div>
          </div>

          {/* Card Vacía */}
          <div className="large-card-item">
            <h3>Card Vacía</h3>
            <p>Contenido por definir.</p>
          </div>
        </div>

        {/* Segunda línea: 50% progreso (2 cards), 50% tabla de categorías */}
        <div className="second-section">
          <div className="progress-section-wrapper">
            <div className="progress-card-item">
              <h3>Progreso de Tareas 1</h3>
              <div className="progress-bar-wrapper">
                <div className="progress-bar" style={{ width: "40%" }}></div>
              </div>
              <p>2/5 completado</p>
            </div>
            <div className="progress-card-item">
              <h3>Progreso de Tareas 2</h3>
              <div className="progress-bar-wrapper">
                <div className="progress-bar" style={{ width: "70%" }}></div>
              </div>
              <p>7/10 completado</p>
            </div>
          </div>
          <div className="table-card-item">
            <h3>Categorías Principales</h3>
            <table>
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Tipo</th>
                  <th>Monto Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Comida</td>
                  <td>Gasto</td>
                  <td>$5,000</td>
                </tr>
                <tr>
                  <td>Salario</td>
                  <td>Ingreso</td>
                  <td>$12,000</td>
                </tr>
                <tr>
                  <td>Educación</td>
                  <td>Ahorro</td>
                  <td>$3,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
