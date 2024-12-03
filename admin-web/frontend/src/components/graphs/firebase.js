// Importación de módulos de Firebase v9+
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Servicio de autenticación
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore"; // Firestore
import { getAnalytics } from "firebase/analytics";
import { getFunctions, httpsCallable } from "firebase/functions"; // Funciones de Firebase

// Configuración de Firebase (Sustituye con tus credenciales)
const firebaseConfig = {
  apiKey: "AIzaSyCOiPa7GEr4t1JcA_mTAV_8DX6dPnAyb8I",
  authDomain: "fina-wise.firebaseapp.com",
  projectId: "fina-wise",
  storageBucket: "fina-wise.appspot.com",
  messagingSenderId: "634672613413",
  appId: "1:634672613413:web:5d5612906f7d5fde82d7cc",
  measurementId: "G-JE76L5DPY1",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
const analytics = getAnalytics(app);
const auth = getAuth(app); // Autenticación
const db = getFirestore(app); // Firestore
const functions = getFunctions(app); // Functions

// Exportar los servicios y funciones necesarias
export { auth, db, analytics, functions, httpsCallable, collection, getDocs };

// Función para obtener las transacciones agrupadas por mes y año
export const fetchTransactions = async (selectedYear) => {
  const transactionsCollection = collection(db, "transactions");

  try {
    // Crear consulta para obtener todas las transacciones
    const q = query(transactionsCollection);

    // Obtener las transacciones desde Firestore
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("No hay transacciones en la colección.");
      return {};
    }

    // Mapear las transacciones obtenidas
    const transactions = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      console.log(`Documento ${doc.id}:`, data); // Log de cada transacción

      const { type, selectedDate, amount } = data;

      // Verificación de los campos necesarios
      if (!type || !selectedDate || !amount) {
        console.warn(`Falta algún campo en el documento ${doc.id}`);
        return null;
      }

      let transactionDate = selectedDate;

      // Verificamos si selectedDate es un Timestamp de Firebase (si tiene el campo 'seconds')
      if (selectedDate && selectedDate.seconds) {
        transactionDate = new Date(selectedDate.seconds * 1000); // Convertimos Timestamp a Date
      } else if (typeof selectedDate === "string") {
        transactionDate = new Date(selectedDate); // Si es una cadena, lo convertimos a Date
      }

      // Validamos que la fecha sea correcta
      if (isNaN(transactionDate)) {
        console.warn(`Fecha inválida en el documento ${doc.id}`);
        return null;
      }

      return {
        id: doc.id,
        type: type || "",
        amount: amount || 0,
        selectedDate: transactionDate.toISOString(), // Guardamos la fecha como un ISO string
      };
    });

    // Filtramos las transacciones nulas (aquellas que tienen campos faltantes o fechas inválidas)
    const validTransactions = transactions.filter((transaction) => transaction !== null);

    console.log("Transacciones válidas:", validTransactions);

    // Agrupar las transacciones por mes y año
    const monthlyData = {};

    validTransactions.forEach((transaction) => {
      const { type, selectedDate, amount } = transaction;
      const transactionDate = new Date(selectedDate);

      const month = transactionDate.getMonth(); // Obtiene el mes (0-11)
      const year = transactionDate.getFullYear(); // Obtiene el año

      // Solo procesar las transacciones del año seleccionado
      if (year === selectedYear) {
        const monthYear = `${selectedYear}-${month < 9 ? '0' : ''}${month + 1}`; // Formato YYYY-MM (ej. 2024-05)

        console.log(`Procesando transacción para el mes ${monthYear}:`, transaction);

        if (!monthlyData[monthYear]) {
          monthlyData[monthYear] = { incomeSum: 0, expenseSum: 0 };
        }

        // Sumamos ingresos y gastos según el tipo
        if (type === "Ingreso") {
          monthlyData[monthYear].incomeSum += amount;
        } else if (type === "Gasto") {
          monthlyData[monthYear].expenseSum += amount;
        }
      }
    });

    // Verificación final de los datos agrupados
    console.log("Datos mensuales agrupados:", monthlyData);

    return monthlyData;

  } catch (error) {
    console.error("Error al obtener las transacciones: ", error);
    return {};
  }
};
