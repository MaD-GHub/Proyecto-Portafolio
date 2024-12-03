import { useState, useEffect } from "react";
import { collection, getDocs, getFirestore, query } from "firebase/firestore"; // Importa Firestore y sus funciones
import { Bar } from 'react-chartjs-2'; // Importamos el gráfico de barras
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Registrar los componentes necesarios para Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SavingsPercentageGraph = () => {
  const [loading, setLoading] = useState(true); // Para mostrar el estado de carga
  const [error, setError] = useState(null); // Para manejar errores
  const [transactions, setTransactions] = useState([]); // Estado para almacenar las transacciones
  const [monthlyData, setMonthlyData] = useState({}); // Para almacenar los datos agrupados por mes/año

  // Función para obtener las transacciones de Firestore
  const fetchTransactions = async () => {
    const db = getFirestore();
    const transactionsCollection = collection(db, "transactions");

    try {
      const q = query(transactionsCollection);
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setLoading(false);
        console.log("No hay transacciones disponibles.");
        return;
      }

      const transactionsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        let date = null;

        if (data.selectedDate) {
          if (data.selectedDate.seconds) {
            date = new Date(data.selectedDate.seconds * 1000);  // Si es un timestamp
          } else {
            date = new Date(data.selectedDate);  // Si ya es una fecha string
          }
        }

        if (isNaN(date)) {
          date = new Date();  // Si la fecha no es válida, asignamos la fecha actual
        }

        const formattedDate = date.toISOString().split('T')[0];  // Formato "YYYY-MM-DD"
        const month = date.getMonth() + 1;  // Mes (1-12)
        const year = date.getFullYear();  // Año

        return {
          id: doc.id,
          type: data.type || "undefined",
          category: data.category || "undefined",  // Asegúrate de tener la categoría
          amount: data.amount || 0,
          selectedDate: formattedDate, // Guardamos la fecha ya transformada
          month: month,
          year: year,
        };
      });

      setTransactions(transactionsData);
      console.log("Transacciones cargadas:", transactionsData);  // Verifica los datos
      setLoading(false);
    } catch (error) {
      setError("Error al cargar los datos");
      setLoading(false);
    }
  };

  // Función para procesar las transacciones y agrupar por mes/año
  const processTransactions = (transactions) => {
    if (!transactions || transactions.length === 0) {
      return {};
    }

    const monthlyData = {};

    transactions.forEach(transaction => {
      const { month, year, type, category, amount } = transaction;

      const key = `${year}-${month < 10 ? '0' : ''}${month}`;  // Formato "YYYY-MM"
      
      if (!monthlyData[key]) {
        monthlyData[key] = { ingresos: 0, gastos: 0, savings: 0 };
      }

      if (type === 'Ingreso') {
        monthlyData[key].ingresos += amount;
      } else if (type === 'Gasto') {
        monthlyData[key].gastos += amount;
      }

      // Agregar a los ahorros solo si la categoría es "Ahorro"
      if (category === 'Ahorro') {
        monthlyData[key].savings += amount;
      }
    });

    console.log("Datos agrupados:", monthlyData);  // Verifica los datos procesados
    return monthlyData;
  };

  // Llamamos a la función de procesado cuando las transacciones cambian
  useEffect(() => {
    if (transactions.length > 0) {
      const groupedData = processTransactions(transactions);
      setMonthlyData(groupedData); // Establecemos los datos procesados en el estado
    }
  }, [transactions]);

  // Llamamos a la función de obtener las transacciones cuando el componente se monta
  useEffect(() => {
    fetchTransactions();
  }, []);

  if (loading) {
    return <div>Cargando datos...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  // Preparación de los datos para el gráfico
  const chartLabels = []; // Vamos a asegurarnos de que estén todos los meses del año

  // Definir todos los meses posibles en el formato "2024-01", "2024-02", ..., "2024-12"
  const year = 2024; // Año fijo
  for (let month = 1; month <= 12; month++) {
    const label = `${year}-${month < 10 ? '0' : ''}${month}`;  // Asegurarnos de que el mes tenga 2 dígitos
    chartLabels.push(label);
  }

  // Calcular el porcentaje de ahorro respecto a los ingresos
  const savingsPercentageData = chartLabels.map(label => {
    const ingresos = monthlyData[label]?.ingresos || 0;
    const savings = monthlyData[label]?.savings || 0;

    // Evitar la división por cero
    return ingresos > 0 ? (savings / ingresos) * 100 : 0;
  });

  console.log("Datos de Ahorros como porcentaje de ingresos:", savingsPercentageData); // Verifica los datos

  const chartData = {
    labels: chartLabels,  // Usamos las etiquetas con todos los meses
    datasets: [
      {
        label: 'Ahorro Promedio (%)',
        data: savingsPercentageData,
        backgroundColor: 'rgba(75, 192, 192, 0.5)', // Color de barras para Ahorro
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <h2>Gráfico de Ahorro Promedio Mensual (%)</h2>
      <div style={{ width: '700px', height: '500px' }}>
        <Bar
          key={JSON.stringify(chartData)}  // Forzar redibujado
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Ahorro Promedio Mensual (%)',
                font: { size: 20 },
              },
              tooltip: {
                mode: 'index',
                intersect: false,
              },
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Mes/Año',
                  font: { size: 14 },
                },
                ticks: {
                  autoSkip: true,
                  maxTicksLimit: 12,
                  maxRotation: 0,
                  minRotation: 0,
                },
                grid: {
                  display: true,
                  drawOnChartArea: false,
                },
                offset: true,
              },
              y: {
                title: {
                  display: true,
                  text: 'Ahorro (%)',
                  font: { size: 14 },
                },
                beginAtZero: true,
                ticks: {
                  stepSize: 10,
                  max: 100,
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default SavingsPercentageGraph;
