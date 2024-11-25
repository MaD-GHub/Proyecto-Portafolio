import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore"; // Usamos doc y getDoc en lugar de query
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import LoadingScreen from "./loading";

const withAdminAuth = (WrappedComponent) => {
  return (props) => {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          try {
            console.log("Usuario autenticado:", currentUser.uid);
            
            // Obtener el documento del usuario autenticado directamente usando su UID
            const userDocRef = doc(db, "users", currentUser.uid);
            const userDocSnapshot = await getDoc(userDocRef);

            if (userDocSnapshot.exists()) {
              const userData = userDocSnapshot.data();
              console.log("Datos del usuario:", userData);

              // Verificar si el usuario tiene el rol de 'admin'
              if (userData.role === "admin") {
                setUser(currentUser); // Usuario autenticado y tiene rol de admin
              } else {
                console.log("El usuario no tiene rol de admin, redirigiendo...");
                navigate("/login"); // Redirigir si no es admin
              }
            } else {
              console.log("No se encontró el documento del usuario en Firestore.");
              navigate("/login"); // Redirigir si no se encuentra el documento del usuario
            }
          } catch (error) {
            console.error("Error al obtener el documento del usuario:", error);
            navigate("/login"); // Redirigir en caso de error
          }
        } else {
          console.log("No hay usuario autenticado, redirigiendo al login...");
          navigate("/login"); // Redirigir si no está autenticado
        }
        setIsLoading(false); // Detener la carga
      });

      return () => {
        unsubscribe(); // Limpiar el listener cuando se desmonta el componente
      };
    }, [navigate]);

    if (isLoading) {
      return <LoadingScreen isLoading={isLoading} />; // Puedes mostrar un spinner de carga aquí
    }

    return user ? <WrappedComponent {...props} /> : null; // Renderizar el componente envuelto si está autenticado
  };
};

export default withAdminAuth;
