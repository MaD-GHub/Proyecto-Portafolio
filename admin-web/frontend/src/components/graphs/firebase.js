// Importación de módulos de Firebase v9+
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Servicio de autenticación
import { getFirestore, collection, getDocs } from "firebase/firestore"; // Firestore
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

// Ejemplo de cómo acceder a una colección usando los servicios exportados
export const fetchTransactions = async () => {
  // Accedemos a la colección "transacciones"
  const transactionsCollection = collection(db, "transacciones");

  try {
    // Obtenemos los documentos de la colección
    const querySnapshot = await getDocs(transactionsCollection);
    const transactions = querySnapshot.docs.map(doc => doc.data());
    return transactions; // Devolvemos los datos de las transacciones
  } catch (error) {
    console.error("Error fetching transactions: ", error);
    return []; // Retornamos un arreglo vacío en caso de error
  }
};
