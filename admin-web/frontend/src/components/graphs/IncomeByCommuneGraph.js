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
import { collection, getDocs, query, where } from "firebase/firestore";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const IncomeByCommuneGraph = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState("Todos");
  const [selectedCommunes, setSelectedCommunes] = useState([]);

  // Lista fija de regiones de Chile
  const regions = [
    "Región de Arica y Parinacota",
    "Región de Tarapacá",
    "Región de Antofagasta",
    "Región de Atacama",
    "Región de Coquimbo",
    "Región de Valparaíso",
    "Región Metropolitana",
    "Región del Libertador General Bernardo O'Higgins",
    "Región del Maule",
    "Región de Ñuble",
    "Región del Biobío",
    "Región de La Araucanía",
    "Región de Los Ríos",
    "Región de Los Lagos",
    "Región de Aysén del General Carlos Ibáñez del Campo",
    "Región de Magallanes y de la Antártica Chilena",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersCollection = collection(db, "users");
        const transactionsCollection = collection(db, "transactions");

        // Obtener usuarios
        const usersSnapshot = await getDocs(usersCollection);
        const users = usersSnapshot.docs.map((doc) => ({
          userId: doc.id,
          region: doc.data().region,
          commune: doc.data().comuna,
        }));

        // Obtener transacciones de tipo "Ingreso"
        const transactionsQuery = query(transactionsCollection, where("type", "==", "Ingreso"));
        const transactionsSnapshot = await getDocs(transactionsQuery);
        const transactions = transactionsSnapshot.docs.map((doc) => doc.data());

        // Filtrar y calcular ingresos promedio por comuna
        const incomeByCommune = {};
        transactions.forEach((transaction) => {
          const user = users.find((u) => u.userId === transaction.userId);
          if (user && user.commune) {
            const commune = user.commune;
            if (!incomeByCommune[commune]) {
              incomeByCommune[commune] = { totalIncome: 0, count: 0 };
            }
            incomeByCommune[commune].totalIncome += transaction.amount;
            incomeByCommune[commune].count += 1;
          }
        });

        const labels = Object.keys(incomeByCommune);
        const data = Object.values(incomeByCommune).map(
          (item) => item.totalIncome / item.count
        );

        setChartData({
          labels,
          datasets: [
            {
              label: "Ingresos Promedio por Comuna (CLP)",
              data,
              backgroundColor: "rgba(75, 192, 192, 0.6)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
          ],
        });
      } catch (err) {
        console.error("Error al obtener los datos:", err);
        setError("Error al cargar los datos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRegionChange = (event) => {
    const region = event.target.value;
    setSelectedRegion(region);
  };

  const handleCommuneChange = (event) => {
    const communes = Array.from(event.target.selectedOptions, (option) => option.value);
    setSelectedCommunes(communes);
  };

  const filteredData = () => {
    if (selectedRegion === "Todos" && selectedCommunes.length === 0) {
      return chartData;
    }

    const filteredLabels = chartData.labels.filter((label) => {
      const matchesRegion = selectedRegion === "Todos" || label.includes(selectedRegion);
      const matchesCommune = selectedCommunes.length === 0 || selectedCommunes.includes(label);
      return matchesRegion && matchesCommune;
    });

    const filteredDataset = chartData.datasets[0].data.filter((_, index) =>
      filteredLabels.includes(chartData.labels[index])
    );

    return {
      labels: filteredLabels,
      datasets: [
        {
          ...chartData.datasets[0],
          data: filteredDataset,
        },
      ],
    };
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Ingresos Promedio por Comuna",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Comuna",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Ingresos Promedio (CLP)",
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
        <label htmlFor="region">Selecciona la región:</label>
        <select id="region" onChange={handleRegionChange} value={selectedRegion}>
          <option value="Todos">Todas</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>

        <label htmlFor="commune">Selecciona las comunas:</label>
        <select
          id="commune"
          multiple
          onChange={handleCommuneChange}
          disabled={selectedRegion === "Todos"}
        >
          {chartData.labels.map((commune) => (
            <option key={commune} value={commune}>
              {commune}
            </option>
          ))}
        </select>
      </div>

      <Bar data={filteredData()} options={options} />
    </div>
  );
};

export default IncomeByCommuneGraph;
