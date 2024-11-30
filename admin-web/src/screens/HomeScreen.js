import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Asegúrate de tener bien configurado firebase.js
import Header from "../components/Header"; // Header con título y subtítulo
import "../styles/HomeScreen.css";
import RegistrationUsersActivity from "../components/RegistrationUsersActivity"; // Nuevo componente de actividad de registros
import UserMap from "../components/UserMap"; // Asegúrate de que la ruta sea correcta

const HomeScreen = () => {
  const [userCount, setUserCount] = useState(0); // Conteo de usuarios
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        // Cargar datos de la colección 'users' en Firebase
        const snapshot = await getDocs(collection(db, "users"));
        let count = 0;
  
        snapshot.forEach((doc) => {
          // Verificar si el documento tiene un campo `timestamp`
          const userData = doc.data();
          
          // Si el campo `timestamp` existe y es válido, se cuenta el usuario
          if (userData && userData.birthDate && userData.birthDate.seconds) {
            count += 1; // Aumenta el contador por cada documento de usuario
          }
        });
  
        setUserCount(count); // Establecer el conteo de usuarios
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener el conteo de usuarios: ", error);
        setLoading(false);
      }
    };
  
    fetchUserCount();
  }, []);
  

  if (loading) {
    return <p>Cargando datos de usuarios...</p>;
  }

  return (
    <div className="home-screen">
      <div className="main-content">
        {/* Header */}
        <Header
          title="Hola, Admin!"
          subtitle="Listo para los nuevos cambios?"
        />

        {/* Primera línea: 55% gráficos, 45% card vacía */}
        <div className="first-line">
          <div className="chart-container">
            {/* Barra superior */}
            <div className="chart-header">
              <span>Resumen de Usuarios</span>
            </div>

            {/* Gráficos */}
            
                <RegistrationUsersActivity />
        
                {/* Reemplazado FinancialActivityChart por RegistrationUsersActivity */}
              
           
          </div>

          <div className="large-card">
            <h3>Mapa de Usuarios</h3>
            <UserMap />
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
