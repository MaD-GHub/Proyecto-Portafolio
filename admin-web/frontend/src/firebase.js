import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Servicio de autenticación
import { getFirestore } from "firebase/firestore"; // Firestore
import { getAnalytics } from "firebase/analytics";
import { getFunctions, httpsCallable } from "firebase/functions"; // Funciones de Firebase

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
const analytics = getAnalytics(app);

// Exportar servicios necesarios
const auth = getAuth(app); // Inicialización de Authentication
const db = getFirestore(app); // Inicialización de Firestore
const functions = getFunctions(app); // Inicialización de Functions

export { auth, db, analytics, functions, httpsCallable };
