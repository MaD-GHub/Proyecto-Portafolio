import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import Sidebar from "../components/Sidebar";
import { Chart, registerables } from "chart.js"; // Importar los componentes necesarios
import withAdminAuth from "../components/withAdminAuth";

// Registrar los componentes de Chart.js, incluyendo las escalas
Chart.register(...registerables);

const Estadisticas = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Función para cargar las transacciones desde Firebase
    const loadTransactions = async () => {
      const transactionsSnapshot = await getDocs(collection(db, "transactions"));
      const transactionsList = transactionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTransactions(transactionsList);
    };

    loadTransactions();
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      // Crear el gráfico de ingresos y gastos por mes
      const monthlyCtx = document.getElementById("monthlyChart").getContext("2d");

      const monthlyIncomes = [];
      const monthlyExpenses = [];

      // Filtrar las transacciones por tipo y convertir fechas si es necesario
      transactions.forEach(transaction => {
        const amount = transaction.amount;

        // Verificar si `selectedDate` es una cadena o un Timestamp de Firestore
        const transactionDate = typeof transaction.selectedDate === "string"
          ? new Date(transaction.selectedDate) // Si es una cadena, convertir a fecha
          : transaction.selectedDate.toDate(); // Si es un Timestamp, usar `.toDate()`

        const month = transactionDate.getMonth(); // Obtener el mes de la transacción

        if (transaction.type === "Ingreso") {
          monthlyIncomes[month] = (monthlyIncomes[month] || 0) + amount;
        } else if (transaction.type === "Gasto") {
          monthlyExpenses[month] = (monthlyExpenses[month] || 0) + amount;
        }
      });

      // Destruir gráfico anterior si existe
      if (window.monthlyChart && typeof window.monthlyChart.destroy === "function") {
        window.monthlyChart.destroy();
      }

      window.monthlyChart = new Chart(monthlyCtx, {
        type: "bar",
        data: {
          labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
          datasets: [
            {
              label: "Ingresos",
              data: monthlyIncomes,
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1,
            },
            {
              label: "Gastos",
              data: monthlyExpenses,
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }
  }, [transactions]);

  useEffect(() => {
    if (transactions.length > 0) {
      // Crear el gráfico de ingresos y gastos por año
      const yearlyCtx = document.getElementById("yearlyChart").getContext("2d");

      const yearlyIncomes = [];
      const yearlyExpenses = [];

      // Filtrar las transacciones por año y convertir fechas si es necesario
      transactions.forEach(transaction => {
        const amount = transaction.amount;

        // Verificar si `selectedDate` es una cadena o un Timestamp de Firestore
        const transactionDate = typeof transaction.selectedDate === "string"
          ? new Date(transaction.selectedDate)
          : transaction.selectedDate.toDate();

        const year = transactionDate.getFullYear(); // Obtener el año de la transacción

        if (transaction.type === "Ingreso") {
          yearlyIncomes[year] = (yearlyIncomes[year] || 0) + amount;
        } else if (transaction.type === "Gasto") {
          yearlyExpenses[year] = (yearlyExpenses[year] || 0) + amount;
        }
      });

      // Destruir gráfico anterior si existe
      if (window.yearlyChart && typeof window.yearlyChart.destroy === "function") {
        window.yearlyChart.destroy();
      }

      window.yearlyChart = new Chart(yearlyCtx, {
        type: "line",
        data: {
          labels: Object.keys(yearlyIncomes),
          datasets: [
            {
              label: "Ingresos",
              data: Object.values(yearlyIncomes),
              borderColor: "rgba(75, 192, 192, 1)",
              tension: 0.1,
            },
            {
              label: "Gastos",
              data: Object.values(yearlyExpenses),
              borderColor: "rgba(255, 99, 132, 1)",
              tension: 0.1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }
  }, [transactions]);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="main-content">
        <h1 className="text-3xl font-bold text-gray-700 mb-6">Estadísticas</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Dinero por Mes</h2>
            <canvas id="monthlyChart"></canvas>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Dinero por Año</h2>
            <canvas id="yearlyChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAdminAuth(Estadisticas);
