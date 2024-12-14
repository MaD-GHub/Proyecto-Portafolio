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

const FinancialHealthGraph = () => {
  const [users, setUsers] = useState([]);
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [ageRange, setAgeRange] = useState("Todos");
  const [region, setRegion] = useState("Todos");
  const [gender, setGender] = useState("Todos");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersCollection = collection(db, "users");
        const snapshot = await getDocs(usersCollection);
        const usersData = snapshot.docs.map((doc) => doc.data());
        setUsers(usersData);

        const financialHealthData = groupByFinancialHealth(usersData);
        setGraphData(financialHealthData);
      } catch (err) {
        console.error("Error al obtener los datos:", err);
        setError("Error al cargar los datos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const groupByFinancialHealth = (users) => {
    const categories = ["muy_mal", "mal", "media", "semimaxima", "maxima"];
    const categoryCounts = categories.reduce((acc, category) => {
      acc[category] = 0;
      return acc;
    }, {});

    const filteredUsers = users.filter((user) => {
      let userAge = null;
      if (user.birthDate && typeof user.birthDate === "string") {
        try {
          userAge = differenceInYears(new Date(), parseISO(user.birthDate));
        } catch (error) {
          console.warn("Error al parsear birthDate:", user.birthDate, error);
        }
      }

      let matchesAge = false;
      switch (ageRange) {
        case "Menores de 18 años":
          matchesAge = userAge < 18;
          break;
        case "Adulto Joven (18-35 años)":
          matchesAge = userAge >= 18 && userAge <= 35;
          break;
        case "Adulto (36-65 años)":
          matchesAge = userAge >= 36 && userAge <= 65;
          break;
        case "Adulto Mayor (66+ años)":
          matchesAge = userAge >= 66;
          break;
        case "Todos":
        default:
          matchesAge = true;
          break;
      }

      const matchesRegion = region === "Todos" || user.region === region;
      const matchesGender = gender === "Todos" || user.gender === gender;

      return matchesAge && matchesRegion && matchesGender;
    });

    filteredUsers.forEach((user) => {
      const healthCategory = user.financialHealth || "Desconocido";
      if (categories.includes(healthCategory)) {
        categoryCounts[healthCategory]++;
      } else {
        categoryCounts["Desconocido"] = (categoryCounts["Desconocido"] || 0) + 1;
      }
    });

    return {
      labels: [...categories, "Desconocido"],
      datasets: [
        {
          label: "Usuarios por Estado Financiero",
          data: [...Object.values(categoryCounts)],
          backgroundColor: [
            "rgba(255, 99, 132, 0.6)", 
            "rgba(255, 159, 64, 0.6)", 
            "rgba(255, 205, 86, 0.6)", 
            "rgba(75, 192, 192, 0.6)", 
            "rgba(54, 162, 235, 0.6)", 
            "rgba(201, 203, 207, 0.6)", 
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(255, 159, 64, 1)",
            "rgba(255, 205, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(201, 203, 207, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const handleFilterChange = () => {
    const updatedData = groupByFinancialHealth(users);
    setGraphData(updatedData);
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Distribución de Calidad Financiera de los Usuarios",
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
          text: "Estado Financiero",
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
      <div className="filters">
        <label>
          Rango de Edad:
          <select value={ageRange} onChange={(e) => setAgeRange(e.target.value)}>
            <option value="Todos">Todos</option>
            <option value="Menores de 18 años">Menores de 18 años</option>
            <option value="Adulto Joven (18-35 años)">Adulto Joven (18-35 años)</option>
            <option value="Adulto (36-65 años)">Adulto (36-65 años)</option>
            <option value="Adulto Mayor (66+ años)">Adulto Mayor (66+ años)</option>
          </select>
        </label>
        
        <label>
          Región:
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
          <option value="Todos">Todos</option>
          <option value="Región de Arica y Parinacota">Región de Arica y Parinacota</option>
          <option value="Región de Tarapacá">Región de Tarapacá</option>
          <option value="Región de Antofagasta">Región de Antofagasta</option>
          <option value="Región de Atacama">Región de Atacama</option>
          <option value="Región de Coquimbo">Región de Coquimbo</option>
          <option value="Región de Valparaíso">Región de Valparaíso</option>
          <option value="Región Metropolitana de Santiago">Región Metropolitana</option>
          <option value="Región del Libertador General Bernardo O'Higgins">Región del Libertador General Bernardo O'Higgins</option>
          <option value="Región del Maule">Región del Maule</option>
          <option value="Región de Ñuble">Región de Ñuble</option>
          <option value="Región del Biobío">Región del Biobío</option>
          <option value="Región de La Araucanía">Región de La Araucanía</option>
          <option value="Región de Los Ríos">Región de Los Ríos</option>
          <option value="Región de Los Lagos">Región de Los Lagos</option>
          <option value="Región de Aysén del General Carlos Ibáñez del Campo">Región de Aysén del General Carlos Ibáñez del Campo</option>
          <option value="Región de Magallanes y de la Antártica Chilena">Región de Magallanes y de la Antártica Chilena</option>
          </select>
        </label>

        <label>
          Género:
          <select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="Todos">Todos</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
          </select>
        </label>

        <button onClick={handleFilterChange}>Aplicar Filtros</button>
      </div>

      <Bar data={graphData} options={options} />
    </div>
  );
};

export default FinancialHealthGraph;
