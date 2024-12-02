import { Line } from 'react-chartjs-2'; // o 'Bar' si usas un gráfico de barras
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MonthlyBalanceGraph = () => {
  const data = {
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],  // meses
    datasets: [
      {
        label: "Ingresos",  // O lo que quieras mostrar
        data: [4000, 4500, 3500, 3000, 5000, 4500, 3800, 4200, 5300, 4900, 5100, 6000],
        backgroundColor: 'rgba(75, 192, 192, 0.6)', // Color de las barras
        borderColor: 'rgba(75, 192, 192, 1)', // Borde de las barras
        borderWidth: 1
      },
      {
        label: "Gastos",  // O lo que quieras mostrar
        data: [2500, 2300, 2800, 3200, 2700, 2900, 3100, 3300, 3500, 3400, 3600, 3700],
        backgroundColor: 'rgba(255, 99, 132, 0.6)', // Color de las barras
        borderColor: 'rgba(255, 99, 132, 1)', // Borde de las barras
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Comparación Ingresos vs Gastos'
      }
    },
    scales: {
      x: {
        beginAtZero: true
      },
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="graph-container-analytics">
      <Line data={data} options={options} />
    </div>
  );
};

export default MonthlyBalanceGraph;
