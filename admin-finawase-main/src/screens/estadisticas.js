import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import Sidebar from "../components/Sidebar";
import withAdminAuth from "../components/withAdminAuth";
import LoadingScreen from "../components/loading"; // Importar pantalla de carga
import MonthlyChart from "../components/charts/MonthlyChart";
import YearlyChart from "../components/charts/YearlyChart";
import CategoryExpenseChart from "../components/charts/CategoryExpenseChart";
import CategoryIncomeChart from "../components/charts/CategoryIncomeChart";
import DailyActivityChart from "../components/charts/DailyActivityChart";
import MostFrequentActionsChart from "../components/charts/MostFrequentActionsChart";
import UserActivityDistributionChart from "../components/charts/UserActivityDistributionChart";
import MostVisitedScreensChart from "../components/charts/MostVisitedScreensChart";

const Estadisticas = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Estado para el loading

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const transactionsSnapshot = await getDocs(collection(db, "transactions"));
        const transactionsList = transactionsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTransactions(transactionsList);
      } catch (error) {
        console.error("Error al cargar transacciones:", error);
      } finally {
        setIsLoading(false); // Ocultar la pantalla de carga cuando los datos se carguen
      }
    };

    loadTransactions();
  }, []);

  if (isLoading) {
    return <LoadingScreen isLoading={isLoading} />; // Mostrar pantalla de carga si aún está cargando
  }

  return (
    <div className="dashboard-container flex flex-col lg:flex-row bg-base-100 dark:bg-base-200">
      <Sidebar />

      <div className="main-content p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Estadísticas</h1>

        {/* Cuadrícula para los primeros dos gráficos en dos columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="card bg-base-100 shadow-lg p-6 dark:bg-base-300">
            <h2 className="card-title text-lg font-semibold">
              Ingresos y Gastos por Mes
            </h2>
            <MonthlyChart transactions={transactions} />
          </div>
          <div className="card bg-base-100 shadow-lg p-6 dark:bg-base-300">
            <h2 className="card-title text-lg font-semibold">
              Ingresos y Gastos por Año
            </h2>
            <YearlyChart transactions={transactions} />
          </div>
        </div>

        {/* Gráfico de pantallas más visitadas */}
        <div className="card bg-base-100 shadow-lg p-6 dark:bg-base-300 mt-5">
          <h3 className="card-title text-lg font-semibold">
            Pantallas Más Visitadas
          </h3>
          <MostVisitedScreensChart />
        </div>

        {/* Gráfico de gastos por categoría ocupando toda la fila */}
        <div className="card bg-base-100 shadow-lg p-6 dark:bg-base-300 mt-5">
          <h2 className="card-title text-lg font-semibold">
            Gastos por Categoría
          </h2>
          <CategoryExpenseChart transactions={transactions} />
        </div>

        {/* Gráfico de ingresos por categoría */}
        <div className="card bg-base-100 shadow-lg p-6 dark:bg-base-300 mt-5">
          <h2 className="card-title text-lg font-semibold">
            Ingresos por Categoría
          </h2>
          <CategoryIncomeChart transactions={transactions} />
        </div>

        {/* Gráfico de actividad diaria */}
        <div className="card bg-base-100 shadow-lg p-6 dark:bg-base-300 mt-5">
          <h3 className="card-title text-lg font-semibold">
            Actividad Diaria
          </h3>
          <DailyActivityChart />
        </div>

        {/* Gráfico de acciones más frecuentes */}
        <div className="card bg-base-100 shadow-lg p-6 dark:bg-base-300 mt-5">
          <h3 className="card-title text-lg font-semibold">
            Acciones Más Frecuentes
          </h3>
          <MostFrequentActionsChart />
        </div>

        {/* Gráfico de distribución de actividades por usuario */}
        <div className="card bg-base-100 shadow-lg p-6 dark:bg-base-300 mt-5">
          <h3 className="card-title text-lg font-semibold">
            Distribución de Actividades por Usuario
          </h3>
          <UserActivityDistributionChart />
        </div>
      </div>
    </div>
  );
};

export default withAdminAuth(Estadisticas);
