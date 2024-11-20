import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

// Filtrar categorías por tipo: "Ingreso" o "Gasto"
export const getCategoriesByType = async (type) => {
  const categories = [];
  try {
    const q = query(
      collection(db, "categorias"),
      where("tipo", "==", type) // Filtrar por el campo "tipo"
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log("Documento leído:", data); // Para verificar la estructura
      if (data && data.nombre) {
        categories.push(data.nombre); // Extraer solo el nombre
      }
    });
  } catch (error) {
    console.error("Error al cargar categorías:", error);
  }
  return categories;
};

