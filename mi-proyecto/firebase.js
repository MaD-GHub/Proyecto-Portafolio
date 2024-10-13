// firebase.js

// Importar los módulos necesarios de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { getFirestore, doc, getDoc, collection } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCOiPa7GEr4t1JcA_mTAV_8DX6dPnAyb8I",
  authDomain: "fina-wise.firebaseapp.com",
  projectId: "fina-wise",
  storageBucket: "fina-wise.appspot.com",
  messagingSenderId: "634672613413",
  appId: "1:634672613413:web:5d5612906f7d5fde82d7cc",
  measurementId: "G-JE76L5DPY1"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Auth y Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);  // Importar Firestore correctamente

// Exportar funciones necesarias de Auth y Firestore
export { signInWithEmailAndPassword, doc, getDoc, collection };
