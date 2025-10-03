import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from './contexts/ThemeContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Categories from './components/Categories';
import Reports from './components/Reports';
import ImportPage from './components/ImportPage';
import VoiceCommand from './components/VoiceCommand';
import Login from './components/Login';
import { useAuth } from './hooks/useAuth';
import { auth } from './lib/firebase';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

// Configuração otimizada do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache por 10 minutos
      staleTime: 10 * 60 * 1000,
      // Mantém cache por 15 minutos mesmo sem uso
      cacheTime: 15 * 60 * 1000,
      // Não refaz requisição ao focar na janela
      refetchOnWindowFocus: false,
      // Não refaz requisição ao reconectar
      refetchOnReconnect: false,
      // Retry apenas 1 vez em caso de erro
      retry: 1,
      // Suspense mode desabilitado (usar loading states)
      suspense: false,
    },
    mutations: {
      // Retry mutations apenas 1 vez
      retry: 1,
    },
  },
});

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

function App() {
  const { authToken, loading } = useAuth();
  
  const [currentContext, setCurrentContext] = useState('business');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    try {
      // Limpa cache do React Query ao fazer logout
      queryClient.clear();
      await auth.signOut();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Ao mudar contexto, invalidamos queries relacionadas
  const handleContextChange = (newContext) => {
    setCurrentContext(newContext);
    // Invalida queries específicas do contexto anterior
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        // Invalida apenas queries que dependem do contexto
        return query.queryKey.includes('transactions') || 
               query.queryKey.includes('dashboard') ||
               query.queryKey.includes('categories');
      }
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!authToken) {
    return <Login />;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Router>
            <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
              <Sidebar 
                isOpen={sidebarOpen} 
                setIsOpen={setSidebarOpen}
                currentContext={currentContext}
                setCurrentContext={handleContextChange}
                onLogout={handleLogout}
              />
              
              <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
                <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </button>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
                        Contabilidade FIORENCE®
                      </h1>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        <button
                          onClick={() => handleContextChange('business')}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            currentContext === 'business'
                              ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                          }`}
                        >
                          Empresarial
                        </button>
                        <button
                          onClick={() => handleContextChange('personal')}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            currentContext === 'personal'
                              ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                          }`}
                        >
                          Pessoal
                        </button>
                      </div>
                      <VoiceCommand context={currentContext} />
                    </div>
                  </div>
                </header>

                <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900 transition-colors">
                  <Routes>
                    <Route path="/" element={<Dashboard context={currentContext} />} />
                    <Route path="/dashboard" element={<Dashboard context={currentContext} />} />
                    <Route path="/transactions" element={<Transactions context={currentContext} />} />
                    <Route path="/import" element={<ImportPage context={currentContext} />} />
                    <Route path="/categories" element={<Categories context={currentContext} />} />
                    <Route path="/reports" element={<Reports context={currentContext} />} />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </main>
              </div>
            </div>
          </Router>
        </ThemeProvider>
        
        {/* React Query DevTools - apenas em desenvolvimento */}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;