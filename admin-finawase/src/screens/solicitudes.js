// src/screens/solicitudes.js
import React, { useEffect, useState } from 'react';
import { db } from '../firebase'; 
import { collection, getDocs, addDoc } from 'firebase/firestore';
import Sidebar from '../components/Sidebar'; 
import withAdminAuth from "../components/withAdminAuth";

const Solicitudes = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [respuesta, setRespuesta] = useState(""); // Estado donde se guardara el mensaje de respuesta para las solicitudes
  const [selectedSolicitud, setSelectedSolicitud] = useState(null); // Seguimiento de la solicitud seleccionada para respuesta

  // Funcion para cargar las solicitudes desde Firebase
  const cargarSolicitudes = async () => {
    try {
      const solicitudesCollection = collection(db, 'solicitudes'); // Asi se debe llamar la coleccion: 'solicitudes'
      const solicitudesSnapshot = await getDocs(solicitudesCollection);
      const solicitudesList = solicitudesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSolicitudes(solicitudesList);
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
    }
  };

  // funcion para enviar la respuesta de vuelta
  const responderSolicitud = async () => {
    if (!selectedSolicitud || !respuesta) return;

    try {
      // documento donde se incluye la respuesta
      await addDoc(collection(db, 'respuestas'), {
        solicitudId: selectedSolicitud.id,
        respuesta: respuesta,
        fechaRespuesta: new Date(),
      });
      alert('Respuesta enviada exitosamente');
      setRespuesta("");
      setSelectedSolicitud(null);
    } catch (error) {
      console.error('Error al responder solicitud:', error);
      alert('Hubo un error al intentar enviar la respuesta.');
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="main-content responsive-container">
        <h1 className="text-3xl font-bold text-gray-700 mb-6">Bandeja de Entrada de Solicitudes</h1>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead>
              <tr className="bg-purple-600 text-white">
                <th className="px-6 py-3 text-left text-sm font-semibold">ID Solicitud</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Contenido</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center">Cargando solicitudes...</td>
                </tr>
              ) : (
                solicitudes.map((solicitud) => (
                  <tr key={solicitud.id} className="border-b">
                    <td className="px-6 py-4">{solicitud.id}</td>
                    <td className="px-6 py-4">{solicitud.contenido || 'Sin contenido'}</td>
                    <td className="px-6 py-4 flex space-x-2">
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                        onClick={() => setSelectedSolicitud(solicitud)}
                      >
                        Responder
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal para responder la solicitud */}
        {selectedSolicitud && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-4">Responder a Solicitud</h2>
              <p className="mb-4"><strong>ID:</strong> {selectedSolicitud.id}</p>
              <p className="mb-4"><strong>Contenido:</strong> {selectedSolicitud.contenido}</p>
              <textarea
                className="w-full mb-4 px-3 py-2 border border-gray-300 rounded"
                placeholder="Escribe tu respuesta aquí"
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
              />
              <div className="flex space-x-4">
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  onClick={responderSolicitud}
                >
                  Enviar Respuesta
                </button>
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  onClick={() => setSelectedSolicitud(null)}
                >
                  Cancelar
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
