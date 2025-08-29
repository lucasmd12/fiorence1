import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

// Configuração do Firebaseconst firebaseConfig = {
  apiKey: "AIzaSyDC1J5iV3pN5JaV54eyN1d5aU-MSZms0jA",
  authDomain: "borrachariadeley-76f94.firebaseapp.com",
  projectId: "borrachariadeley-76f94",
  storageBucket: "borrachariadeley-76f94.firebasestorage.app",
  messagingSenderId: "228562790598",
  appId: "1:228562790598:web:7bd21ca5daee0b920c8fc7",
  measurementId: "G-R37T8KQCK9"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Inicializar Firebase Auth
export const auth = getAuth(app)

export default app

