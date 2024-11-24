// src/screens/Usuarios.js
import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import Sidebar from '../components/Sidebar';
import withAdminAuth from "../components/withAdminAuth";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showHistorial, setShowHistorial] = useState(false); // Estado para el historial de inicio de sesión
  const [historialInicioSesion, setHistorialInicioSesion] = useState([]); // Datos del historial de inicio de sesión
  const [editedUserData, setEditedUserData] = useState({ firstName: '', lastName: '', email: '' });

  const cargarUsuarios = async () => {
    try {
      const usuariosCollection = collection(db, 'users');
      const usuariosSnapshot = await getDocs(usuariosCollection);
      const usuariosList = usuariosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsuarios(usuariosList);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };

  const eliminarUsuario = async (id) => {
    try {
      await deleteDoc(doc(db, 'users', id));
      alert('Usuario eliminado exitosamente');
      cargarUsuarios();
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      alert('Hubo un error al intentar eliminar al usuario.');
    }
  };

  const enviarEmailRecuperacion = (usuario) => {
    alert(`Se ha enviado un correo de recuperación a: ${usuario.email}`);
  };

  const cambiarEstadoCuenta = async (usuario) => {
    try {
      const nuevoEstado = usuario.activo ? false : true;
      await updateDoc(doc(db, 'users', usuario.id), { activo: nuevoEstado });
      alert(`La cuenta ha sido ${nuevoEstado ? 'habilitada' : 'deshabilitada'}`);
      cargarUsuarios();
    } catch (error) {
      console.error('Error al cambiar el estado de la cuenta:', error);
      alert('Hubo un error al intentar cambiar el estado de la cuenta.');
    }
  };

  const verHistorialInicioSesion = async (usuarioId) => {
    try {
      const historialCollection = collection(db, `users/${usuarioId}/historialInicioSesion`);
      const historialSnapshot = await getDocs(historialCollection);
      const historialList = historialSnapshot.docs.map(doc => doc.data());
      setHistorialInicioSesion(historialList);
      setShowHistorial(true);
    } catch (error) {
      console.error('Error al cargar historial de inicio de sesión:', error);
      alert('Hubo un error al cargar el historial de inicio de sesión.');
    }
  };

  const handleEditUser = (usuario) => {
    setEditingUser(usuario);
    setEditedUserData({ firstName: usuario.firstName, lastName: usuario.lastName, email: usuario.email });
    setShowModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      await updateDoc(doc(db, 'users', editingUser.id), editedUserData);
      alert('Usuario actualizado exitosamente');
      setShowModal(false);
      setEditingUser(null);
      cargarUsuarios();
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      alert('Hubo un error al intentar actualizar al usuario.');
    }
  };

  const usuariosFiltrados = usuarios.filter((usuario) =>
    (usuario.firstName && usuario.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (usuario.lastName && usuario.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    cargarUsuarios();
  }, []);

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="main-content responsive-container">
        <h1 className="text-3xl font-bold text-gray-700 mb-6">Administración de Usuarios</h1>

        {/* Barra de búsqueda */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por nombre o apellido"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead>
              <tr className="bg-purple-600 text-white">
                <th className="px-6 py-3 text-left text-sm font-semibold">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Apellido</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Estado</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">No se encontraron usuarios</td>
                </tr>
              ) : (
                usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id} className="border-b">
                    <td className="px-6 py-4">{usuario.firstName || 'Sin nombre'}</td>
                    <td className="px-6 py-4">{usuario.lastName || 'Sin apellido'}</td>
                    <td className="px-6 py-4">{usuario.email || 'Sin email'}</td>
                    <td className="px-6 py-4">{usuario.activo ? 'Activo' : 'Inactivo'}</td>
                    <td className="px-6 py-4 flex space-x-2">
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                        onClick={() => handleEditUser(usuario)}
                      >
                        Editar
                      </button>
                      <button
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                        onClick={() => eliminarUsuario(usuario.id)}
                      >
                        Eliminar
                      </button>
                      <button
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                        onClick={() => cambiarEstadoCuenta(usuario)}
                      >
                        {usuario.activo ? 'Deshabilitar' : 'Habilitar'}
                      </button>
                      <button
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                        onClick={() => verHistorialInicioSesion(usuario.id)}
                      >
                        Ver Historial
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para mostrar historial de inicio de sesión */}
      {showHistorial && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-semibold mb-4">Historial de Inicio de Sesión</h2>
            <ul>
              {historialInicioSesion.map((sesion, index) => (
                <li key={index} className="mb-2">
                  {sesion.fecha} - {sesion.detalle}
                </li>
              ))}
            </ul>
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 mt-4"
              onClick={() => setShowHistorial(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal para editar usuario */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-semibold mb-4">Editar Usuario</h2>
            <form>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={editedUserData.firstName}
                  onChange={(e) => setEditedUserData({ ...editedUserData, firstName: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Apellido</label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={editedUserData.lastName}
                  onChange={(e) => setEditedUserData({ ...editedUserData, lastName: e.target.value })}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={editedUserData.email}
                  onChange={(e) => setEditedUserData({ ...editedUserData, email: e.target.value })}
                />
              </div>
            </form>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mt-4"
              onClick={handleSaveEdit}
            >
              Guardar
            </button>
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 mt-4 ml-2"
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default withAdminAuth(Usuarios);
