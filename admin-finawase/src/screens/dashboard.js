import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase"; // Asegúrate de tener estas importaciones para Firebase
import Sidebar from "../components/Sidebar";
import "../index.css"; // Asegúrate de tener los estilos adecuados
import { onAuthStateChanged } from "firebase/auth";
import withAdminAuth from "../components/withAdminAuth";

const Dashboard = () => {
  const [activeUsers, setActiveUsers] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [transactionsToday, setTransactionsToday] = useState(0);  
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // Datos del usuario autenticado
  const [loading, setLoading] = useState(true); // Estado para manejar el proceso de autenticación
  const navigate = useNavigate();
  

  // Escucha los cambios de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          console.log("Usuario autenticado:", currentUser.uid);

          // Obtener el documento del usuario autenticado
          const userDocRef = doc(db, "users", currentUser.uid); // Obtener directamente el documento usando el UID
          const userDocSnapshot = await getDoc(userDocRef);

          if (userDocSnapshot.exists()) {
            const userData = userDocSnapshot.data();
            console.log("Datos del usuario en Firestore:", userData); // Imprimir datos del usuario para depuración

            // Guardar los datos del usuario en el estado
            setUserData(userData);

            // Verificar si el usuario tiene el rol de 'admin'
            if (userData.role === "admin") {
              console.log("El usuario es admin.");
              setUser(currentUser); // Usuario autenticado y tiene rol de admin
            } else {
              console.log("El usuario no es admin, redirigiendo al login...");
              navigate("/login"); // Redirige si no es administrador
            }
          } else {
            console.log("No se encontró el documento del usuario, redirigiendo al login...");
            navigate("/login"); // Redirige si no se encuentra el documento del usuario
          }
        } catch (error) {
          console.error("Error al verificar el rol de usuario:", error);
          navigate("/login"); // Redirige en caso de error
        }
      } else {
        console.log("No hay usuario autenticado, redirigiendo al login...");
        navigate("/login"); // Redirige si no está autenticado
      }
      setLoading(false); // Detener la carga
    });

    return () => {
      unsubscribe(); // Limpiar el listener cuando se desmonta el componente
    };
  }, [navigate]);

  // Traer datos de Firestore al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      if (!loading && user) {
        try {
          // Contar el número de usuarios activos
          const usersSnapshot = await getDocs(collection(db, "users"));
          const activeUsersCount = usersSnapshot.docs.filter(doc => doc.data().status === "active").length;
          setActiveUsers(activeUsersCount);

          // Contar el número total de usuarios
          setTotalUsers(usersSnapshot.size);

          // Calcular los gastos totales
          const expensesSnapshot = await getDocs(collection(db, "transactions"));
          let totalGastos = 0;
          expensesSnapshot.forEach((doc) => {
            if (doc.data().type === "Gasto") {
              totalGastos += doc.data().amount;
            }
          });
          setTotalExpenses(totalGastos);

          // Contar las transacciones del día de hoy
          const today = new Date();
          const todayStart = new Date(today.setHours(0, 0, 0, 0));
          const todayEnd = new Date(today.setHours(23, 59, 59, 999));
          const transactionsSnapshot = await getDocs(collection(db, "transactions"));
          const todayTransactionsCount = transactionsSnapshot.docs.filter(
            (doc) => {
              const transactionDate = doc.data().selectedDate.toDate();
              return transactionDate >= todayStart && transactionDate <= todayEnd;
            }
          ).length;
          setTransactionsToday(todayTransactionsCount);
        } catch (error) {
          console.error("Error al obtener los datos de Firebase:", error);
        }
      }
    };

    fetchData();
  }, [loading, user]);

  if (loading) {
    return <p>Cargando...</p>; // Mostrar una pantalla de carga mientras se verifica la autenticación
  }

  return (
    <div className="dashboard-container flex flex-col lg:flex-row">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="main-content p-6 w-full">
        {/* Panel de información del usuario */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-2xl font-semibold mb-4">Información del Usuario</h2>
          {userData && (
            <div className="text-gray-700">
              <p><strong>Nombre:</strong> {userData.firstName} {userData.lastName}</p>
              <p><strong>Email:</strong> {userData.email}</p>
              <p><strong>Rol:</strong> {userData.role}</p>
            </div>
          )}
        </div>

        {/* Paneles de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-lg shadow-lg text-white">
            <h2 className="text-xl font-semibold">Usuarios Activos</h2>
            <p className="text-4xl font-bold mt-4">{activeUsers}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 rounded-lg shadow-lg text-white">
            <h2 className="text-xl font-semibold">Usuarios Totales</h2>
            <p className="text-4xl font-bold mt-4">{totalUsers}</p>
          </div>
          <div className="bg-gradient-to-r from-red-500 to-yellow-500 p-6 rounded-lg shadow-lg text-white">
            <h2 className="text-xl font-semibold">Gastos Totales</h2>
            <p className="text-4xl font-bold mt-4">${totalExpenses.toLocaleString()}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-lg shadow-lg text-white">
            <h2 className="text-xl font-semibold">Transacciones Hoy</h2>
            <p className="text-4xl font-bold mt-4">{transactionsToday}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAdminAuth(Dashboard);
