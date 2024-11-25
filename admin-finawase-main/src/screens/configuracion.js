import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase'; 
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import Sidebar from '../components/Sidebar';
import withAdminAuth from "../components/withAdminAuth";

const Configuracion = () => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    birthDate: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser; // Obtener el usuario autenticado
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const saveChanges = async () => {
    const user = auth.currentUser;
    if (user) {
      await updateDoc(doc(db, 'users', user.uid), userData);
      setIsEditing(false);
      alert('Datos actualizados exitosamente');
    }
  };

  const changePassword = async () => {
    const user = auth.currentUser;
    if (user) {
      const { currentPassword, newPassword, confirmNewPassword } = passwordData;
      if (newPassword !== confirmNewPassword) {
        alert('La nueva contraseña y la confirmación no coinciden');
        return;
      }
      try {
        const credential = EmailAuthProvider.credential(
          user.email,
          currentPassword
        );
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        alert('Contraseña actualizada exitosamente');
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      } catch (error) {
        alert('Error al cambiar la contraseña: ' + error.message);
      }
    }
  };

  return (
    <div className="dashboard-container flex flex-col lg:flex-row">
      <Sidebar />

      <div className="main-content p-6 w-full">
        <h1 className="text-3xl font-bold text-gray-700 mb-6 text-center">
          Configuración de su Perfil
        </h1>
        <div className="card bg-base-100 shadow-lg p-6">
          <div className="space-y-4">
            <div>
              <label className="block">Nombre</label>
              <input
                type="text"
                name="firstName"
                value={userData.firstName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="block">Apellido</label>
              <input
                type="text"
                name="lastName"
                value={userData.lastName}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="block">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="block">Género</label>
              <select
                name="gender"
                value={userData.gender}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="input input-bordered w-full"
              >
                <option value="">Seleccione</option>
                <option value="femenino">Femenino</option>
                <option value="masculino">Masculino</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block">Fecha de Nacimiento</label>
              <input
                type="date"
                name="birthDate"
                value={userData.birthDate}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="input input-bordered w-full"
              />
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <button
              className="btn btn-primary"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancelar' : 'Editar'}
            </button>
            {isEditing && (
              <button className="btn btn-success bg-purple-500 hover:bg-purple-700 text-white" onClick={saveChanges}>
                Guardar
              </button>
            )}
          </div>
          <div className="mt-6">
            <button
              className="btn btn-secondary"
              onClick={() => setShowPasswordModal(true)}
            >
              Cambiar Contraseña
            </button>
          </div>
        </div>
      </div>

      {/* Modal para cambiar contraseña */}
      {showPasswordModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h2 className="text-lg font-semibold">Cambiar Contraseña</h2>
            <div className="space-y-4">
              <div>
                <label className="block">Contraseña Actual</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="block">Nueva Contraseña</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="input input-bordered w-full"
                />
              </div>
              <div>
                <label className="block">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  name="confirmNewPassword"
                  value={passwordData.confirmNewPassword}
                  onChange={handlePasswordChange}
                  className="input input-bordered w-full"
                />
              </div>
            </div>
            <div className="flex flex-col mt-6">
              <button
                className="btn btn-primary bg-purple-500 hover:bg-purple-700 text-white"
                onClick={changePassword}
              >
                Guardar
              </button>
              <button
                className="btn"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default withAdminAuth(Configuracion);
