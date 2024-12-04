import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import "../chart_styles/GastosCategorias.css";


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const VariationCategoriesbyRegionCommuneGraph = () => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [regionOptions, setRegionOptions] = useState([]);
  const [communeOptions, setCommuneOptions] = useState([]);
  const [regionFilter, setRegionFilter] = useState('');
  const [communeFilter, setCommuneFilter] = useState('');

  const fetchData = async () => {
    try {
      const db = getFirestore();

      // Obtener la colección 'users' para los filtros
      const usersCollection = collection(db, 'users');
      const usersQuery = query(usersCollection);
      const usersSnapshot = await getDocs(usersQuery);

      const users = usersSnapshot.docs.map(doc => ({
        userId: doc.data().userId,
        region: doc.data().region || (doc.data().location && doc.data().location.region),
        comuna: doc.data().comuna || (doc.data().location && doc.data().location.city),
      }));

      // Extraer opciones únicas para los filtros
      const uniqueRegions = [...new Set(users.map(user => user.region))];
      const uniqueCommunes = [...new Set(users.map(user => user.comuna))];

      setRegionOptions(uniqueRegions);
      setCommuneOptions(uniqueCommunes);

      // Obtener las transacciones de la colección 'transactions'
      const transactionsCollection = collection(db, 'transactions');
      const transactionsQuery = query(transactionsCollection, where('type', '==', 'Gasto'));
      const transactionsSnapshot = await getDocs(transactionsQuery);

      const transactions = transactionsSnapshot.docs.map(doc => doc.data());

      // Filtrar y asociar transacciones con usuarios
      const categorizedData = {};
      transactions.forEach(transaction => {
        const user = users.find(u => u.userId === transaction.userId);
        if (user) {
          const { region, comuna } = user;
          const category = transaction.category || transaction.categoryName;
          const amount = transaction.amount;

          if (
            (!regionFilter || region === regionFilter) &&
            (!communeFilter || comuna === communeFilter)
          ) {
            if (!categorizedData[category]) {
              categorizedData[category] = 0;
            }
            categorizedData[category] += amount;
          }
        }
      });

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
      setChartData({
        labels: ['Error'],
        datasets: [
          {
            label: 'Gastos por Categoría',
            data: [0],
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
          },
        ],
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, [regionFilter, communeFilter]);

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Variación de las Categorías por Gastos',
        font: { size: 24 }, // Agrandar el tamaño de la letra del título
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
    <div className="graph-container-analytics-categorias-gastos">
      <div className="filters-categorias-gastos" style={{ marginBottom: '20px', color: 'darkslategray' }}>
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
          Comuna:
          <select 
            value={communeFilter} 
            onChange={(e) => setCommuneFilter(e.target.value)} 
            style={{ marginLeft: '10px', backgroundColor: 'darkslategray', color: 'white' }}
          >
            <option value="">Todas</option>
            {communeOptions.map((commune, index) => (
              <option key={index} value={commune}>{commune}</option>
            ))}
          </select>
        </label>
      </div>
      <div style={{ width: "700px", height: "450px"}}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default VariationCategoriesbyRegionCommuneGraph;
