import React, { useState } from "react";
import Header from "../components/Header"; // Componente Header
import { FaNewspaper, FaRegClipboard, FaUserAlt, FaUsers } from "react-icons/fa"; // Importamos los iconos
import "../styles/AdminScreen.css"; // Estilos específicos para Admin

const AdminScreen = () => {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Revisar tareas semanales", status: "pendiente" },
    { id: 2, text: "Actualizar artículos", status: "pendiente" },
    { id: 3, text: "Revisar estadísticas de usuarios", status: "pendiente" },
    { id: 4, text: "Subir nuevas noticias", status: "pendiente" },
  ]);
  const [requests, setRequests] = useState([
    { id: 1, user: "Juan Pérez", suggestion: "Añadir opción de filtro por fecha", date: "2024-11-25" },
    { id: 2, user: "María López", suggestion: "Mejorar el diseño de la página de inicio", date: "2024-11-24" },
    { id: 3, user: "Carlos Sánchez", suggestion: "Incluir tutoriales para usuarios nuevos", date: "2024-11-23" },
    { id: 4, user: "Ana García", suggestion: "Agregar sección de preguntas frecuentes", date: "2024-11-22" },
  ]);

  // Función consolidada para cambiar el estado de la tarea
  const handleStatusChange = (id) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              status:
                task.status === "pendiente"
                  ? "progreso"
                  : task.status === "progreso"
                  ? "completada"
                  : "pendiente", // Vuelve a "pendiente" si está completada
            }
          : task
      )
    );
  };

  return (
    <div className="admin-screen">
      <Header title="Panel de Administración" subtitle="Gestiona y controla el sistema" />
      <div className="main-content">
        {/* Primera sección - Recueadros de actividad */}
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
        <div className="second-line">
          {/* Progreso de tareas */}
          <div className="progress-section">
            <div className="progress-card">
              <h3>Tareas Semanales</h3>
              <div className="progress-bar">
                <div className="progress" style={{ width: "30%" }}></div>
              </div>
              <p className="progress-text">3 de 10 completadas</p>
            </div>
            <div className="progress-card">
              <h3>Tareas Semanales</h3>
              <div className="progress-bar">
                <div className="progress2" style={{ width: "60%" }}></div>
              </div>
              <p className="progress-text">6 de 10 completadas</p>
            </div>
            <div className="progress-card">
              <h3>Progreso de Solicitudes</h3>
              <div className="progress-bar">
                <div className="progress3" style={{ width: "39%" }}></div>
              </div>
              <p className="progress-text">5 de 12 completadas</p>
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
                    onClick={() => handleStatusChange(task.id)}
                  >
                    {task.status === "pendiente" && "Pendiente"}
                    {task.status === "progreso" && "Progreso"}
                    {task.status === "completada" && "Completada"}
                  </div>
                </li>
              ))}
            </ul>
          </div>

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
