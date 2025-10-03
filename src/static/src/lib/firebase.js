// Importa as funções necessárias dos SDKs do Firebase
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics"; // Opcional, mas bom para análise

// TODO: Adicione outros SDKs para produtos do Firebase que você for usar
// https://firebase.google.com/docs/web/setup#available-libraries

// Sua nova configuração do Firebase para a Sorveteria Fiorence
const firebaseConfig = {
  apiKey: "AIzaSyCrHuQkW7e9XJvJFYLJ_1TejMXDJaa0o0I",
  authDomain: "sorveteria-fiorence-loja1.firebaseapp.com",
  projectId: "sorveteria-fiorence-loja1",
  storageBucket: "sorveteria-fiorence-loja1.appspot.com", // ✅ Corrigido para o padrão .appspot.com
  messagingSenderId: "435414072899",
  appId: "1:435414072899:web:a6313883905587e4835ef6",
  measurementId: "G-2K5KTR243N"
};

// Inicializa o Firebase com a configuração
const app = initializeApp(firebaseConfig);

// Inicializa e exporta o Firebase Authentication para ser usado na aplicação
export const auth = getAuth(app);

// Inicializa o Analytics (opcional, mas recomendado)
const analytics = getAnalytics(app);

// Exporta a instância principal do app (pode ser útil para outros serviços)
export default app;
