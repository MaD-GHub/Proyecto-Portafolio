import React, { useState, useEffect } from "react";
import Header from "../components/Header"; // Componente Header
import { FaNewspaper, FaRegClipboard, FaUserAlt, FaUsers } from "react-icons/fa"; // Importamos los iconos
import "../styles/AdminScreen.css"; // Estilos específicos para Admin

import { db } from '../firebase'; // Conexión con Firebase
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore'; // Importación de Firestore

const AdminScreen = () => {
  const [tasks, setTasks] = useState([]);  // Inicializamos el estado vacío de tareas
  const [requests, setRequests] = useState([ // Definimos el estado para solicitudes de sugerencias
    { id: 1, user: "Juan Pérez", suggestion: "Añadir opción de filtro por fecha", date: "2024-11-25" },
    { id: 2, user: "María López", suggestion: "Mejorar el diseño de la página de inicio", date: "2024-11-24" },
    { id: 3, user: "Carlos Sánchez", suggestion: "Incluir tutoriales para usuarios nuevos", date: "2024-11-23" },
    { id: 4, user: "Ana García", suggestion: "Agregar sección de preguntas frecuentes", date: "2024-11-22" },
  ]);  // Aquí estás usando un mock de datos, pero si quieres, puedes cargarlo desde Firebase también.

  const [loading, setLoading] = useState(false);  // Estado de carga mientras obtenemos las tareas

  // Función para obtener las tareas desde Firestore
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "tasks"));
      const querySnapshot = await getDocs(q);
      const tasksFromDb = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setTasks(tasksFromDb);
    } catch (error) {
      console.error("Error al obtener tareas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función para cambiar el estado de una tarea en Firestore
  const handleStatusChange = async (id, currentStatus) => {
    setLoading(true);
    try {
      const taskRef = doc(db, "tasks", id);  // Referencia al documento de la tarea
      const newStatus = 
        currentStatus === "pendiente" 
          ? "progreso" 
          : currentStatus === "progreso" 
          ? "completada" 
          : "pendiente"; // Ciclo de estados

      // Actualizar la tarea en Firestore
      await updateDoc(taskRef, {
        status: newStatus,
        lastUpdated: new Date(),
      });

      console.log(`Tarea ${id} actualizada a estado ${newStatus}`);
      fetchTasks(); // Refresca la lista de tareas después de la actualización
    } catch (error) {
      console.error("Error al actualizar tarea:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar tareas cuando el componente se monte
  useEffect(() => {
    fetchTasks(); // Traer las tareas al cargar la pantalla
  }, []);

  return (
    <div className="admin-screen">
      <Header title="Panel de Administración" subtitle="Gestiona y controla el sistema" />
      <div className="main-content">
        {/* Primera sección - Recuadros de actividad */}
        <div className="first-line">
          <div className="activity-card">
            <FaNewspaper size={30} color="#cfcfcf" />
            <h3>Noticias Subidas</h3>
            <h2>00</h2>
          </div>
          <div className="activity-card">
            <FaRegClipboard size={30} color="#cfcfcf" />
            <h3>Artículos Semanales</h3>
            <h2>00</h2>
          </div>
          <div className="activity-card">
            <FaRegClipboard size={30} color="#cfcfcf" />
            <h3>Tareas Semanales</h3>
            <h2>3 de 10</h2>
          </div>
          <div className="activity-card">
            <FaUsers size={30} color="#cfcfcf" />
            <h3>Usuarios Registrados</h3>
            <h2>150</h2>
          </div>
          <div className="activity-card">
            <FaUserAlt size={30} color="#cfcfcf" />
            <h3>Usuarios Activos</h3>
            <h2>120</h2>
          </div>
        </div>

        {/* Segunda sección - Progreso de tareas y Lista de actividades */}
        <div className="second-line-a">
          {/* Progreso de tareas */}
          <div className="progress-section-a">
            <div className="progress-card-a">
              <h3>Tareas Semanales</h3>
              <div className="progress-bar-a">
                <div className="progress-a" style={{ width: "30%" }}></div>
              </div>
              <p className="progress-text-a">3 de 10 completadas</p>
            </div>
            <div className="progress-card-a">
              <h3>Tareas Semanales</h3>
              <div className="progress-bar-a">
                <div className="progress2-a" style={{ width: "60%" }}></div>
              </div>
              <p className="progress-text-a">6 de 10 completadas</p>
            </div>
            <div className="progress-card-a">
              <h3>Progreso de Solicitudes</h3>
              <div className="progress-bar-a">
                <div className="progress3-a" style={{ width: "39%" }}></div>
              </div>
              <p className="progress-text-a">5 de 12 completadas</p>
            </div>
          </div>

          {/* Lista de actividades */}
          <div className="task-list">
            <h3>Lista de Tareas</h3>
            <ul>
              {tasks.map((task) => (
                <li key={task.id} className="task-item">
                  <div className="task-item-text">
                    <span>{task.text}</span>
                  </div>
                  {/* Botón para cambiar estado */}
                  <div
                    className={`status-button ${task.status}`}
                    onClick={() => handleStatusChange(task.id, task.status)} // Pasamos el id y el estado actual
                  >
                    {task.status === "pendiente" && "Pendiente"}
                    {task.status === "progreso" && "Progreso"}
                    {task.status === "completada" && "Completada"}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Solicitudes de sugerencias */}
          <div className="task-list2">
            <h3>Solicitudes de sugerencias</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Sugerencia</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td>{request.user}</td>
                    <td>{request.suggestion}</td>
                    <td>{request.date}</td>
                    <td>
                      <button className="action-btn">Responder</button>
                      <button className="action-btn">Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminScreen;
