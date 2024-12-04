import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import { parseISO, differenceInYears } from "date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MonthlyUsersGraph = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("2024"); // Periodo inicial
  const [selectedRegion, setSelectedRegion] = useState("Todos"); // Filtro de región
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("todos"); // Filtro de grupo etáreo

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersCollection = collection(db, "users");
        const snapshot = await getDocs(usersCollection);
        const users = snapshot.docs.map((doc) => doc.data());

        // Filtra los usuarios por el periodo seleccionado
        const filteredUsers = users.filter((user) => {
          const registrationDate = parseISO(user.registrationDate);
          const userAge = differenceInYears(new Date(), registrationDate);

          // Filtro por periodo
          const isInPeriod = registrationDate.getFullYear() === parseInt(selectedPeriod);

          // Filtro por región
          const matchesRegion = selectedRegion === "Todos" || user.region === selectedRegion;

          // Filtro por grupo etáreo
          const matchesAgeGroup =
            selectedAgeGroup === "todos" ||
            (selectedAgeGroup === "menor18" && userAge < 18) ||
            (selectedAgeGroup === "adultoJoven" && userAge >= 18 && userAge <= 29) ||
            (selectedAgeGroup === "adulto" && userAge >= 30 && userAge <= 64) ||
            (selectedAgeGroup === "adultoMayor" && userAge >= 65);

          return isInPeriod && matchesRegion && matchesAgeGroup;
        });

        const monthlyData = groupUsersByMonth(filteredUsers);
        setUserData(monthlyData);
      } catch (err) {
        console.error("Error al obtener los datos:", err);
        setError("Error al cargar los datos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPeriod, selectedRegion, selectedAgeGroup]);

  const groupUsersByMonth = (users) => {
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const userCounts = Array(12).fill(0);

    users.forEach((user) => {
      const registrationDate = parseISO(user.registrationDate);
      const monthIndex = registrationDate.getMonth();
      userCounts[monthIndex]++;
    });

    const totalUsers = userCounts.reduce((acc, val) => acc + val, 0);
    const maxUsers = Math.max(...userCounts);
    const bestMonth = months[userCounts.indexOf(maxUsers)];

    return {
      labels: months,
      datasets: [
        {
          label: "Usuarios Registrados",
          data: userCounts,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
      stats: {
        totalUsers,
        maxUsers,
        bestMonth,
      },
    };
  };

  const handlePeriodChange = (event) => {
    setSelectedPeriod(event.target.value);
  };

  const handleRegionChange = (event) => {
    setSelectedRegion(event.target.value);
  };

  const handleAgeGroupChange = (event) => {
    setSelectedAgeGroup(event.target.value);
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: `Usuarios Registrados por Mes (${selectedPeriod})`,
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => `Usuarios: ${tooltipItem.raw}`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Mes",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Número de Usuarios",
        },
      },
    },
  };

  if (loading) {
    return <div>Cargando datos...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="graph-container-analytics">
      <div className="filter-container">
        <label htmlFor="period">Selecciona el periodo:</label>
        <select id="period" onChange={handlePeriodChange} value={selectedPeriod}>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
          {/* Añade más años según tu base de datos */}
        </select>

        <label htmlFor="region">Selecciona la región:</label>
        <select id="region" onChange={handleRegionChange} value={selectedRegion}>
        <option value="Todos">Todos</option>
            <option value="Región de Arica y Parinacota">Región de Arica y Parinacota</option>
            <option value="Región de Tarapacá">Región de Tarapacá</option>
            <option value="Región de Antofagasta">Región de Antofagasta</option>
            <option value="Región de Atacama">Región de Atacama</option>
            <option value="Región de Coquimbo">Región de Coquimbo</option>
            <option value="Región de Valparaíso">Región de Valparaíso</option>
            <option value="Región Metropolitana">Región Metropolitana</option>
            <option value="Región del Libertador General Bernardo O'Higgins">
              Región del Libertador General Bernardo O'Higgins
            </option>
            <option value="Región del Maule">Región del Maule</option>
            <option value="Región de Ñuble">Región de Ñuble</option>
            <option value="Región del Biobío">Región del Biobío</option>
            <option value="Región de La Araucanía">Región de La Araucanía</option>
            <option value="Región de Los Ríos">Región de Los Ríos</option>
            <option value="Región de Los Lagos">Región de Los Lagos</option>
            <option value="Región de Aysén del General Carlos Ibáñez del Campo">
              Región de Aysén del General Carlos Ibáñez del Campo
            </option>
            <option value="Región de Magallanes y de la Antártica Chilena">
              Región de Magallanes y de la Antártica Chilena
            </option>
        </select>

        <label htmlFor="ageGroup">Selecciona el grupo etáreo:</label>
        <select id="ageGroup" onChange={handleAgeGroupChange} value={selectedAgeGroup}>
          <option value="todos">Todos</option>
          <option value="menor18">Menores de 18 años</option>
          <option value="adultoJoven">Adulto Joven (18-29)</option>
          <option value="adulto">Adulto (30-64)</option>
          <option value="adultoMayor">Adulto Mayor (65+)</option>
        </select>
      </div>

      <Bar data={userData} options={options} />

      <div className="statistics">
        <h3>Estadísticas del Periodo</h3>
        <p>Total de usuarios registrados: <strong>{userData.stats.totalUsers}</strong></p>
        <p>Mes con más usuarios: <strong>{userData.stats.bestMonth}</strong> con <strong>{userData.stats.maxUsers}</strong> usuarios</p>
      </div>
    </div>
  );
};

export default MonthlyUsersGraph;
