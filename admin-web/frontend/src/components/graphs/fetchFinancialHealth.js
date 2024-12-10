import { collection, getDocs } from "firebase/firestore"; 
import { db } from "./firebase"; 

// Función para obtener y calcular el promedio mensual de salud financiera
const fetchFinancialHealthData = async () => {
  try {
    const collectionRef = collection(db, "healthMonthly"); // Referencia a la colección
    const querySnapshot = await getDocs(collectionRef);
    const monthlyData = {}; // Almacén para los datos procesados
    const monthCounts = {}; // Contador de documentos por mes

    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();

      // Procesar cada campo del documento
      Object.keys(data).forEach((key) => {
        if (key === "id_user" || !key.endsWith("sm")) return; // Ignorar campos no relevantes

        const month = key.substring(0, 3); // Extraer mes (primeras tres letras)
        const year = key.substring(3, 7); // Extraer año (últimos cuatro dígitos)
        const value = parseFloat(data[key]);

        if (!monthlyData[year]) {
          monthlyData[year] = {};
          monthCounts[year] = {};
        }

        // Sumar valores del índice `sm` para calcular el promedio
        monthlyData[year][month] = (monthlyData[year][month] || 0) + value;
        monthCounts[year][month] = (monthCounts[year][month] || 0) + 1; // Contar documentos
      });
    });

    // Calcular el promedio por mes y año
    Object.keys(monthlyData).forEach((year) => {
      Object.keys(monthlyData[year]).forEach((month) => {
        monthlyData[year][month] /= monthCounts[year][month]; // Promedio = suma / cantidad
      });
    });

    return monthlyData; // Retornar datos procesados
  } catch (error) {
    console.error("Error al obtener los datos de salud financiera:", error);
    throw error;
  }
};

export default fetchFinancialHealthData;
