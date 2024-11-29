import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './screens/login';
import Dashboard from './screens/dashboard'; // Crea o importa tus componentes
import Usuarios from './screens/usuarios';
import Estadisticas from './screens/estadisticas';
import Configuracion from './screens/configuracion';
import GestionContenido from './screens/gestionContenido';
import AnalisisSeguimiento from './screens/analisisSeguimiento';
import Seguridad from './screens/seguridad';
import Solicitudes from './screens/solicitudes';



function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta Login */}
        <Route path="/login" element={<Login />} />

        {/* Ruta del dashboard (Raiz) */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<Dashboard />} />
        {/* Ruta de Usuarios */}
        <Route path="/usuarios" element={<Usuarios />} />

        <Route path="/estadisticas" element={<Estadisticas />} />
        <Route path="/configuracion" element={<Configuracion />}/>
        <Route path="/gestion-contenido" element={<GestionContenido />}/>
        <Route path="/analisis" element={<AnalisisSeguimiento />}/>
        <Route path="/seguridad" element={<Seguridad />}/>
        <Route path="/solicitudes" element={<Solicitudes />}/>

        {/* proximas rutas */}{/*
        <Route path="/personalizacion" element={<Personalizacion />}/>

          */}
      </Routes>
    </Router>
  );
}

export default App;
