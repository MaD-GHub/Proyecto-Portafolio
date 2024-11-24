import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import Sidebar from '../components/Sidebar';
import { Chart } from 'chart.js';
import ChartModal from './ChartModal';
import withAdminAuth from '../components/withAdminAuth';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  DoughnutController,
  BarController,
  LineController,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  DoughnutController,
  BarController,
  LineController,
  Title,
  Tooltip,
  Legend
);

const chartDetails = {
  financeChart: {
    title: "Análisis Financiero por Categoría",
    description: "Este gráfico muestra la distribución total de los gastos de todos los usuarios en diferentes categorías como entretenimiento, comida, gastos básicos y deudas.",
    purpose: "Ayuda a entender en qué categorías se están gastando más dinero los usuarios globalmente. Es útil para identificar áreas donde los usuarios podrían estar gastando en exceso."
  },
  genderChart: {
    title: "Análisis Financiero por Género",
    description: "Este gráfico compara los gastos totales entre hombres y mujeres.",
    purpose: "Ayuda a identificar si hay diferencias significativas en los patrones de gasto entre géneros, lo cual puede ser útil para personalizar recomendaciones financieras o campañas."
  },
  monthlyChart: {
    title: "Gastos Mensuales",
    description: "Este gráfico muestra la cantidad total de dinero gastado por todos los usuarios en cada mes.",
    purpose: "Permite observar las tendencias de gasto a lo largo del tiempo. Es útil para identificar meses con gastos más altos y analizar las razones detrás de esas variaciones."
  },
  savingsChart: {
    title: "Promedio de Dinero Restante al Final del Mes",
    description: "Este gráfico muestra el promedio de dinero que les queda a los usuarios al final de cada mes, después de restar los gastos de los ingresos.",
    purpose: "Ayuda a evaluar la capacidad de ahorro de los usuarios. Es útil para identificar si los usuarios tienden a quedarse sin dinero a fin de mes o si logran ahorrar una parte de sus ingresos."
  },
  totalSavingsChart: {
    title: "Ahorro Total por Mes",
    description: "Muestra el ahorro total (diferencia entre ingresos y gastos) de todos los usuarios por cada mes.",
    purpose: "Permite ver la tendencia de ahorro a lo largo del tiempo. Es útil para evaluar si los usuarios en conjunto están logrando ahorrar más o menos en ciertos meses."
  },
  expenseDistributionChart: {
    title: "Distribución de Gastos",
    description: "Este histograma muestra la distribución de los montos de gastos individuales.",
    purpose: "Ayuda a entender cómo varían los gastos entre los usuarios. Es útil para identificar si hay muchos gastos pequeños, algunos gastos grandes, o una combinación de ambos."
  },
  meanMedianChart: {
    title: "Media y Mediana de Gastos por Mes",
    description: "Compara la media (promedio) y la mediana (valor central) de los gastos en cada mes.",
    purpose: "Proporciona una visión de la tendencia general de los gastos y su distribución. La mediana es útil porque no se ve afectada por valores atípicos, a diferencia de la media."
  },
  stdDevChart: {
    title: "Desviación Estándar de Gastos por Mes",
    description: "Muestra la desviación estándar de los gastos por mes, indicando cuánta variabilidad hay en los gastos de los usuarios.",
    purpose: "Ayuda a entender la consistencia de los gastos mensuales. Una alta desviación estándar indica que los gastos varían mucho entre usuarios, mientras que una baja desviación estándar indica que los gastos son más consistentes."
  }
};

