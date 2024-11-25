import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import Sidebar from "../components/Sidebar";
import withAdminAuth from "../components/withAdminAuth";
import {
  FaTrash,
  FaEdit,
  FaKey,
  FaToggleOn,
  FaToggleOff,
  FaHistory,
} from "react-icons/fa";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showHistorial, setShowHistorial] = useState(false);
  const [historialInicioSesion, setHistorialInicioSesion] = useState([]);

  const cargarUsuarios = async () => {
    try {
      const usuariosCollection = collection(db, "users");
      const usuariosSnapshot = await getDocs(usuariosCollection);
      const usuariosList = usuariosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsuarios(usuariosList);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  };

  const verHistorialInicioSesionDesdeUserActivity = async (usuarioId) => {
    try {
      // Crear una consulta a la colección `userActivity` para el usuario específico y con action "login"
      const userActivityRef = collection(db, "userActivity");
      const historialQuery = query(
        userActivityRef,
        where("userId", "==", usuarioId),
        where("action", "==", "login")
      );

      // Ejecutar la consulta
      const historialSnapshot = await getDocs(historialQuery);
      const historialList = historialSnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id, // Incluir el ID del documento si es necesario
      }));

      // Actualizar el estado con los datos obtenidos
      setHistorialInicioSesion(historialList);
      setShowHistorial(true); // Mostrar el modal de historial
    } catch (error) {
      console.error("Error al cargar el historial de inicio de sesión:", error);
      alert("Hubo un error al cargar el historial de inicio de sesión.");
    }
  };

  const eliminarUsuario = async () => {
    try {
      await deleteDoc(doc(db, "users", selectedUserId));
      alert("Usuario eliminado exitosamente");
      cargarUsuarios();
      setShowConfirmDelete(false);
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      alert("Hubo un error al intentar eliminar al usuario.");
    }
  };

  const enviarEmailRecuperacion = (usuario) => {
    alert(`Se ha enviado un correo de recuperación a: ${usuario.email}`);
  };

  const cambiarEstadoCuenta = async (usuario) => {
    try {
      const nuevoEstado = usuario.activo ? false : true;
      await updateDoc(doc(db, "users", usuario.id), { activo: nuevoEstado });
      alert(
        `La cuenta ha sido ${nuevoEstado ? "habilitada" : "deshabilitada"}`
      );
      cargarUsuarios();
    } catch (error) {
      console.error("Error al cambiar el estado de la cuenta:", error);
      alert("Hubo un error al intentar cambiar el estado de la cuenta.");
    }
  };

  const verHistorialInicioSesion = async (usuarioId) => {
    try {
      const historialCollection = collection(
        db,
        `users/${usuarioId}/historialInicioSesion`
      );
      const historialSnapshot = await getDocs(historialCollection);
      const historialList = historialSnapshot.docs.map((doc) => doc.data());
      setHistorialInicioSesion(historialList);
      setShowHistorial(true);
    } catch (error) {
      console.error("Error al cargar historial de inicio de sesión:", error);
      alert("Hubo un error al cargar el historial de inicio de sesión.");
    }
  };

  const abrirModalEdicion = (usuario) => {
    setEditingUser(usuario);
    setShowModal(true);
  };

  const guardarCambiosUsuario = async () => {
    try {
      await updateDoc(doc(db, "users", editingUser.id), {
        firstName: editingUser.firstName,
        lastName: editingUser.lastName,
        email: editingUser.email,
      });
      alert("Usuario actualizado exitosamente");
      setShowModal(false);
      setEditingUser(null);
      cargarUsuarios();
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      alert("Hubo un error al intentar actualizar el usuario.");
    }
  };

  const usuariosFiltrados = usuarios.filter(
    (usuario) =>
      (usuario.firstName &&
        usuario.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (usuario.lastName &&
        usuario.lastName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    cargarUsuarios();
  }, []);

  return (
    <div className="dashboard-container flex flex-col lg:flex-row">
      <Sidebar />

      <div className="main-content p-6 w-full">
        <h1 className="text-3xl font-bold text-gray-700 mb-6 text-center">
          Administración de Usuarios
        </h1>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Buscar por nombre o apellido"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="card bg-base-100 shadow-lg mt-6 p-6">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Apellido
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    No se encontraron usuarios
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id} className="border-b">
                    <td className="px-6 py-4">
                      {usuario.firstName || "Sin nombre"}
                    </td>
                    <td className="px-6 py-4">
                      {usuario.lastName || "Sin apellido"}
                    </td>
                    <td className="px-6 py-4">
                      {usuario.email || "Sin email"}
                    </td>
                    <td className="px-6 py-4">
                      {usuario.activo ? "Activo" : "Inactivo"}
                    </td>
                    <td className="px-6 py-4 flex space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => abrirModalEdicion(usuario)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => {
                          setShowConfirmDelete(true);
                          setSelectedUserId(usuario.id);
                        }}
                      >
                        <FaTrash />
                      </button>
                      <button
                        className="text-yellow-500 hover:text-yellow-700"
                        onClick={() => enviarEmailRecuperacion(usuario)}
                      >
                        <FaKey />
                      </button>
                      <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => cambiarEstadoCuenta(usuario)}
                      >
                        {usuario.activo ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                      <button
                        className="text-green-500 hover:text-green-700"
                        onClick={() =>
                          verHistorialInicioSesionDesdeUserActivity(usuario.id)
                        }
                      >
                        <FaHistory />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Confirmar Eliminación */}
      {showConfirmDelete && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h2 className="text-lg font-semibold">Confirmar Eliminación</h2>
            <p>¿Estás seguro de que deseas eliminar este usuario?</p>
            <div className="flex justify-items-center space-x-4 mt-4 w-40">
              <button className="btn btn-error" onClick={eliminarUsuario}>
                Confirmar
              </button>
              <button
                className="btn"
                onClick={() => setShowConfirmDelete(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Editar Usuario */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h2 className="text-lg font-semibold">Editar Usuario</h2>
            <div className="space-y-4">
              <label className="block">Nombre</label>
              <input
                type="text"
                value={editingUser.firstName}
                onChange={(e) =>
                  setEditingUser((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
                className="input input-bordered w-full"
              />
              <label className="block">Apellido</label>
              <input
                type="text"
                value={editingUser.lastName}
                onChange={(e) =>
                  setEditingUser((prev) => ({
                    ...prev,
                    lastName: e.target.value,
                  }))
                }
                className="input input-bordered w-full"
              />
              <label className="block">Email</label>
              <input
                type="email"
                value={editingUser.email}
                onChange={(e) =>
                  setEditingUser((prev) => ({ ...prev, email: e.target.value }))
                }
                className="input input-bordered w-full"
              />
            </div>
            <div className=" justify-items-center  mt-4">
              <button
                className="btn btn-primary mb-3"
                onClick={guardarCambiosUsuario}
              >
                Guardar
              </button>
              <button className="btn" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Mostrar Historial de Inicio de Sesión */}
{showHistorial && (
  <div className="modal modal-open">
    <div className="modal-box w-96 max-w-full">
      <h2 className="text-lg font-semibold">
        Historial de Inicio de Sesión ({historialInicioSesion.length})
      </h2>
      <ul className="mt-4 space-y-2">
        {historialInicioSesion.map((sesion, index) => (
          <li key={index} className="text-sm p-2 border-b">
            <p>
              <strong>Descripción:</strong> {sesion.details?.description}
            </p>
            <p>
              <strong>Fecha y hora:</strong>{" "}
              {new Date(
                sesion.timestamp?.seconds * 1000
              ).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
      <button
        className="btn btn-accent mt-4"
        onClick={() => setShowHistorial(false)}
      >
        Cerrar
      </button>
    </div>
  </div>
)}

    </div>
  );
};

export default withAdminAuth(Usuarios);
