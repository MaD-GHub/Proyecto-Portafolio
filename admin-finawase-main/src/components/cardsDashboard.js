// src/components/CardsDashboard.js
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

const CardsDashboard = () => {
  const [activeUsers, setActiveUsers] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [transactionsToday, setTransactionsToday] = useState(0);
  const [newsToday, setNewsToday] = useState(0);
  const [articlesToday, setArticlesToday] = useState(0);
  const [lecturesToday, setLecturesToday] = useState(0);
  const [questionsToday, setQuestionsToday] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        setTotalUsers(usersSnapshot.size);

        const userActivitySnapshot = await getDocs(collection(db, "userActivity"));
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activeTodayCount = userActivitySnapshot.docs.filter((doc) => {
          const timestamp = doc.data().timestamp;
          return timestamp && timestamp.toDate().getTime() >= today.getTime();
        }).length;
        setActiveUsers(activeTodayCount);

        const transactionsSnapshot = await getDocs(collection(db, "transactions"));
        let totalGastos = 0;
        let todayTransactionsCount = 0;

        transactionsSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.type === "Gasto") {
            totalGastos += parseFloat(data.amount) || 0;
          }

          const selectedDate = data.selectedDate;
          if (selectedDate) {
            const transactionDate = new Date(selectedDate);
            if (
              transactionDate.getDate() === today.getDate() &&
              transactionDate.getMonth() === today.getMonth() &&
              transactionDate.getFullYear() === today.getFullYear()
            ) {
              todayTransactionsCount++;
            }
          }
        });
        setTotalExpenses(totalGastos);
        setTransactionsToday(todayTransactionsCount);

        const collectionsToCheck = [
          { name: "news", setTodayCount: setNewsToday },
          { name: "articulos", setTodayCount: setArticlesToday },
          { name: "lecturas", setTodayCount: setLecturesToday },
          { name: "preguntas", setTodayCount: setQuestionsToday },
        ];

        for (const { name, setTodayCount } of collectionsToCheck) {
          const snapshot = await getDocs(collection(db, name));
          const todayCount = snapshot.docs.filter((doc) => {
            const publicationDate = doc.data().publicationDate;
            return publicationDate && publicationDate.toDate().getTime() >= today.getTime();
          }).length;
          setTodayCount(todayCount);
        }

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
      <div className="card bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg text-white p-6 w-full h-40 cursor-pointer" onClick={() => navigate('/usuarios')}>
        <h2 className="card-title">Usuarios Activos</h2>
        <p className="text-3xl font-bold mt-4">{activeUsers}</p>
      </div>
      <div className="card bg-gradient-to-r from-green-500 to-blue-500 shadow-lg text-white p-6 w-full h-40 cursor-pointer" onClick={() => navigate('/usuarios')}>
        <h2 className="card-title">Usuarios Totales</h2>
        <p className="text-3xl font-bold mt-4">{totalUsers}</p>
      </div>
      <div className="card bg-gradient-to-r from-red-500 to-yellow-500 shadow-lg text-white p-6 w-full h-40">
        <h2 className="card-title">Gastos Totales</h2>
        <p className="text-3xl font-bold mt-4">${totalExpenses.toLocaleString()}</p>
      </div>
      <div className="card bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg text-white p-6 w-full h-40">
        <h2 className="card-title">Transacciones Hoy</h2>
        <p className="text-3xl font-bold mt-4">{transactionsToday}</p>
      </div>
      <div className="card bg-gradient-to-r from-blue-500 to-green-500 shadow-lg text-white p-6 w-full h-40 cursor-pointer" onClick={() => navigate('/gestion-contenido')}>
        <h2 className="card-title">Noticias Publicadas Hoy</h2>
        <p className="text-3xl font-bold mt-4">{newsToday}</p>
      </div>
      <div className="card bg-gradient-to-r from-yellow-500 to-red-500 shadow-lg text-white p-6 w-full h-40 cursor-pointer" onClick={() => navigate('/gestion-contenido')}>
        <h2 className="card-title">Artículos Publicados Hoy</h2>
        <p className="text-3xl font-bold mt-4">{articlesToday}</p>
      </div>
      <div className="card bg-gradient-to-r from-purple-500 to-teal-500 shadow-lg text-white p-6 w-full h-40 cursor-pointer" onClick={() => navigate('/gestion-contenido')}>
        <h2 className="card-title">Lecturas Publicadas Hoy</h2>
        <p className="text-3xl font-bold mt-4">{lecturesToday}</p>
      </div>
      <div className="card bg-gradient-to-r from-pink-500 to-indigo-500 shadow-lg text-white p-6 w-full h-40 cursor-pointer" onClick={() => navigate('/gestion-contenido')}>
        <h2 className="card-title">Preguntas Publicadas Hoy</h2>
        <p className="text-3xl font-bold mt-4">{questionsToday}</p>
      </div>
    </div>
  );
};

export default CardsDashboard;
