import React, { useState, useEffect } from "react";
import Card from "./Card";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Asumiendo que el archivo firebase.js está correctamente configurado
import "../styles/Dashboard.css";

const Dashboard = () => {
  // Estado para almacenar los datos obtenidos de Firebase
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [loading, setLoading] = useState(true);

  // Cargar los datos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener usuarios
        const usersSnapshot = await getDocs(collection(db, "users"));
        setTotalUsers(usersSnapshot.size);

        // Obtener transacciones
        const transactionsSnapshot = await getDocs(collection(db, "transactions"));
        let totalGastos = 0;
        let totalIngresos = 0;

        transactionsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.type === "Gasto") {
            totalGastos += parseFloat(data.amount) || 0;
          } else if (data.type === "Ingreso") {
            totalIngresos += parseFloat(data.amount) || 0;
          }
        });

        setTotalExpenses(totalGastos);
        setTotalIncome(totalIngresos);

        setLoading(false);
      } catch (error) {
        console.error("Error al obtener los datos de Firebase:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p>Cargando datos...</p>;
  }

  return (
    <div className="dashboard">
      {/* Fila 1: Métricas principales */}
      <div className="dashboard-row">
        <Card title="Usuarios Totales" type="card-graph">
          <p>{totalUsers}</p>
        </Card>
        <Card title="Gastos Totales" type="card-graph">
          <p>${totalExpenses.toLocaleString()}</p>
        </Card>
        <Card title="Ingresos Totales" type="card-graph">
          <p>${totalIncome.toLocaleString()}</p>
        </Card>
      </div>

      {/* Fila 2: Información adicional */}
      <div className="dashboard-row">
        <Card title="Sleep Time" type="card-small">
          {/* Información adicional */}
        </Card>
        <Card title="Weight Loss Plan" type="card-small">
          {/* Información adicional */}
        </Card>
        <Card title="My Activities" type="card-small">
          {/* Información adicional */}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
