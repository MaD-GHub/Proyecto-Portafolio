// src/screens/Configuracion.js
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import withAdminAuth from "../components/withAdminAuth";


const Configuracion = () => {
  const [appConfig, setAppConfig] = useState({
    darkMode: false,
    notifications: true,
    autoUpdate: false,
  });

  const [webConfig, setWebConfig] = useState({
    language: 'es',
    theme: 'light',
    analytics: true,
  });

  const handleAppConfigChange = (e) => {
    const { name, checked } = e.target;
    setAppConfig((prevConfig) => ({ ...prevConfig, [name]: checked }));
  };

  const handleWebConfigChange = (e) => {
    const { name, value } = e.target;
    setWebConfig((prevConfig) => ({ ...prevConfig, [name]: value }));
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="main-content responsive-container px-4 md:px-8 lg:px-12">
        <h1 className="text-3xl font-bold text-gray-700 mb-6 text-center">Configuración</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          

          {/* Configuración de la Web */}
          <section className="bg-white p-6 rounded-lg shadow-lg w-full">
            <h2 className="text-xl font-semibold mb-4">Configuración de la Web</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label>Idioma</label>
                <select
                  name="language"
                  value={webConfig.language}
                  onChange={handleWebConfigChange}
                  className="border p-2 rounded"
                >
                  <option value="es">Español</option>
                  <option value="en">Inglés</option>
                  <option value="fr">Francés</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <label>Tema</label>
                <select
                  name="theme"
                  value={webConfig.theme}
                  onChange={handleWebConfigChange}
                  className="border p-2 rounded"
                >
                  <option value="light">Claro</option>
                  <option value="dark">Oscuro</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="analytics"
                  checked={webConfig.analytics}
                  onChange={(e) => handleWebConfigChange({ ...e, value: e.target.checked })}
                  className="mr-2"
                />
                <label>Habilitar Análisis</label>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default withAdminAuth(Configuracion);
