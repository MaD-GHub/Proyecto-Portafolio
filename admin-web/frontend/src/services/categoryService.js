import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
// Función para obtener todas las categorías
export const fetchCategories = async () => {
  try {
    const categoriesCollection = collection(db, "categorias");
    const snapshot = await getDocs(categoriesCollection);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error obteniendo categorías:", error);
    return [];
  }
};

// Función para obtener las subcategorías de ahorro
export const fetchSavingsCategories = async () => {
  try {
    const savingsCollection = collection(db, "categoriasAhorro");
    const snapshot = await getDocs(savingsCollection);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error obteniendo subcategorías de ahorro:", error);
    return [];
  }
};
