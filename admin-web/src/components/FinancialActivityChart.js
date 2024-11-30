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
import { db } from "../firebase"; // Asegúrate de tener la configuración de Firebase correcta
import { collection, getDocs } from "firebase/firestore";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const FinancialActivityChart = ({ title, color }) => {
  const [userRegistrationsData, setUserRegistrationsData] = useState([0, 0, 0, 0, 0]); // Datos mensuales de registros
  const [totalUsers, setTotalUsers] = useState(0); // Total de usuarios registrados

  useEffect(() => {
    const fetchUserRegistrations = async () => {
      const usersSnapshot = await getDocs(collection(db, "users"));
      let registrationsData = [0, 0, 0, 0, 0]; // Datos mensuales predeterminados para el registro de usuarios

      // Contamos el total de usuarios
      let total = 0;
    
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        const registrationDate = data.registrationDate; // Obtener la fecha de registro
    
        // Verifica que registrationDate sea un Timestamp válido
        if (registrationDate && registrationDate.seconds) {
          const registrationMonth = new Date(registrationDate.seconds * 1000).getMonth(); // Mes (0-11)
          registrationsData[registrationMonth] += 1; // Incrementamos el contador de usuarios registrados en ese mes
          total += 1; // Contamos todos los usuarios
        }
      });
    
      setUserRegistrationsData(registrationsData);
      setTotalUsers(total); // Guardamos el total de usuarios
    };

    fetchUserRegistrations();
  }, []);


  const data = {
    labels: ["Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    datasets: [
      {
        label: title,
        data: userRegistrationsData, // Usamos los datos de registros de usuarios por mes
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
          stepSize: 5, // Intervalos entre los ticks
          suggestedMax: Math.max(...userRegistrationsData) + 5, // Ajustar el rango máximo
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
          {totalUsers} usuarios
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
          <span>Usuarios totales</span>
          <span>{totalUsers}</span>
        </p>
      </div>
    </div>
  );
};

export default FinancialActivityChart;