const AnalisisSeguimiento = () => {
  const [financialData, setFinancialData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [modalInfo, setModalInfo] = useState({ isOpen: false, chartId: null });

  // Cargar datos financieros y de usuarios desde Firestore
  useEffect(() => {
    const loadFinancialData = async () => {
      const transactionsSnapshot = await getDocs(collection(db, 'transactions'));
      const transactionsData = transactionsSnapshot.docs.map(doc => doc.data());

      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => doc.data());

      setFinancialData(transactionsData);
      setUserData(usersData);
    };

    loadFinancialData();
  }, []);

  // Inicializar gráficos con datos de Firebase
  const initializeCharts = () => {
    if (financialData.length > 0 && userData.length > 0) {
      const categories = ['entertainment', 'food', 'basicExpenses', 'debts'];
      const genders = ['masculino', 'femenino'];

      // Datos para el gráfico de Análisis Financiero por Categoría
      const categorySums = categories.map(category => (
        financialData.filter(d => d.category === category).reduce((sum, d) => sum + d.amount, 0)
      ));

      // Datos para el gráfico de Análisis Financiero por Género
      const genderSums = genders.map(gender => (
        financialData.filter(d => {
          const user = userData.find(u => u.userId === d.userId);
          return user && user.gender === gender;
        }).reduce((sum, d) => sum + d.amount, 0)
      ));

      // Datos para el gráfico de Gastos Mensuales
      const monthlyExpenses = financialData.reduce((acc, d) => {
        if (d.creationDate) {
          const month = new Date(d.creationDate.seconds * 1000).getMonth();
          acc[month] = (acc[month] || 0) + d.amount;
        }
        return acc;
      }, {});

      // Datos para el gráfico de Ahorro Total por Mes
      const totalSavings = financialData.reduce((acc, d) => {
        if (d.creationDate) {
          const month = new Date(d.creationDate.seconds * 1000).getMonth();
          acc[month] = (acc[month] || 0) + (d.income - d.amount);
        }
        return acc;
      }, {});

      // Distribución de Gastos (histograma)
      const expenses = financialData.map(d => d.amount);

      // Datos de Media y Mediana de Gastos por Mes
      const statsByMonth = Object.keys(monthlyExpenses).map(month => {
        const expensesForMonth = financialData
          .filter(d => d.creationDate && new Date(d.creationDate.seconds * 1000).getMonth() === parseInt(month))
          .map(d => d.amount);
        const mean = expensesForMonth.reduce((sum, value) => sum + value, 0) / expensesForMonth.length;
        const median = expensesForMonth.sort((a, b) => a - b)[Math.floor(expensesForMonth.length / 2)];
        return { mean, median };
      });

      // Desviación Estándar de Gastos por Mes
      const stdDevByMonth = Object.keys(monthlyExpenses).map(month => {
        const expensesForMonth = financialData
          .filter(d => d.creationDate && new Date(d.creationDate.seconds * 1000).getMonth() === parseInt(month))
          .map(d => d.amount);
        const mean = expensesForMonth.reduce((sum, value) => sum + value, 0) / expensesForMonth.length;
        const variance = expensesForMonth.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / expensesForMonth.length;
        return Math.sqrt(variance);
      });

      // Configuración de gráficos
      const setupChart = (ctx, type, data, options) => {
        if (window[ctx] && window[ctx] instanceof Chart) {
          window[ctx].destroy();
        }
        window[ctx] = new Chart(document.getElementById(ctx).getContext('2d'), {
          type,
          data,
          options
        });
      };

      // Crear gráficos
      setupChart('financeChart', 'doughnut', {
        labels: categories,
        datasets: [{ data: categorySums, backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)'] }]
      });

      setupChart('genderChart', 'bar', {
        labels: genders,
        datasets: [{ label: 'Gastos por Género', data: genderSums, backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)'] }]
      });

      setupChart('monthlyChart', 'line', {
        labels: Object.keys(monthlyExpenses).map(month => `Mes ${parseInt(month) + 1}`),
        datasets: [{ label: 'Gastos Mensuales', data: Object.values(monthlyExpenses), borderColor: 'rgba(75, 192, 192, 1)', backgroundColor: 'rgba(75, 192, 192, 0.2)', fill: true }]
      });

      setupChart('savingsChart', 'line', {
        labels: Object.keys(totalSavings).map(month => `Mes ${parseInt(month) + 1}`),
        datasets: [{ label: 'Ahorro Total por Mes', data: Object.values(totalSavings), borderColor: 'rgba(54, 162, 235, 1)', backgroundColor: 'rgba(54, 162, 235, 0.2)', fill: true }]
      });

      setupChart('expenseDistributionChart', 'bar', {
        labels: expenses,
        datasets: [{ label: 'Distribución de Gastos', data: expenses, backgroundColor: 'rgba(153, 102, 255, 0.6)', borderColor: 'rgba(153, 102, 255, 1)', borderWidth: 1 }]
      });

      setupChart('meanMedianChart', 'bar', {
        labels: Object.keys(monthlyExpenses).map(month => `Mes ${parseInt(month) + 1}`),
        datasets: [
          { label: 'Media de Gastos', data: statsByMonth.map(stat => stat.mean), backgroundColor: 'rgba(255, 159, 64, 0.6)', borderColor: 'rgba(255, 159, 64, 1)', borderWidth: 1 },
          { label: 'Mediana de Gastos', data: statsByMonth.map(stat => stat.median), backgroundColor: 'rgba(75, 192, 192, 0.6)', borderColor: 'rgba(75, 192, 192, 1)', borderWidth: 1 }
        ]
      });

      setupChart('stdDevChart', 'bar', {
        labels: Object.keys(monthlyExpenses).map(month => `Mes ${parseInt(month) + 1}`),
        datasets: [{ label: 'Desviación Estándar de Gastos', data: stdDevByMonth, backgroundColor: 'rgba(255, 99, 132, 0.6)', borderColor: 'rgba(255, 99, 132, 1)', borderWidth: 1 }]
      });
    }
  };

  useEffect(initializeCharts, [financialData, userData]);

  const openModal = (chartId) => {
    setModalInfo({ isOpen: true, chartId });
  };

  const closeModal = () => {
    setModalInfo({ isOpen: false, chartId: null });
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content">
        <h1 className="text-3xl font-bold text-gray-700 mb-6">Análisis y Seguimiento</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {Object.keys(chartDetails).map(chartId => (
            <div
              key={chartId}
              className="bg-white p-6 rounded-lg shadow-lg"
              onClick={() => openModal(chartId)}
            >
              <h2 className="text-xl font-semibold mb-4">{chartDetails[chartId].title}</h2>
              <canvas id={chartId}></canvas>
            </div>
          ))}
        </div>
        <ChartModal
          isOpen={modalInfo.isOpen}
          onRequestClose={closeModal}
          chartInfo={chartDetails[modalInfo.chartId]}
        />
        <ChartModal
          isOpen={modalInfo.isOpen}
          onRequestClose={closeModal}
          chartInfo={chartDetails[modalInfo.chartId]}
        />
      </div>
    </div>
  );
};

export default withAdminAuth(AnalisisSeguimiento);
