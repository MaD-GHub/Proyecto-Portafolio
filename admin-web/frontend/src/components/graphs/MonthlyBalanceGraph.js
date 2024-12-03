import { useEffect, useState } from "react";
import { fetchTransactions } from "./firebase"; // Importa la función desde firebase.js
import { Bar } from "react-chartjs-2"; // Gráfico de barras
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// Registrar los componentes necesarios para Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MonthlyBalanceGraph = () => {
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState({});
  const [selectedYear, setSelectedYear] = useState(2024); // Año seleccionado

  // Función para obtener las transacciones y agrupar por mes
  const loadData = async () => {
    const data = await fetchTransactions(selectedYear); // Llamada a la función de Firebase
    setMonthlyData(data); // Establecer los datos agrupados por mes
    setLoading(false); // Marcar como cargado
  };

  useEffect(() => {
    loadData();
  }, [selectedYear]);

  if (loading) {
    return <div>Cargando datos...</div>;
  }

  // Preparación de los datos para el gráfico
  const chartLabels = [];
  const year = selectedYear;

  // Generar etiquetas de los meses en formato "YYYY-MM"
  for (let month = 0; month < 12; month++) {
    const label = `${year}-${month < 9 ? "0" + (month + 1) : month + 1}`;
    chartLabels.push(label);
  }

  // Creamos los arrays para los ingresos y los gastos
  const ingresosData = chartLabels.map((label) => monthlyData[label]?.incomeSum || 0);
  const gastosData = chartLabels.map((label) => monthlyData[label]?.expenseSum || 0);

  // Datos de configuración del gráfico
  const chartData = {
    labels: chartLabels,  // Meses (año-mes)
    datasets: [
      {
        label: "Ingresos",
        data: ingresosData,  // Los datos de ingresos por mes
        backgroundColor: "rgba(75, 192, 192, 0.5)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
      {
        label: "Gastos",
        data: gastosData,  // Los datos de gastos por mes
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Configuración del gráfico
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: "Ingresos vs Gastos por Mes/Año",
        font: { size: 20 },
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Mes/Año", font: { size: 14 } },
        ticks: { autoSkip: true, maxTicksLimit: 12, maxRotation: 0 },
        grid: { display: true, drawOnChartArea: false },
        offset: true,
      },
      y: {
        title: { display: true, text: "Monto ($)", font: { size: 14 } },
        beginAtZero: true,  // Aseguramos que el gráfico comienza desde 0
        ticks: {
          stepSize: 1000,  // Controla el paso de los valores en el eje Y
          min: 0,  // Establece un valor mínimo para el eje Y
          max: Math.max(...ingresosData, ...gastosData) + 1000, // Max es el valor más alto de los datos, con un margen
        },
      },
    },
  };

  return (
    <div>
      <h2>Gráfico de Ingresos y Gastos</h2>
      <div style={{ width: "700px", height: "500px" }}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default MonthlyBalanceGraph;
