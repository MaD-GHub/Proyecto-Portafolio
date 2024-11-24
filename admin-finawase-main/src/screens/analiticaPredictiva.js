import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { db } from '../firebase';
import withAdminAuth from "../components/withAdminAuth";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { collection, getDocs } from 'firebase/firestore';
import moment from 'moment';
import '../App.css';

const AnaliticaPredictiva = () => {
  const [transactions, setTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [monthFilter, setMonthFilter] = useState(""); // Filtro de mes
  const [genderFilter, setGenderFilter] = useState(""); // Filtro de género

  useEffect(() => {
    const fetchData = async () => {
      // Obtener transacciones
      const transactionsRef = collection(db, 'transactions');
      const snapshotTransactions = await getDocs(transactionsRef);
      const transactionsData = snapshotTransactions.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Obtener usuarios
      const usersRef = collection(db, 'users');
      const snapshotUsers = await getDocs(usersRef);
      const usersData = snapshotUsers.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTransactions(transactionsData);
      setUsers(usersData);
    };

    fetchData();
  }, []);

  // Sin filtros
  const originalData = transactions.reduce((acc, t) => {
    const month = moment(t.selectedDate).month() + 1;
    if (!acc[month]) {
      acc[month] = { month, ingresos: 0, egresos: 0 };
    }
    if (t.type === "Ingreso") {
      acc[month].ingresos += t.amount;
    } else if (t.type === "Gasto") {
      acc[month].egresos += t.amount;
    }
    return acc;
  }, {});

  const originalDataArray = Object.values(originalData);

  // Con filtros
  const filteredTransactions = transactions.filter(t => {
    const user = users.find(u => u.userId === t.userId); // Comparar userId entre transactions y users

    const monthMatch = monthFilter
      ? moment(t.selectedDate).month() + 1 === parseInt(monthFilter)
      : true;

    const genderMatch = genderFilter ? user?.gender === genderFilter : true;

    return t.type === "Gasto" && monthMatch && genderMatch;
  });

  const categoryData = filteredTransactions.reduce((acc, t) => {
    const category = t.category || "Sin Categoría"; // Categoría de la transacción
    if (!acc[category]) {
      acc[category] = { category, gastos: 0 };
    }
    acc[category].gastos += t.amount;
    return acc;
  }, {});

  const categoryDataArray = Object.values(categoryData);

  return (
    <div className="analytics-screen">
      <Sidebar />
      <div className="content">
      <h1 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "32px", fontWeight: "bold" }}>
      Análisis Financiero
    </h1>

        {/* Gráfico original */}
        <div className="chart-container">
          <h2>Ingresos y Egresos por Mes</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={originalDataArray}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ingresos" fill="#82ca9d" name="Ingresos" />
              <Bar dataKey="egresos" fill="#ff0000" name="Egresos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <hr style={{ border: "1px solid #ddd", margin: "50px 0" }} />

        {/* Filtros */}
        <div className="filters">
        <h2>Egresos por Categoría</h2>
        <select onChange={e => setMonthFilter(e.target.value)}>
            <option value="">Todos los meses</option>
            {[...Array(12)].map((_, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1}
              </option>
            ))}
          </select>

          <select onChange={e => setGenderFilter(e.target.value)}>
            <option value="">Ambos géneros</option>
            <option value="masculino">Masculino</option>
            <option value="femenino">Femenino</option>
          </select>
        </div>

        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryDataArray}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="gastos" fill="#ff0000" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default withAdminAuth(AnaliticaPredictiva);
