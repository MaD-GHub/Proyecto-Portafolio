import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Intentamos iniciar sesión con Firebase
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Inicio de sesión exitoso con:", email);

      // Redirigir a la página de inicio solo si el login fue exitoso
      if (auth.currentUser) {
        console.log("Redirigiendo a /home...");
        navigate("/home"); // Redirigimos al HomeScreen
      } else {
        setError("Error al autenticar el usuario.");
      }
    } catch (err) {
      console.error(err.message);
      setError("Email o contraseña incorrectos.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Iniciar Sesión</h1>
        <p>Administrador FinaWise</p>
        <form onSubmit={handleLogin}>
          {error && <p className="error-message">{error}</p>}

          <input
            type="email"
            className="login-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            className="login-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="login-button">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
