import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend, PointElement, LineController } from 'chart.js';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import "../chart_styles/Analytics2.css";

ChartJS.register(CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend, PointElement, LineController);

const VariationCategorySavingsbyRegionGraph = () => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [regionOptions, setRegionOptions] = useState([]);
  const [financialHealthOptions, setFinancialHealthOptions] = useState([]);
  const [regionFilter, setRegionFilter] = useState('');
  const [financialHealthFilter, setFinancialHealthFilter] = useState('');

  const fetchData = async () => {
    try {
      const db = getFirestore();

      // Obtener las transacciones de la colección 'transactions' donde category o categoryName = 'Ahorro'
      const transactionsCollection = collection(db, 'transactions');
      const transactionsQuery = query(transactionsCollection, where('categoryName' || 'category', '==', 'Ahorro'));
      const transactionsSnapshot = await getDocs(transactionsQuery);

      const transactions = transactionsSnapshot.docs.map(doc => doc.data());

      // Obtener la colección 'users'
      const usersCollection = collection(db, 'users');
      const usersQuery = query(usersCollection);
      const usersSnapshot = await getDocs(usersQuery);

      const users = usersSnapshot.docs.map(doc => ({
        userId: doc.data().userId,
        region: doc.data().region || (doc.data().location && doc.data().location.region),
        financialHealth: doc.data().financialHealth,
      }));

      // Extraer opciones únicas para los filtros
      const uniqueRegions = [...new Set(users.map(user => user.region))];
      const uniqueFinancialHealth = [...new Set(users.map(user => user.financialHealth))];

      setRegionOptions(uniqueRegions);
      setFinancialHealthOptions(uniqueFinancialHealth);

      // Filtrar y asociar transacciones con usuarios
      const categorizedData = {};
      transactions.forEach(transaction => {
        const user = users.find(u => u.userId === transaction.userId);
        if (user) {
          const { region, financialHealth } = user;
          const subCategoryName = transaction.subCategoryName;
          const amount = transaction.amount;

          if (
            (!regionFilter || region === regionFilter) &&
            (!financialHealthFilter || financialHealth === financialHealthFilter)
          ) {
            if (!categorizedData[subCategoryName]) {
              categorizedData[subCategoryName] = 0;
            }
            categorizedData[subCategoryName] += amount;
          }
        }
      });

      const labels = Object.keys(categorizedData);
      const data = Object.values(categorizedData);

      setChartData({
        labels: labels.length > 0 ? labels : ['No Data'],
        datasets: [
          {
            label: 'Monto Ahorrado por Subcategoría',
            data: data.length > 0 ? data : [0],
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderWidth: 2,
            pointRadius: 3,
            fill: true,
          },
        ],
      });
    } catch (error) {
      console.error('Error al obtener los datos:', error);
      setChartData({
        labels: ['Error'],
        datasets: [
          {
            label: 'Monto Ahorrado por Subcategoría',
            data: [0],
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderWidth: 2,
            pointRadius: 3,
            fill: true,
          },
        ],
      });
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
        text: 'Variación de las Categorías de Ahorro',
        font: { size: 24 },
        color: "#d0d0d0"
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
    <div className="graph-container-analytics2">  
      <div className="grafico-salud1">   
        <Line data={chartData} options={options} />
      </div> 
      <div className="filters" style={{ marginBottom: '20px', color: 'darkslategray',  }}>
        <label>
        Región:
          <select 
            value={regionFilter} 
            onChange={(e) => setRegionFilter(e.target.value)} 
            style={{ marginLeft: '10px', marginRight: '20px', backgroundColor: 'darkslategray', color: 'white' }}
          >
            <option value="">Todas</option>
            {regionOptions.map((region, index) => (
              <option key={index} value={region}>{region}</option>
            ))}
          </select>
        </label>
        <label>
          Salud Financiera:
          <select value={financialHealthFilter} onChange={(e) => setFinancialHealthFilter(e.target.value)} style={{ marginLeft: '10px', marginRight: '20px', backgroundColor: 'darkslategray', color: 'white' }}>
            <option value="">Todas</option>
            {financialHealthOptions.map((health, index) => (
              <option key={index} value={health}>{health}</option>
            ))}
          </select>
        </label>
      </div>
      
    </div>
  );
};

export default VariationCategorySavingsbyRegionGraph;
