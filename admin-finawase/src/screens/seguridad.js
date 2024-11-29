import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { updatePassword, sendPasswordResetEmail } from 'firebase/auth';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import Sidebar from '../components/Sidebar';
import withAdminAuth from "../components/withAdminAuth";

const Seguridad = () => {
  const [newPassword, setNewPassword] = useState('');
  const [activityLogs, setActivityLogs] = useState([]);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false); // Estado para 2FA

  // Función para cambiar la contraseña
  const handleChangePassword = async () => {
    try {
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
        alert('Contraseña actualizada con éxito');
      } else {
        alert('No se encontró el usuario actual.');
      }
    } catch (error) {
      console.error('Error al cambiar la contraseña:', error);
      alert('Hubo un problema al cambiar la contraseña');
    }
  };

  // Enviar correo de restablecimiento de contraseña
  const handleResetPassword = async () => {
    if (auth.currentUser) {
      try {
        await sendPasswordResetEmail(auth, auth.currentUser.email);
        alert('Correo de restablecimiento enviado');
      } catch (error) {
        console.error('Error al enviar correo de restablecimiento:', error);
      }
    }
  };

  // Registrar actividad
  const fetchActivityLogs = async () => {
    try {
      const logsSnapshot = await getDocs(collection(db, 'activityLogs'));
      const logsList = logsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setActivityLogs(logsList);
    } catch (error) {
      console.error('Error al obtener registros de actividad:', error);
    }
  };

  // Función para habilitar/deshabilitar 2FA
  const toggleTwoFactorAuth = () => {
    setTwoFactorAuth(!twoFactorAuth);
    // Aquí podrías agregar lógica adicional para configurar 2FA en Firebase si es necesario
  };

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="main-content p-6">
        <h1 className="text-3xl font-bold text-gray-700 mb-6">Configuración de Seguridad</h1>

        {/* Sección para Cambiar Contraseña */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Cambiar Contraseña</h2>
          <input
            type="password"
            placeholder="Nueva Contraseña"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-3 mb-4 border rounded-md"
          />
          <button onClick={handleChangePassword} className="bg-purple-600 text-white px-4 py-2 rounded-lg">
            Cambiar Contraseña
          </button>
          <button onClick={handleResetPassword} className="bg-blue-600 text-white px-4 py-2 rounded-lg ml-4">
            Enviar Correo de Restablecimiento
          </button>
        </div>

        {/* Sección para Habilitar/Deshabilitar 2FA */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-4">Verificación en Dos Pasos (2FA)</h2>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={twoFactorAuth}
              onChange={toggleTwoFactorAuth}
              className="mr-2"
            />
            Habilitar Verificación en Dos Pasos
          </label>
        </div>

        {/* Sección de Registros de Actividad */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Registros de Actividad</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-md">
              <thead>
                <tr className="bg-purple-600 text-white">
                  <th className="px-6 py-3 text-left text-sm font-semibold">Fecha</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actividad</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Usuario</th>
                </tr>
              </thead>
              <tbody>
                {activityLogs.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center">No hay registros de actividad</td>
                  </tr>
                ) : (
                  activityLogs.map((log) => (
                    <tr key={log.id} className="border-b">
                      <td className="px-6 py-4">{new Date(log.date.seconds * 1000).toLocaleDateString()}</td>
                      <td className="px-6 py-4">{log.activity}</td>
                      <td className="px-6 py-4">{log.userId}</td>
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

export default withAdminAuth(Seguridad);
