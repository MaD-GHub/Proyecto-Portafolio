import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { db } from './firebase'; 
import { collection, query, where, getDocs } from 'firebase/firestore';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const VariationCategorySavingsbyRegionGraph = () => {
  const [chartData, setChartData] = useState({});
  const [regionFilter, setRegionFilter] = useState('');
  const [financialHealthFilter, setFinancialHealthFilter] = useState('');

  const fetchData = async () => {
    try {
      // Obtener transactions
      const transactionsQuery = query(collection(db, 'transactions'), where('subCategory', '!=', ''));
      const transactionsSnapshot = await getDocs(transactionsQuery);
      const transactions = transactionsSnapshot.docs.map(doc => doc.data());

      // Obtener userId y los campos necesarios de users
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      const users = usersSnapshot.docs.map(doc => ({
        userId: doc.data().userId,
        region: doc.data().region || (doc.data().location && doc.data().location.region),
        financialHealth: doc.data().financialHealth,
      }));

      // Asociar transactions con users
      const categorizedData = {};
      transactions.forEach(transaction => {
        const user = users.find(u => u.userId === transaction.userId);
        if (user) {
          const { region, financialHealth } = user;
          const subCategory = transaction.subCategory || transaction.subCategoryName;
          const amount = transaction.amount;

          // Filtros
          if (
            (!regionFilter || region === regionFilter) &&
            (!financialHealthFilter || financialHealth === financialHealthFilter)
          ) {
            if (!categorizedData[subCategory]) {
              categorizedData[subCategory] = 0;
            }
            categorizedData[subCategory] += amount;
          }
        }
      });

      // Datos para el gráfico
      const labels = Object.keys(categorizedData);
      const data = Object.values(categorizedData);

      setChartData({
        labels: labels.length > 0 ? labels : ['No Data'],
        datasets: [
          {
            label: 'Monto Ahorrado por Subcategoría',
            data: data.length > 0 ? data : [0],
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
        ],
      });
    } catch (error) {
      console.error('Error al obtener los datos:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [regionFilter, financialHealthFilter]);

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Variación de las Categorías de las Metas de Ahorro Según Salud Financiera y Región',
      },
    },
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="graph-container-analytics">
      <div className="filters">
        <label>
          Región:
          <input
            type="text"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
          />
        </label>
        <label>
          Salud Financiera:
          <input
            type="text"
            value={financialHealthFilter}
            onChange={(e) => setFinancialHealthFilter(e.target.value)}
          />
        </label>
      </div>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default VariationCategorySavingsbyRegionGraph;
