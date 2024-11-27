import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Agregamos el servicio de autenticación
import { getFirestore } from "firebase/firestore"; // Agregamos Firestore
import { getAnalytics } from "firebase/analytics";

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

export { auth, db, analytics };
