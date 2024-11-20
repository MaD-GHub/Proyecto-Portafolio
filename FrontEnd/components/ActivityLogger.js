// src/components/ActivityLogger.js
import { db, auth } from "../firebase"; // Asegúrate de que 'auth' está importado
import { collection, addDoc, Timestamp } from "firebase/firestore";

const logActivity = async (action, details) => {
  try {
    const user = auth.currentUser; // Obtén el usuario autenticado directamente desde Firebase
    if (!user) return;

    // Estructura de los datos de la actividad
    const activityData = {
      action,
      details: {
        ...details,
        timestamp: Timestamp.now(),
        userId: user.uid,
      },
    };

    // Guarda la actividad en Firestore
    await addDoc(collection(db, "userActivity"), activityData);
    console.log("Actividad registrada:", activityData);
  } catch (error) {
    console.error("Error al registrar la actividad:", error);
  }
};

export default logActivity; // Exporta logActivity directamente como default
