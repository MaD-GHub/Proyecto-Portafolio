import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth"; // Para manejar el login
import { auth } from "../firebase"; // Configuración de Firebase
import { useNavigate } from "react-router-dom"; // Para redirigir al usuario
import "../styles/Login.css"; // Importamos los estilos

const Login = () => {
  const [email, setEmail] = useState(""); // Estado para el email
  const [password, setPassword] = useState(""); // Estado para la contraseña
  const [error, setError] = useState(""); // Estado para manejar errores
  const navigate = useNavigate(); // Hook para redirigir a otra página

  const handleLogin = async (e) => {
    e.preventDefault(); // Evita que la página se recargue
    try {
      // Intentamos iniciar sesión con Firebase
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Inicio de sesión exitoso con:", email);
      navigate("/home"); // Redirigimos al HomeScreen después del login
    } catch (err) {
      console.error(err.message); // Logueamos el error para debug
      setError("Email o contraseña incorrectos. Por favor, inténtalo de nuevo."); // Mostramos un mensaje de error
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Iniciar Sesión</h1>
        <p>Administrador FinaWise</p>
        {/* Formulario para iniciar sesión */}
        <form onSubmit={handleLogin}>
          {/* Muestra un mensaje de error si hay */}
          {error && <p className="error-message">{error}</p>}

          <input
            type="email"
            className="login-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Actualizamos el estado del email
          />
          <input
            type="password"
            className="login-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Actualizamos el estado de la contraseña
          />
          <a href="#" className="forgot-password">
            Solicitar nueva contraseña.
          </a>
          <button type="submit" className="login-button">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
