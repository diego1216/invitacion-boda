import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// Configuración de Firebase (la que te dio Firebase)
const firebaseConfig = {
  apiKey: "AIzaSyBDDrWO42q6hanJEA9Qy1ocDypGrPWkDsA",
  authDomain: "invitaciones-web-15d75.firebaseapp.com",
  projectId: "invitaciones-web-15d75",
  storageBucket: "invitaciones-web-15d75.firebasestorage.app",
  messagingSenderId: "793539944558",
  appId: "1:793539944558:web:b5242882251127af52067f"
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// ✅ Inicializar Firestore
const db = getFirestore(app);

// ✅ EXPORTAR db (ESTO FALTABA)
export { db };

export const storage = getStorage(app);