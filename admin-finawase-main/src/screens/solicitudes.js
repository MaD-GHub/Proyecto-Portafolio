import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { FaStar, FaCheck, FaTimes, FaInfoCircle } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import withAdminAuth from "../components/withAdminAuth";


const Solicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const cargarSolicitudes = async () => {
    setLoading(true);
    try {
      const solicitudesCollection = collection(db, 'suggestions');
      const solicitudesSnapshot = await getDocs(solicitudesCollection);
      const solicitudesList = solicitudesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      solicitudesList.sort((a, b) => {
        if (a.isHighlighted && !b.isHighlighted) return -1;
        if (!a.isHighlighted && b.isHighlighted) return 1;
        if (a.isRead && !b.isRead) return 1;
        if (!a.isRead && b.isRead) return -1;
        return 0;
      });
      setSolicitudes(solicitudesList);
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const toggleDestacarSolicitud = async (id, isCurrentlyHighlighted) => {
    try {
      const solicitudRef = doc(db, 'suggestions', id);
      await updateDoc(solicitudRef, { isHighlighted: !isCurrentlyHighlighted, isRead: false });
      cargarSolicitudes();
    } catch (error) {
      console.error("Error al cambiar el estado de destacado:", error);
    }
  };

  const marcarComoLeido = async (id) => {
    try {
      const solicitudRef = doc(db, 'suggestions', id);
      await updateDoc(solicitudRef, { isRead: true, isHighlighted: false });
      cargarSolicitudes();
    } catch (error) {
      console.error("Error al marcar como leído:", error);
    }
  };

  const rechazarSolicitud = async (id) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas rechazar esta solicitud?");
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, 'suggestions', id));
        cargarSolicitudes();
        alert("Solicitud rechazada correctamente.");
      } catch (error) {
        console.error("Error al rechazar la solicitud:", error);
      }
    }
  };

  const handleOpenModal = (solicitud) => {
    setSelectedSolicitud(solicitud);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedSolicitud(null);
    setShowModal(false);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="main-content">
        <h1 className="text-3xl font-bold text-center dark:text-gray-200 mb-6">
          Bandeja de Entrada de Solicitudes
        </h1>

        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400">Cargando solicitudes...</p>
        ) : (
          <div className="card bg-base-100 shadow-lg mt-6 p-6">
            <table className="table table-zebra w-full min-w-full ">
              <thead>
                <tr className="bg-primary text-white">
                  <th className="text-center">Destacado</th>
                  <th className="text-center">ID</th>
                  <th className="text-center">Usuario</th>
                  <th className="text-center">Contenido</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center p-6">
                      No hay solicitudes disponibles.
                    </td>
                  </tr>
                ) : (
                  solicitudes.map((solicitud) => (
                    <tr key={solicitud.id} className="hover:bg-base-200 dark:hover:bg-base-300">
                      <td className="text-center">
                        <FaStar
                          className={`cursor-pointer ${solicitud.isHighlighted ? "text-yellow-500" : "text-gray-400"}`}
                          title="Destacar"
                          onClick={() => toggleDestacarSolicitud(solicitud.id, solicitud.isHighlighted)}
                        />
                      </td>
                      <td className="text-center">
                        <FaInfoCircle
                          className="text-blue-500 cursor-pointer"
                          title="Ver ID completo"
                          onClick={() => handleOpenModal(solicitud)}
                        />
                      </td>
                      <td className="text-center">{solicitud.userName || 'Sin usuario'}</td>
                      <td className="text-center max-w-xs truncate">{solicitud.suggestion || 'Sin contenido'}</td>
                      <td className="flex justify-center space-x-2">
                        <button
                          className="text-green-500 btn-success"
                          title="Marcar como leído"
                          onClick={() => marcarComoLeido(solicitud.id)}
                        >
                          <FaCheck />
                        </button>
                        <button
                          className="text-red-500 btn-error"
                          title="Rechazar"
                          onClick={() => rechazarSolicitud(solicitud.id)}
                        >
                          <FaTimes />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal de detalles */}
        {showModal && selectedSolicitud && (
          <div className="modal modal-open">
            <div className="modal-box modal-content bg-base-100 dark:bg-base-300">
              <h2 className="text-2xl font-semibold mb-4">Detalles de la Solicitud</h2>
              <p><strong>ID:</strong> {selectedSolicitud.id}</p>
              <p><strong>Usuario:</strong> {selectedSolicitud.userName}</p>
              <p><strong>UID de Usuario:</strong> {selectedSolicitud.userId}</p>
              <p><strong>Contenido:</strong> {selectedSolicitud.suggestion}</p>
              <p><strong>Fecha de Creación:</strong> {new Date(selectedSolicitud.createdAt.seconds * 1000).toLocaleString()}</p>
              <div className="modal-action">
                <button
                  className="btn btn-primary"
                  onClick={handleCloseModal}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default withAdminAuth(Solicitudes);
