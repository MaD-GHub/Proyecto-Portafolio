import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { db } from '../firebase'; 
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import withAdminAuth from "../components/withAdminAuth";
import { Line } from 'react-chartjs-2';
import '../App.css';

const AnaliticaPredictiva = () => {
  const [data, setData] = useState({ ingresos: [], egresos: [], fechas: [] });

  useEffect(() => {
    const fetchData = async () => {
      const transactionsRef = db.collection('transactions');
      const snapshot = await transactionsRef.get();
      const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const ingresos = transactions.filter(t => t.type === 'ingreso').map(t => t.amount);
      const egresos = transactions.filter(t => t.type === 'gasto').map(t => t.amount);
      const fechas = transactions.map(t => t.selectedDate);

      setData({ ingresos, egresos, fechas });
    };

    fetchData();
  }, []);

  const chartData = {
    labels: data.fechas,
    datasets: [
      {
        label: 'Ingresos',
        data: data.ingresos,
        borderColor: 'green',
        fill: false,
      },
      {
        label: 'Egresos',
        data: data.egresos,
        borderColor: 'red',
        fill: false,
      },
    ],
  };

  return (
    <div className="App">
      <Sidebar />
      <div className="main-content">
        <h1>Analítica Predictiva</h1>
        <Line data={chartData} />
      </div>
    </div>
  );
};

export default withAdminAuth(AnaliticaPredictiva);
