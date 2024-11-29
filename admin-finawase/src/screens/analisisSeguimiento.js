import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import Sidebar from '../components/Sidebar';
import { Chart } from 'chart.js';
import withAdminAuth from '../components/withAdminAuth';

const AnalisisSeguimiento = () => {
  const [trafficStats, setTrafficStats] = useState([]);
  const [userBehavior, setUserBehavior] = useState([]);
  
  // Cargar datos de trafficStats desde Firestore
  useEffect(() => {
    const loadTrafficStats = async () => {
      const snapshot = await getDocs(collection(db, 'trafficStats'));
      const trafficData = snapshot.docs.map(doc => doc.data());
      setTrafficStats(trafficData);
    };
    
    const loadUserBehavior = async () => {
      const snapshot = await getDocs(collection(db, 'userBehavior'));
      const behaviorData = snapshot.docs.map(doc => doc.data());
      setUserBehavior(behaviorData);
    };

    loadTrafficStats();
    loadUserBehavior();
  }, []);

  useEffect(() => {
    if (trafficStats.length > 0) {
      // Configuración del gráfico para estadísticas de tráfico
      const trafficCtx = document.getElementById('trafficChart').getContext('2d');
      const dates = trafficStats.map(stat => new Date(stat.date.seconds * 1000).toLocaleDateString());
      const visits = trafficStats.map(stat => stat.visits);
      const pageViews = trafficStats.map(stat => stat.pageViews);

      // Destruir gráfico previo si existe
      if (window.trafficChart) {
        window.trafficChart.destroy();
      }

      window.trafficChart = new Chart(trafficCtx, {
        type: 'line',
        data: {
          labels: dates,
          datasets: [
            {
              label: 'Visitas',
              data: visits,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true,
            },
            {
              label: 'Páginas Vistas',
              data: pageViews,
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }
  }, [trafficStats]);

  useEffect(() => {
    if (userBehavior.length > 0) {
      // Configuración del gráfico para el análisis de comportamiento
      const behaviorCtx = document.getElementById('behaviorChart').getContext('2d');
      const userIds = userBehavior.map(b => b.userId);
      const timeSpent = userBehavior.map(b => b.timeSpent);

      // Destruir gráfico previo si existe
      if (window.behaviorChart) {
        window.behaviorChart.destroy();
      }

      window.behaviorChart = new Chart(behaviorCtx, {
        type: 'bar',
        data: {
          labels: userIds,
          datasets: [
            {
              label: 'Tiempo en App (min)',
              data: timeSpent,
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }
  }, [userBehavior]);

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="main-content">
        <h1 className="text-3xl font-bold text-gray-700 mb-6">Análisis y Seguimiento</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Gráfico de estadísticas de tráfico */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Estadísticas de Tráfico y Visitas</h2>
            <canvas id="trafficChart"></canvas>
          </div>

          {/* Gráfico de análisis de comportamiento */}
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Análisis de Comportamiento de Usuarios</h2>
            <canvas id="behaviorChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAdminAuth(AnalisisSeguimiento);
