import React, { useEffect, useState } from "react";
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
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import zoomPlugin from 'chartjs-plugin-zoom';
import "../styles/RegistrationUsersActivity.css";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, zoomPlugin);

const RegistrationUsersActivity = () => {
  const [userRegistrationsData, setUserRegistrationsData] = useState(new Array(12).fill(0)); // Datos mensuales de registros, 12 meses por defecto
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Año seleccionado, por defecto el actual

  useEffect(() => {
    const fetchUserRegistrations = async () => {
      const usersSnapshot = await getDocs(collection(db, "users"));
      let registrationsData = new Array(12).fill(0); // 12 meses, inicializados en 0

      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        const registrationDate = data.registrationDate;

        if (registrationDate) {
          const registrationDateObject = new Date(registrationDate); // Parseamos la fecha correctamente
          const registrationYear = registrationDateObject.getFullYear();
          const registrationMonth = registrationDateObject.getMonth(); // 0 = Enero, 11 = Diciembre

          // Solo consideramos los usuarios registrados en el año seleccionado
          if (registrationYear === selectedYear) {
            registrationsData[registrationMonth] += 1; // Incrementar el contador para ese mes
          }
        }
      });

      setUserRegistrationsData(registrationsData);
      setTotalUsers(usersSnapshot.size); // Total de usuarios registrados
    };

    fetchUserRegistrations();
  }, [selectedYear]); // Ejecutar cada vez que el año seleccionado cambie

  const handleYearChange = (e) => {
    setSelectedYear(Number(e.target.value)); // Cambiar el año seleccionado
  };

  const data = {
    labels: [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ],
    datasets: [
      {
        label: `Usuarios Registrados en ${selectedYear}`,
        data: userRegistrationsData,
        borderColor: "#4caf50",
        backgroundColor: "rgba(76, 175, 80, 0.2)", // Fondo semitransparente verde
        fill: true, // Activar relleno
        tension: 0.4, // Líneas curvas
        pointRadius: 6, // Tamaño de los puntos, más grande para hacerlo más visible
        pointHoverRadius: 8, // Aumentar el tamaño del punto cuando se pasa el cursor
        pointHoverBackgroundColor: "#ffffff", // Color del punto cuando pasa el cursor
        borderWidth: 2, // Ancho de la línea
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // Ocultar leyenda
      tooltip: {
        enabled: true,
        backgroundColor: "#293238",
        titleFont: { size: 14 },
        bodyFont: { size: 12 },
        callbacks: {
          label: function (context) {
            const month = context.label;
            const value = context.raw;
            return `${month}: ${value} Usuarios`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: "#d3d3d3",
          font: { size: 12 },
          padding: 10,
        },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: "#d3d3d3",
          font: { size: 12 },
          stepSize: 1,
          suggestedMax: 10,
          padding: 10,
        },
      },
    },
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: 'xy',
          speed: 10,
        },
        zoom: {
          enabled: true,
          mode: 'xy',
          speed: 0.1,
          sensitivity: 3,
        },
      },
    },
  };

  return (
    <div className="chart-container" style={{ padding: "20px" }}>
      {/* Sección del selector de año y contador de usuarios en la parte superior */}
      <div className="chart-info" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        {/* Selector de Año */}
        <div className="year-selector" style={{ display: "flex", alignItems: "center" }}>
          <label htmlFor="year-selector" style={{ fontWeight: "bold", marginRight: "10px" }}>Seleccionar Año: </label>
          <select
            id="year-selector"
            value={selectedYear}
            onChange={handleYearChange}
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", fontSize: "14px" }}
          >
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
          </select>
        </div>
  
        {/* Total de usuarios registrados */}
        <div style={{ textAlign: "center", maxWidth: "200px" }}>
          <h4>Total de Usuarios Registrados</h4>
          <h2>{totalUsers}</h2>
        </div>
      </div>
  
      {/* Sección del gráfico */}
      <div className="chart" style={{ width: "100%", height: "400px" }}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
  
  
};

export default RegistrationUsersActivity;
