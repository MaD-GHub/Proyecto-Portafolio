// src/screens/Dashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import Sidebar from "../components/Sidebar";
import LoadingScreen from "../components/loading";
import { onAuthStateChanged } from "firebase/auth";
import withAdminAuth from "../components/withAdminAuth";
import "leaflet/dist/leaflet.css";
import UserMap from "../components/UserMap";
import CardsDashboard from "../components/cardsDashboard"; // Importa el componente de CardsDashboard

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnapshot = await getDoc(userDocRef);

          if (userDocSnapshot.exists()) {
            const userData = userDocSnapshot.data();
            setUserData(userData);

            if (userData.role === "admin") {
              setUser(currentUser);
            } else {
              navigate("/login");
            }
          } else {
            navigate("/login");
          }
        } catch (error) {
          console.error("Error al verificar el rol de usuario:", error);
          navigate("/login");
        }
      } else {
        navigate("/login");
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    const fetchRecentTransactions = async () => {
      if (!loading && user) {
        try {
          const expensesSnapshot = await getDocs(
            collection(db, "transactions")
          );
          const recentTrans = [];

          expensesSnapshot.forEach((doc) => {
            const data = doc.data();
            recentTrans.push({ ...data, id: doc.id });
          });

          setRecentTransactions(recentTrans.slice(-5).reverse());
        } catch (error) {
          console.error(
            "Error al obtener las transacciones recientes de Firebase:",
            error
          );
        }
      }
    };

    fetchRecentTransactions();
  }, [loading, user]);

  if (loading) {
    return <LoadingScreen isLoading={loading} />;
  }

  return (
    <div className="dashboard-container flex flex-col lg:flex-row pt-5">
      <Sidebar />
      <div className="main-content p-6">
        <div className="card bg-base-100 shadow-xl mb-6 p-6">
          <h2 className="card-title">Información del Usuario</h2>
          {userData && (
            <div className="text-base-content">
              <p>
                <strong>Nombre:</strong> {userData.firstName}{" "}
                {userData.lastName}
              </p>
              <p>
                <strong>Email:</strong> {userData.email}
              </p>
              <p>
                <strong>Rol:</strong> {userData.role}
              </p>
            </div>
          )}
        </div>

        {/* Contenedor para los "cards" de estadísticas y el mapa */}
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="card bg-base-100 shadow-xl p-6">
            <CardsDashboard />
          </div>
          <div className="lg:w-1/2 h-96 lg:h-auto">
            <div className="card bg-base-100 shadow-xl p-6">
              <UserMap />
            </div>
          </div>
        </div>

        {/* Últimas transacciones */}
        <div className="card bg-base-100 shadow-lg mt-6 p-6">
          <h2 className="card-title mb-4">Últimas Transacciones</h2>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Tipo</th>
                  <th>Monto</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center">
                      No hay transacciones recientes
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{transaction.category || "Desconocido"}</td>
                      <td>{transaction.type}</td>
                      <td>${transaction.amount.toLocaleString()}</td>
                      <td>
                        {new Date(
                          transaction.selectedDate
                        ).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAdminAuth(Dashboard);
