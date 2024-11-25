// Importar los módulos necesarios de Firebase desde npm
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // Importar Storage

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

// Inicializar Auth, Firestore y Storage
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Exportar Storage

// Exportar funciones necesarias de Auth y Firestore
export { signInWithEmailAndPassword, doc, getDoc, collection };