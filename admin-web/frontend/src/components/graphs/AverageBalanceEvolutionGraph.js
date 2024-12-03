import React, { useState, useEffect } from 'react';
import { collection, getDocs, getFirestore, query } from 'firebase/firestore';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Registrar los componentes necesarios para Chart.js
ChartJS.register(CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend);

const AverageBalanceEvolutionGraph = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [monthlyData, setMonthlyData] = useState({});

  // Función para obtener las transacciones de Firestore
  const fetchTransactions = async () => {
    const db = getFirestore();
    const transactionsCollection = collection(db, 'transactions');

    try {
      const q = query(transactionsCollection);
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setLoading(false);
        console.log('No se encontraron transacciones.');
        return;
      }

      const transactionsData = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        let date = null;

        // Verifica el formato de la fecha
        if (data.selectedDate) {
          if (typeof data.selectedDate === 'string') {
            date = new Date(data.selectedDate);
          } else if (data.selectedDate.seconds) {
            date = new Date(data.selectedDate.seconds * 1000); // Firestore timestamp
          } else if (data.selectedDate instanceof Date) {
            date = data.selectedDate; // Ya es un objeto Date
          }
        }

        if (!date || isNaN(date)) {
          console.warn('Fecha inválida para la transacción:', data.selectedDate);
          date = new Date(); // Establecer fecha actual si no hay fecha válida
        }

        const month = date.getMonth() + 1;  // getMonth() retorna 0 para enero, 1 para febrero, etc.
        const year = date.getFullYear();
        
        const isIngreso = data.amount >= 0;
        
        return {
          amount: data.amount || 0,
          month,
          year,
          type: isIngreso ? 'Ingreso' : 'Gasto',
        };
      });

      setTransactions(transactionsData);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar las transacciones:', error);
      setError('Error al cargar los datos');
      setLoading(false);
    }
  };

  // Función para calcular el balance mensual (Ingreso - Gasto)
  const calculateMonthlyBalance = (transactions) => {
    const monthlyBalances = {};

    // Filtrar y agrupar las transacciones por mes (Ingreso y Gasto)
    transactions.forEach(({ month, year, amount, type }) => {
      const key = `${year}-${month}`;  // Agrupar por año y mes (ej. '2024-01')

      if (!monthlyBalances[key]) {
        monthlyBalances[key] = { incomeSum: 0, expenseSum: 0 };
      }

      const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;

      // Si es ingreso, lo sumamos
      if (type === 'Ingreso') {
        monthlyBalances[key].incomeSum += validAmount;
      } 
      // Si es gasto, lo sumamos
      else if (type === 'Gasto') {
        monthlyBalances[key].expenseSum += validAmount;
      }
    });

    // Calculamos el balance final (ingreso - gasto) para cada mes
    const monthlyBalance = {};
    for (const key in monthlyBalances) {
      const { incomeSum, expenseSum } = monthlyBalances[key];
      monthlyBalance[key] = incomeSum - expenseSum;  // Guardamos solo la diferencia
    }

    return monthlyBalance;
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      const monthlyBalance = calculateMonthlyBalance(transactions);
      setMonthlyData(monthlyBalance);
    }
  }, [transactions]);

  if (loading) return <div>Cargando datos...</div>;
  if (error) return <div>{error}</div>;

  // Verificación de si `monthlyData` tiene datos
  if (Object.keys(monthlyData).length === 0) {
    return <div>No hay datos para mostrar</div>;
  }

  // Preparación de los datos para el gráfico
  const chartLabels = Object.keys(monthlyData).sort((a, b) => new Date(a) - new Date(b)); // Ordenar las fechas

  const chartData = {
    labels: chartLabels.map(label => {
      const [year, month] = label.split('-');
      return `${['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][month - 1]} ${year}`;
    }),
    datasets: [
      {
        label: 'Balance Mensual (Ingreso - Gasto)',
        data: chartLabels.map(label => monthlyData[label]), // Usamos la diferencia entre ingresos y gastos
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        tension: 0.4,
        fill: false,
      },
    ],
  };

  // Asignar valores manuales para los límites de Y
  const minValue = Math.min(...Object.values(monthlyData)) - 1000;  // Ajuste manual del valor mínimo
  const maxValue = Math.max(...Object.values(monthlyData)) + 1000;  // Ajuste manual del valor máximo

  return (
    <div>
      <h3>Evolución del Balance Promedio Mensual</h3>
      <div style={{ width: "700px", height: "500px" }}>
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Evolución del Balance Promedio Mensual',
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
              },
              y: {
                title: {
                  display: true,
                  text: 'Balance Promedio ($)',
                  font: { size: 14 },
                },
                display: true,  // Habilitar la visualización del eje Y
                beginAtZero: false, // Para que no empiece en cero, según tus datos
                ticks: {
                  stepSize: 100000,  // Ajuste paso para intervalos claros
                  min: minValue,  // Establecer el valor mínimo calculado
                  max: maxValue,  // Establecer el valor máximo calculado
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default AverageBalanceEvolutionGraph;
