import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Asegúrate de tener bien configurado firebase.js
import Header from "../components/Header"; // Header con título y subtítulo
import "../styles/HomeScreen.css";
import FinancialActivityChart from "../components/FinancialActivityChart"; // Componente de gráficos

const HomeScreen = () => {
  const [financialData, setFinancialData] = useState({
    ingresos: 0,
    gastos: 0,
    ahorros: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        // Cargar datos de la colección 'financials' en Firebase
        const snapshot = await getDocs(collection(db, "financials"));
        let ingresos = 0;
        let gastos = 0;
        let ahorros = 0;

        snapshot.forEach((doc) => {
          const data = doc.data();
          // Suponiendo que en la colección 'financials' tienes campos tipo 'income', 'expense' y 'savings'
          ingresos += parseFloat(data.income) || 0;
          gastos += parseFloat(data.expense) || 0;
          ahorros += parseFloat(data.savings) || 0;
        });

        setFinancialData({
          ingresos,
          gastos,
          ahorros
        });
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener los datos financieros: ", error);
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, []);

  if (loading) {
    return <p>Cargando datos financieros...</p>;
  }

  return (
    <div className="home-screen">
      <div className="main-content">
        {/* Header */}
        <Header title="Hola, Admin!" subtitle="Listo para los nuevos cambios?" />

        {/* Primera línea: 55% gráficos, 45% card vacía */}
        <div className="first-line">
          <div className="chart-container">
            {/* Barra superior */}
            <div className="chart-header">
              <span>Resumen Financiero</span>
            </div>

            {/* Gráficos */}
            <div className="chart-group">
              <div className="chart">
                <FinancialActivityChart
                  title="Ingresos"
                  color="green"
                  total={`$${financialData.ingresos.toLocaleString()}`}
                  transactions={financialData.ingresos}
                />
              </div>
              <div className="chart-divider"></div>
              <div className="chart">
                <FinancialActivityChart
                  title="Gastos"
                  color="red"
                  total={`$${financialData.gastos.toLocaleString()}`}
                  transactions={financialData.gastos}
                />
              </div>
              <div className="chart-divider"></div>
              <div className="chart">
                <FinancialActivityChart
                  title="Ahorros"
                  color="orange"
                  total={`$${financialData.ahorros.toLocaleString()}`}
                  transactions={financialData.ahorros}
                />
              </div>
            </div>
          </div>

          {/* Card Vacía */}
          <div className="large-card">
            <h3>Card Vacía</h3>
            <p>Contenido por definir.</p>
          </div>
        </div>

        {/* Segunda línea: 50% progreso (2 cards), 50% tabla de categorías */}
        <div className="second-line">
          <div className="progress-section">
            <div className="progress-card">
              <h3>Progreso de Tareas 1</h3>
              <div className="progress-bar">
                <div className="progress" style={{ width: "40%" }}></div>
              </div>
              <p>2/5 completado</p>
            </div>
            <div className="progress-card">
              <h3>Progreso de Tareas 2</h3>
              <div className="progress-bar">
                <div className="progress" style={{ width: "70%" }}></div>
              </div>
              <p>7/10 completado</p>
            </div>
          </div>
          <div className="table-card">
            <h3>Categorías Principales</h3>
            <table>
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Tipo</th>
                  <th>Monto Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Comida</td>
                  <td>Gasto</td>
                  <td>$5,000</td>
                </tr>
                <tr>
                  <td>Salario</td>
                  <td>Ingreso</td>
                  <td>$12,000</td>
                </tr>
                <tr>
                  <td>Educación</td>
                  <td>Ahorro</td>
                  <td>$3,000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;
