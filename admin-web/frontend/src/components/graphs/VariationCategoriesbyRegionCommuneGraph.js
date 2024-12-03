import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { db } from '../../firebase'; 
import { collection, query, where, getDocs } from 'firebase/firestore';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const VariationCategoriesbyRegionCommuneGraph = () => {
  const [chartData, setChartData] = useState({});

  const fetchData = async () => {
    try {
      // Obtener transacciones de tipo Gasto
      const transactionsQuery = query(collection(db, 'transactions'), where('type', '==', 'Gasto'));
      const transactionsSnapshot = await getDocs(transactionsQuery);
      const transactions = transactionsSnapshot.docs.map(doc => doc.data());

      // Agrupar los datos por categoría
      const categorizedData = {};
      transactions.forEach(transaction => {
        const category = transaction.category || transaction.categoryName;
        const amount = transaction.amount;
        
        if (!categorizedData[category]) {
          categorizedData[category] = 0;
        }
        categorizedData[category] += amount;
      });

      // Preparar datos para el gráfico
      const labels = Object.keys(categorizedData);
      const data = Object.values(categorizedData);

      setChartData({
        labels: labels.length > 0 ? labels : ['No Data'],
        datasets: [
          {
            label: 'Gastos por Categoría',
            data: data.length > 0 ? data : [0],
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            borderColor: 'rgba(255, 99, 132, 1)',
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
  }, []);

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Monto Gastado en Cada Categoría',
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
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default VariationCategoriesbyRegionCommuneGraph;
