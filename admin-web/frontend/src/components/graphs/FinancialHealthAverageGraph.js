import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import fetchFinancialHealthData from "./fetchFinancialHealth";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const FinancialHealthGraph = () => {
  const [financialData, setFinancialData] = useState({});
  const [selectedYear, setSelectedYear] = useState(""); 
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchFinancialHealthData(); // Llama a la función de obtención
        setFinancialData(data);
        setSelectedYear(Object.keys(data)[0]); // Seleccionar el primer año disponible
      } catch (err) {
        setError("Error al cargar los datos.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (selectedYear && financialData[selectedYear]) {
      const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
      const yearData = financialData[selectedYear];

      const labels = months.filter((month) => yearData[month] !== undefined);
      const values = labels.map((month) => yearData[month]);

      setChartData({
        labels: labels.map((month) => `${month.toUpperCase()} ${selectedYear}`),
        datasets: [
          {
            label: "Índice de Salud Financiera Mensual Promedio",
            data: values,
            borderColor: "rgba(75, 192, 192, 1)",
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            tension: 0.4,
            borderWidth: 2,
          },
        ],
      });
    }
  }, [selectedYear, financialData]);

  if (loading) return <div>Cargando datos...</div>;
  if (error) return <div>{error}</div>;
  if (!chartData) return <div>No hay datos para mostrar</div>;

  return (
    <div className="graph-container-analytics ">
      <h2>Salud Financiera Mensual Promedio</h2>
      <div style={{ marginBottom: "20px" }}>
        <label>
          Año:{" "}
          <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
            {Object.keys(financialData).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div style={{ width: "1200px", height: "500px" }}>
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: "Salud Financiera Mensual Promedio",
              },
              tooltip: {
                mode: "index",
                intersect: false,
              },
            },
            scales: {
              x: {
                title: { display: true, text: "Mes/Año" },
              },
              y: {
                title: { display: true, text: "Índice de Salud Financiera" },
                beginAtZero: true,
                min: 0,
                max: 1,
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default FinancialHealthGraph;
