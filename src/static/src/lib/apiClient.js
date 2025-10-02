// Cliente de API com cache inteligente e tratamento avançado
import { auth } from '../lib/firebase';

class ApiClient {
  constructor() {
    this.baseURL = '/api';
    // Cache em memória com timestamps
    this.cache = new Map();
    // Requests em andamento para evitar duplicatas
    this.pendingRequests = new Map();
    // Configuração padrão de cache (5 minutos)
    this.defaultCacheTime = 5 * 60 * 1000;
  }

  getAuthToken = () => {
    try {
      return localStorage.getItem('authToken');
    } catch (e) {
      console.warn('Erro ao ler authToken do localStorage:', e);
      return null;
    }
  };

  // Gera chave única para cache baseada em URL e método
  getCacheKey = (url, method = 'GET', body = null) => {
    const bodyHash = body ? JSON.stringify(body) : '';
    return `${method}:${url}:${bodyHash}`;
  };

  // Verifica se o cache é válido
  isCacheValid = (cacheEntry, maxAge = this.defaultCacheTime) => {
    if (!cacheEntry) return false;
    return Date.now() - cacheEntry.timestamp < maxAge;
  };

  // Invalida cache por padrão (ex: '/transactions' invalida todos os caches de transactions)
  invalidateCache = (pattern) => {
    if (!pattern) {
      this.cache.clear();
      console.log('🗑️ Cache completamente limpo');
      return;
    }

    let removed = 0;
    for (const [key] of this.cache) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        removed++;
      }
    }
    console.log(`🗑️ ${removed} entradas de cache removidas para padrão: ${pattern}`);
  };

  // Método principal com cache e deduplicação
  request = async (endpoint, options = {}) => {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    const method = options.method || 'GET';
    const cacheKey = this.getCacheKey(url, method, options.body);

    // Para GET, verifica cache primeiro
    if (method === 'GET') {
      const cached = this.cache.get(cacheKey);
      const cacheAge = options.cacheTime || this.defaultCacheTime;
      
      if (this.isCacheValid(cached, cacheAge)) {
        console.log(`✅ Cache HIT: ${url} (idade: ${Math.round((Date.now() - cached.timestamp) / 1000)}s)`);
        return cached.data;
      }

      // Se já tem uma requisição pendente, aguarda ela
      if (this.pendingRequests.has(cacheKey)) {
        console.log(`⏳ Aguardando requisição em andamento: ${url}`);
        return this.pendingRequests.get(cacheKey);
      }
    }

    // Headers
    let finalHeaders = {
      ...(options.headers || {}),
    };

    const token = this.getAuthToken();
    if (token) {
      finalHeaders['Authorization'] = `Bearer ${token}`;
    }

    // Content-Type logic
    if (options.body instanceof FormData) {
      delete finalHeaders['Content-Type'];
    } else if (options.body && typeof options.body === 'object' && !(options.body instanceof Blob) && !(options.body instanceof ArrayBuffer)) {
      finalHeaders['Content-Type'] = 'application/json';
    }

    // Body preparation
    let requestBody = options.body;
    if (requestBody && typeof requestBody === 'object' && !(requestBody instanceof FormData) && !(requestBody instanceof Blob) && !(requestBody instanceof ArrayBuffer)) {
      requestBody = JSON.stringify(requestBody);
    }

    const config = {
      ...options,
      method,
      headers: finalHeaders,
      body: requestBody,
    };

    // Cria a promise de requisição
    const requestPromise = (async () => {
      try {
        console.log(`🌐 API Request: ${method} ${url}`);

        const response = await fetch(url, config);

        console.log(`📡 Response: ${response.status} ${response.statusText} -> ${url}`);

        if (!response.ok) {
          if (response.status === 401) {
            console.warn('🔑 401 - Limpando sessão');
            try {
              await auth.signOut();
            } catch (e) {
              console.warn('Erro ao fazer signOut:', e);
            }
            try {
              localStorage.removeItem('authToken');
            } catch (e) {
              console.warn('Erro ao remover authToken:', e);
            }
          }

          let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          try {
            const errorData = await response.json();
            if (errorData) {
              errorMessage = errorData.error || errorData.message || errorMessage;
            }
          } catch (e) {
            // Não conseguiu parsear JSON
          }

          throw new Error(errorMessage);
        }

        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = response;
        }

        // Cacheia apenas GETs bem-sucedidos
        if (method === 'GET') {
          this.cache.set(cacheKey, {
            data,
            timestamp: Date.now(),
          });
          console.log(`💾 Dados cacheados: ${url}`);
        }

        // Para operações de modificação, invalida cache relacionado
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
          const resourcePath = url.split('?')[0].split('/').slice(-2).join('/');
          this.invalidateCache(resourcePath);
        }

        return data;

      } catch (error) {
        console.error(`❌ API Error: ${method} ${url}`, error);
        throw error;
      } finally {
        // Remove da lista de pendentes
        this.pendingRequests.delete(cacheKey);
      }
    })();

    // Adiciona à lista de pendentes (apenas GET)
    if (method === 'GET') {
      this.pendingRequests.set(cacheKey, requestPromise);
    }

    return requestPromise;
  };

  // Atalhos HTTP
  get = (endpoint, options = {}) => {
    return this.request(endpoint, { ...options, method: 'GET' });
  };

  post = (endpoint, data = null, options = {}) => {
    return this.request(endpoint, { ...options, method: 'POST', body: data });
  };

  put = (endpoint, data = null, options = {}) => {
    return this.request(endpoint, { ...options, method: 'PUT', body: data });
  };

  delete = (endpoint, options = {}) => {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  };

  upload = (endpoint, formData, options = {}) => {
    const token = this.getAuthToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = {
      ...options,
      method: 'POST',
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
      body: formData,
    };

    return this.request(endpoint, config);
  };

  // Prefetch - busca dados em background
  prefetch = async (endpoint, options = {}) => {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    const cacheKey = this.getCacheKey(url, 'GET');
    
    // Se já tem no cache válido, não faz nada
    if (this.isCacheValid(this.cache.get(cacheKey))) {
      return;
    }

    // Busca em background sem bloquear
    this.get(endpoint, { ...options, priority: 'low' }).catch(err => {
      console.warn('Prefetch falhou (ignorado):', err);
    });
  };
}

const apiClient = new ApiClient();

export default apiClient;
export const { get, post, put, delete: del, upload, invalidateCache, prefetch } = apiClient;