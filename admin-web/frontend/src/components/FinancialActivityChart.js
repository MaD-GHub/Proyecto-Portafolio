import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const FinancialActivityChart = ({ title, color, total, transactions }) => {
  const data = {
    labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo"],
    datasets: [
      {
        label: title,
        data: [500, 700, 800, 600, 1750],
        borderColor: color,
        backgroundColor: `${color}55`, // Fondo semitransparente
        fill: false, // Desactivar relleno
        tension: 0.4, // Líneas curvas
        pointRadius: 0, // Eliminar puntos en la línea
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Permitir mayor control del alto
    plugins: {
      legend: { display: false }, // Ocultar leyenda
      tooltip: {
        enabled: true,
        backgroundColor: "#293238",
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      x: {
        grid: { display: false }, // Ocultar líneas de la cuadrícula en el eje X
        ticks: {
          color: "#d3d3d3", // Color visible para los ticks del eje X
          font: { size: 12 }, // Tamaño de fuente de los ticks
          padding: 10, // Espaciado adicional
        },
      },
      y: {
        grid: { display: false }, // Ocultar líneas horizontales
        ticks: {
          color: "#d3d3d3", // Color visible para los ticks del eje Y
          font: { size: 12 }, // Tamaño de fuente de los ticks
          stepSize: 500, // Intervalos entre los ticks
          suggestedMax: 2000, // Rango máximo
          padding: 10, // Espaciado adicional
        },
      },
    },
  };
  

  return (
    <div className="chart" style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 3 }}>
        <Line data={data} options={options} />
      </div>
      <div className="chart-info" style={{ flex: 1, paddingTop: "15px" }}>
        <h4 style={{ fontSize: "16px", fontWeight: 400, margin: "0 0 8px 0" }}>{title}</h4>
        <h2
          style={{
            fontSize: "34px",
            fontWeight: "bold",
            margin: "0 0 12px 0",
            color: "white",
          }}
        >
          {total}
        </h2>
        <p
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "14px",
            color: "#d3d3d3",
            margin: 0,
          }}
        >
          <span>Transacciones totales</span>
          <span>{transactions}</span>
        </p>
      </div>
    </div>
  );
};

export default FinancialActivityChart;
