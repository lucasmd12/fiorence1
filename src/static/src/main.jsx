// ARQUIVO: src/static/src/main.jsx (COM INSTRUMENTAÇÃO PARA DEBUG)
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
 // import './index.css'
import App from './App.jsx'
import { AuthProvider } from './hooks/useAuth.jsx' // Importa o nosso provedor

// Instrumentação mínima para rastrear sequência de eventos
// - marca quando o script principal é executado
// - captura erros globais não tratados (para evitar tela branca silenciosa)
// - loga eventos customizados que você ou o useAuth podem disparar

console.log('🔎 [DEBUG] main.jsx starting');

// Global error handler (captura erros não tratados)
window.addEventListener('error', (event) => {
  console.error('🔴 [GLOBAL ERROR]', event.message, event.error || event);
});
window.addEventListener('unhandledrejection', (event) => {
  console.error('🔴 [UNHANDLED REJECTION]', event.reason);
});

// Small helper to time and label logs
const debugTag = (label) => (payload) => {
  console.log(`🔎 [${label}]`, payload);
};

// Expor um sinalizador global para depuração manual (opcional)
window.__APP_DEBUG__ = {
  logAuthEvent: debugTag('AuthEvent'),
  logAppRender: debugTag('AppRender'),
};

// Nota: não modificamos seu AuthProvider; apenas registramos aqui.
// Recomendo adicionar logs dentro do useAuth (onAuthStateChanged) também —
// mas antes vamos testar com essa instrumentação geral.

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);

// Dica de uso (no Console):
// 1. Observe os logs automáticos acima quando a página recarregar.
// 2. No arquivo useAuth.jsx, adicione console.log('Auth change', { user }) dentro do onAuthStateChanged
//    (se ainda não tiver) para ver a ordem exata.
// 3. Se você quiser forçar um log manualmente a partir do Console:
//    window.__APP_DEBUG__.logAuthEvent('teste');
//    window.__APP_DEBUG__.logAppRender('teste');
