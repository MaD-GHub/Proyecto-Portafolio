import React, { useState } from "react";
import { db } from "../firebase";
import {
  doc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import {
  FaEdit,
  FaTrash,
  FaRegBell,
  FaToggleOff,
  FaToggleOn,
  FaHistory,
} from "react-icons/fa";
import Modal from "react-modal";
import "../styles/UsersComponent.css"; // Estilos para el componente

// Componente para manejar las acciones de los usuarios
const UsersComponent = ({ user, onUserUpdated }) => {
  const [isActive, setIsActive] = useState(user.activo);
  const [showModal, setShowModal] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationContent, setNotificationContent] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [userActivity, setUserActivity] = useState([]);

  // Activar/Desactivar cuenta
  const handleToggleActive = async () => {
    try {
      const userRef = doc(db, "users", user.id);
      await updateDoc(userRef, {
        activo: !isActive,
      });
      setIsActive(!isActive);
      onUserUpdated();
    } catch (error) {
      console.error("Error al actualizar el estado de la cuenta:", error);
    }
  };

  // Eliminar usuario
  const handleDeleteUser = async () => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que quieres eliminar este usuario?"
    );
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "users", user.id));
        onUserUpdated(); // Callback para actualizar el estado en el componente principal
      } catch (error) {
        console.error("Error al eliminar el usuario:", error);
      }
    }
  };

  // Enviar notificación
  const handleSendNotification = async () => {
    try {
      const notificationData = {
        userId: user.id,
        senderId: "adminId", // Aquí deberías poner el ID del administrador o el usuario que envía la notificación
        title: notificationTitle,
        content: notificationContent,
        timestamp: new Date().toISOString(),
      };

      await addDoc(collection(db, "notifications"), notificationData);
      setShowModal(false); // Cerrar el modal después de enviar la notificación
      alert("Notificación enviada correctamente.");
    } catch (error) {
      console.error("Error al enviar la notificación:", error);
    }
  };

  // Mostrar historial de actividad
  const handleShowHistory = async () => {
    try {
      const activityRef = collection(db, "userActivity");
      const q = query(
        activityRef,
        where("userId", "==", user.id),
        where("action", "==", "app_open")
      );
      const querySnapshot = await getDocs(q);
  
      // Mapeamos los documentos de la consulta
      const activities = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          timestamp: data.timestamp.toDate(), // Convertir el timestamp a formato Date
          description: data.details.description, // Acceder a la descripción en 'details'
        };
      });
  
      setUserActivity(activities); // Actualizar el estado con las actividades
      setShowHistory(true); // Mostrar el modal con el historial
    } catch (error) {
      console.error("Error al obtener el historial de actividades:", error);
    }
  };
  

  return (
    <div className="user-actions">
      {/* Botón para activar/desactivar */}
      <button className="toggle-button" onClick={handleToggleActive}>
        {isActive ? <FaToggleOff /> : <FaToggleOn />}
      </button>

      {/* Botón para eliminar usuario */}
      <button className="delete-button" onClick={handleDeleteUser}>
        <FaTrash />
      </button>

      {/* Botón para abrir el modal de notificación */}
      <button className="notify-button" onClick={() => setShowModal(true)}>
        <FaRegBell />
      </button>

      {/* Botón para ver historial de actividades */}
      <button className="history-button" onClick={handleShowHistory}>
        <FaHistory />
      </button>

      {/* Modal para enviar una notificación */}
      <Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        ariaHideApp={false}
      >
        <h2>Enviar Notificación</h2>
        <label htmlFor="notification-title">Título:</label>
        <input
          type="text"
          id="notification-title"
          value={notificationTitle}
          onChange={(e) => setNotificationTitle(e.target.value)}
        />
        <label htmlFor="notification-content">Contenido:</label>
        <textarea
          id="notification-content"
          value={notificationContent}
          onChange={(e) => setNotificationContent(e.target.value)}
        />
        <button onClick={handleSendNotification} className="success-btn">
          Enviar
        </button>
        <button onClick={() => setShowModal(false)} className="cancel-btn">
          Cancelar
        </button>
      </Modal>

      {/* Modal para ver historial de actividad */}
      {showHistory && (
        <Modal
          isOpen={showHistory}
          onRequestClose={() => setShowHistory(false)}
          ariaHideApp={false}
        >
          <div className="activity-history">
            <h3>Historial de Actividad</h3>
            <ul>
              {userActivity.map((activity, index) => (
                <li key={index}>
                  <p>
                    <strong>
                      {new Date(activity.timestamp).toLocaleString()}
                    </strong>
                  </p>
                  <p>{activity.description}</p>
                </li>
              ))}
            </ul>
            <button onClick={() => setShowHistory(false)}>Cerrar</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UsersComponent;