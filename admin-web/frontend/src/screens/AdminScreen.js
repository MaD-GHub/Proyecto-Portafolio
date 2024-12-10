import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { FaNewspaper, FaRegClipboard, FaUserAlt, FaUsers } from "react-icons/fa";
import { GoArrowRight } from "react-icons/go";
import "../styles/AdminScreen.css";
import { db } from '../firebase';
import { collection, query, getDocs, doc, updateDoc, where } from 'firebase/firestore';
import { useNavigate } from "react-router-dom"; // Importar useNavigate para navegación

const AdminScreen = () => {
  const navigate = useNavigate(); // Inicializar el hook de navegación
  const [newsCount, setNewsCount] = useState(0);
  const [articlesCount, setArticlesCount] = useState(0);
  const [registeredUsersCount, setRegisteredUsersCount] = useState(0);
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [requests, setRequests] = useState([]);
  const [totalRequestsCount, setTotalRequestsCount] = useState(0);
  const [acceptedRequestsCount, setAcceptedRequestsCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCounts();
    fetchTasks();
    fetchRequests();
  }, []);

  const fetchCounts = async () => {
    setLoading(true);
    try {
      const newsSnapshot = await getDocs(collection(db, "news"));
      setNewsCount(newsSnapshot.size);

      const articlesSnapshot = await getDocs(collection(db, "articles"));
      setArticlesCount(articlesSnapshot.size);

      const usersSnapshot = await getDocs(collection(db, "users"));
      setRegisteredUsersCount(usersSnapshot.size);

      const activeUsersSnapshot = await getDocs(query(collection(db, "users"), where("activo", "==", true)));
      setActiveUsersCount(activeUsersSnapshot.size);

      const suggestionsSnapshot = await getDocs(collection(db, "suggestions"));
      setTotalRequestsCount(suggestionsSnapshot.size);

      const acceptedSuggestionsSnapshot = await getDocs(query(collection(db, "suggestions"), where("status", "==", "aceptada")));
      setAcceptedRequestsCount(acceptedSuggestionsSnapshot.size);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "suggestions"));
      const querySnapshot = await getDocs(q);
      const requestsFromDb = querySnapshot.docs.map(doc => ({
        id: doc.id,
        user: doc.data().userName,
        suggestion: doc.data().suggestion,
        date: doc.data().createdAt.toDate().toLocaleDateString(),
        status: doc.data().status
      }));
      setRequests(requestsFromDb);
    } catch (error) {
      console.error("Error al obtener solicitudes de sugerencias:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestStatusChange = async (id, newStatus) => {
    setLoading(true);
    try {
      const requestRef = doc(db, "suggestions", id);
      await updateDoc(requestRef, { status: newStatus });
      console.log(`Solicitud ${id} actualizada a estado ${newStatus}`);
      fetchRequests(); // Refresca la lista de solicitudes después de la actualización
      fetchCounts(); // Refresca los conteos después de la actualización
    } catch (error) {
      console.error("Error al actualizar solicitud:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-screen">
      <Header title="Panel de Administración" subtitle="Gestiona y controla el sistema" />
      <div className="main-content">
        <div className="first-line">
          <div className="activity-card">
            <FaNewspaper size={30} color="#cfcfcf" />
            <h3>Noticias Subidas</h3>
            <h2>{newsCount}</h2>
          </div>
          <div className="activity-card">
            <FaRegClipboard size={30} color="#cfcfcf" />
            <h3>Artículos Semanales</h3>
            <h2>{articlesCount}</h2>
          </div>
          <div className="activity-card">
            <FaUsers size={30} color="#cfcfcf" />
            <h3>Usuarios Registrados</h3>
            <h2>{registeredUsersCount}</h2>
          </div>
          <div
            className="activity-card"
            onClick={() => navigate("/usuarios")} // Redirección a la nueva pantalla
            style={{ cursor: "pointer" }} // Mostrar un cursor de puntero
          >
            <FaUserAlt size={30} color="#cfcfcf" />
            <h3>Usuarios Activos</h3>
            <h2>{activeUsersCount}</h2>
          </div>
          <div
            className="activity-card"
            onClick={() => navigate("/contenido")} // Redirección a la nueva pantalla
            style={{ cursor: "pointer" }} // Mostrar un cursor de puntero
          >
            <GoArrowRight size={30} color="#cfcfcf" />
            <h3>Ir a gestion de contenido</h3>
          </div>
        </div>

        {/* Segunda sección */}
        <div className="second-line-a">
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
                <div
                  className="progress3-a"
                  style={{ width: `${(acceptedRequestsCount / totalRequestsCount) * 100}%` }}
                ></div>
              </div>
              <p className="progress-text-a">
                {acceptedRequestsCount} de {totalRequestsCount} aceptadas
              </p>
            </div>
          </div>

          <div className="task-list">
            <h3>Lista de Tareas</h3>
            <ul>
              {tasks.map((task) => (
                <li key={task.id} className="task-item">
                  <div className="task-item-text">
                    <span>{task.text}</span>
                  </div>
                  <div
                    className={`status-button ${task.status}`}
                    onClick={() => handleRequestStatusChange(task.id, task.status)}
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
                      <button 
                        className="action-btn"
                        onClick={() => handleRequestStatusChange(request.id, "aceptada")}
                      >
                        Aceptar
                      </button>
                      <button 
                        className="action-btn"
                        onClick={() => handleRequestStatusChange(request.id, "rechazada")}
                      >
                        Rechazar
                      </button>
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
