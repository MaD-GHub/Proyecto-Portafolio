/*import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { db } from "../firebase";
import withAdminAuth from "../components/withAdminAuth";
import '../App.css';

const GestionObjetivos = () => {
  const [objetivos, setObjetivos] = useState([]);
  const [nuevoObjetivo, setNuevoObjetivo] = useState({ descripcion: '', monto: 0 });

  useEffect(() => {
    const fetchObjetivos = async () => {
      const objetivosRef = firebase.firestore().collection('objetivos');
      const snapshot = await objetivosRef.get();
      const fetchedObjetivos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setObjetivos(fetchedObjetivos);
    };
    fetchObjetivos();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoObjetivo({ ...nuevoObjetivo, [name]: value });
  };

  const handleAddObjetivo = async () => {
    const objetivosRef = firebase.firestore().collection('objetivos');
    await objetivosRef.add(nuevoObjetivo);
    setNuevoObjetivo({ descripcion: '', monto: 0 });
    const snapshot = await objetivosRef.get();
    setObjetivos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  return (
    <div className="App">
      <Header />
      <Sidebar />
      <div className="main-content">
        <h1>Gestión de Objetivos Financieros</h1>
        <div>
          <input
            type="text"
            name="descripcion"
            value={nuevoObjetivo.descripcion}
            onChange={handleInputChange}
            placeholder="Descripción del objetivo"
          />
          <input
            type="number"
            name="monto"
            value={nuevoObjetivo.monto}
            onChange={handleInputChange}
            placeholder="Monto del objetivo"
          />
          <button onClick={handleAddObjetivo}>Agregar Objetivo</button>
        </div>
        <ul>
          {objetivos.map(objetivo => (
            <li key={objetivo.id}>
              {objetivo.descripcion} - ${objetivo.monto}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default withAdminAuth(GestionObjetivos);
