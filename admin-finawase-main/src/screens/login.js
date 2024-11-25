import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; // Asegúrate de importar Firestore
import { auth, db } from '../firebase'; // Asegúrate de importar Firestore y auth
import '../App.css';
import '../output.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      // Autenticación con Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Acceder a Firestore y verificar el rol del usuario
      const userDocRef = doc(db, 'users', user.uid); // Usar correctamente db y uid
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Verificar si el rol del usuario es 'admin'
        if (userData.role === 'admin') {
          alert('Bienvenido, administrador');
          navigate('/dashboard'); // Redirige al dashboard si es admin
        } else {
          alert('No tienes permisos para acceder a esta página.');
          await auth.signOut(); // Cierra la sesión si el rol no es admin
        }
      } else {
        alert('El usuario no tiene un rol asignado en la base de datos.');
      }
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      alert('Error de inicio de sesión: ' + error.message);
    }
  };

  return (
    <div className="gradient-bg h-screen w-screen flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg flex w-3/4 md:w-2/3 lg:w-1/2">
        {/* Sección izquierda con bienvenida */}
        <div className="hidden md:block w-1/2 p-8 text-white gradient-bg rounded-l-lg">
          <h2 className="text-4xl font-bold mb-4">Bienvenido a FinaWise</h2>
          <p className="text-lg">
            Bienvenido a la vista de administrador de nuestra app FinaWise.
          </p>
        </div>

        {/* Sección derecha con formulario de inicio de sesión */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">ADMIN LOGIN</h2>
          <form onSubmit={handleLogin}>
            {/* Input de correo */}
            <div className="mb-4">
              <label htmlFor="email" className="sr-only">Email</label>
              <div className="flex items-center border rounded-lg bg-gray-100">
                <span className="px-3 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12H8m0 0l4-4m-4 4l4 4" />
                  </svg>
                </span>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-4 py-2 focus:outline-none bg-transparent"
                  required
                />
              </div>
            </div>

            {/* Input de contraseña */}
            <div className="mb-4">
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="flex items-center border rounded-lg bg-gray-100">
                <span className="px-3 text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.656 0 3-1.344 3-3 0-1.656-1.344-3-3-3S9 6.344 9 8c0 1.656 1.344 3 3 3zm0 0c3 0 5 1.344 5 3v1H7v-1c0-1.656 2-3 5-3z" />
                  </svg>
                </span>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-2 focus:outline-none bg-transparent"
                  required
                />
              </div>
            </div>

            {/* Enlace para solicitar nueva contraseña */}
            <div className="flex items-center justify-between mb-6">
              <a href="#" className="text-sm text-blue-500 hover:underline">Solicitar nueva contraseña</a>
            </div>

            {/* Botón de envío */}
            <button
              type="submit"
              className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none transition duration-300"
            >
              INGRESAR
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
