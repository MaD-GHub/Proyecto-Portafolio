import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import UsersComponent from '../components/UsersComponent';  // Importar el componente de acciones de usuarios
import '../styles/UsersScreen.css';
import "../styles/HomeScreen.css";

const UsersScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollectionRef = collection(db, 'users');
        const snapshot = await getDocs(usersCollectionRef);
        
        const userList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUsers(userList);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Callback que se ejecuta cuando un usuario es actualizado
  const handleUserUpdated = () => {
    // Esto puede volver a cargar los usuarios después de una acción
    // o actualizar el estado si es necesario
    setLoading(true);
    const fetchUsers = async () => {
      try {
        const usersCollectionRef = collection(db, 'users');
        const snapshot = await getDocs(usersCollectionRef);
        
        const userList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setUsers(userList);
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
        setLoading(false);
      }
    };

    fetchUsers();
  };

  if (loading) {
    return <p>Cargando usuarios...</p>;
  }

  return (
    <div className="home-screen">
      <Sidebar />
      <div className="main-content">
        <Header title="Gestión de Usuarios" subtitle="Administra a los usuarios" />
        
        <div className="first-line">
          <div className="user-table-container">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Comuna</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.firstName} {user.lastName}</td>
                    <td>{user.email}</td>
                    <td>{user.comuna}</td>
                    <td>{user.activo ? 'Activo' : 'Inactivo'}</td>
                    <td className="action-buttons">
                      {/* Integración del componente UsersComponent */}
                      <UsersComponent 
                        user={user} 
                        onUserUpdated={handleUserUpdated} 
                      />
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

export default UsersScreen;
