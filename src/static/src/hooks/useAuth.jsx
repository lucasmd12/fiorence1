import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Não inicializar a partir do localStorage -- o Firebase será a fonte da verdade.
  const [authToken, setAuthToken] = useState(null);

  // Log quando o AuthProvider monta
  console.log('🔎 [AuthProvider] mounted');

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;

      console.log('🔎 [AuthEvent] onAuthStateChanged ->', { user: !!user });

      try {
        setCurrentUser(user);

        if (user) {
          // Não forçar refresh: o SDK gerencia cache/refresh automaticamente.
          const token = await user.getIdToken();
          // Sincroniza localStorage apenas depois de obter token com sucesso.
          try {
            localStorage.setItem('authToken', token);
          } catch (e) {
            console.warn('Não foi possível escrever authToken no localStorage:', e);
          }
          setAuthToken(token);
          console.log('🔎 [AuthEvent] token obtained');
        } else {
          try {
            localStorage.removeItem('authToken');
          } catch (e) {
            console.warn('Erro ao remover authToken do localStorage:', e);
          }
          setAuthToken(null);
          console.log('🔎 [AuthEvent] no user - token cleared');
        }
      } catch (err) {
        // Tratamento robusto em caso de erro ao obter token
        console.error('Erro no onAuthStateChanged/getIdToken:', err);
        try {
          localStorage.removeItem('authToken');
        } catch (e) {
          console.warn('Erro ao remover authToken do localStorage:', e);
        }
        setAuthToken(null);
        setCurrentUser(null);
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log('🔎 [AuthEvent] loading=false', { authToken: !!authToken });
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    authToken,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
