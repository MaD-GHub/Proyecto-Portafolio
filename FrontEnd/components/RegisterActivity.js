import { db } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

const registerActivity = async (userId, action, details = {}) => {
  try {
    await addDoc(collection(db, 'userActivity'), {
      userId,
      action,
      details,
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error registrando la actividad del usuario:", error);
  }
};

export default registerActivity;

