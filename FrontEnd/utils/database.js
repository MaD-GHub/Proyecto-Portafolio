// utils/database.js
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export const getTransactionsFromDatabase = async () => {
  try {
    const transactionsRef = collection(db, "transactions");
    const querySnapshot = await getDocs(transactionsRef);
    
    const transactions = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return transactions;
  } catch (error) {
    console.error("Error al obtener transacciones:", error);
    throw error; // Para que el `catch` en `DatosScreen` lo maneje
  }
};
