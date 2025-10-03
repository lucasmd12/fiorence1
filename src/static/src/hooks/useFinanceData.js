// Custom hooks para simplificar o uso de queries no app de contabilidade
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del } from '../lib/apiClient';

// Hook para transações
export const useTransactions = (context, filterType = 'all') => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['transactions', context, filterType],
    queryFn: async () => {
      const params = new URLSearchParams({ context });
      if (filterType !== 'all') {
        params.append('type', filterType);
      }
      const data = await get(`/transactions?${params}`);
      return Array.isArray(data) ? data : [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const createTransaction = useMutation({
    mutationFn: (data) => post('/transactions', { ...data, context }),
    onMutate: async (newTransaction) => {
      await queryClient.cancelQueries({ queryKey: ['transactions', context] });
      const previous = queryClient.getQueryData(['transactions', context, filterType]);
      
      if (previous) {
        queryClient.setQueryData(['transactions', context, filterType], (old) => [
          { ...newTransaction, id: 'temp-' + Date.now(), _optimistic: true },
          ...old
        ]);
      }
      
      return { previous };
    },
    onError: (err, vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(['transactions', context, filterType], ctx.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', context] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', context] });
    }
  });

  const updateTransaction = useMutation({
    mutationFn: ({ id, data }) => put(`/transactions/${id}`, { ...data, context }),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['transactions', context] });
      const previous = queryClient.getQueryData(['transactions', context, filterType]);
      
      if (previous) {
        queryClient.setQueryData(['transactions', context, filterType], (old) =>
          old.map((t) => (t.id === id || t._id === id) ? { ...t, ...data, _optimistic: true } : t)
        );
      }
      
      return { previous };
    },
    onError: (err, vars, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(['transactions', context, filterType], ctx.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', context] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', context] });
    }
  });

  const deleteTransaction = useMutation({
    mutationFn: (id) => del(`/transactions/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['transactions', context] });
      const previous = queryClient.getQueryData(['transactions', context, filterType]);
      
      if (previous) {
        queryClient.setQueryData(['transactions', context, filterType], (old) =>
          old.filter((t) => t.id !== id && t._id !== id)
        );
      }
      
      return { previous };
    },
    onError: (err, id, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(['transactions', context, filterType], ctx.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', context] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', context] });
    }
  });

  return {
    transactions: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: query.refetch
  };
};

// Hook para categorias
export const useCategories = (context) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['categories', context],
    queryFn: async () => {
      const data = await get(`/categories?context=${context}`);
      return Array.isArray(data) ? data : [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  const createCategory = useMutation({
    mutationFn: (data) => post('/categories', { ...data, context }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    }
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, data }) => put(`/categories/${id}`, { ...data, context }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    }
  });

  const deleteCategory = useMutation({
    mutationFn: (id) => del(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    }
  });

  return {
    categories: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: query.refetch
  };
};

// Hook para dashboard
export const useDashboard = (context) => {
  const summaryQuery = useQuery({
    queryKey: ['dashboard', 'summary', context],
    queryFn: () => get(`/dashboard/summary?context=${context}`),
    staleTime: 3 * 60 * 1000,
  });

  const transactionsQuery = useQuery({
    queryKey: ['transactions', context],
    queryFn: () => get(`/transactions?context=${context}`),
    staleTime: 5 * 60 * 1000,
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories', context],
    queryFn: () => get(`/categories?context=${context}`),
    staleTime: 10 * 60 * 1000,
  });

  return {
    summary: summaryQuery.data || {
      balance: 0,
      total_income: 0,
      total_expenses: 0,
      pending_payments: 0,
      upcoming_receivables: 0
    },
    transactions: transactionsQuery.data || [],
    categories: categoriesQuery.data || [],
    isLoading: summaryQuery.isLoading || transactionsQuery.isLoading || categoriesQuery.isLoading,
    isError: summaryQuery.isError || transactionsQuery.isError || categoriesQuery.isError,
    refetchAll: () => {
      summaryQuery.refetch();
      transactionsQuery.refetch();
      categoriesQuery.refetch();
    }
  };
};

// Hook para prefetch inteligente
export const usePrefetch = () => {
  const queryClient = useQueryClient();

  const prefetchTransactions = (context) => {
    queryClient.prefetchQuery({
      queryKey: ['transactions', context],
      queryFn: () => get(`/transactions?context=${context}`),
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchCategories = (context) => {
    queryClient.prefetchQuery({
      queryKey: ['categories', context],
      queryFn: () => get(`/categories?context=${context}`),
      staleTime: 10 * 60 * 1000,
    });
  };

  const prefetchDashboard = (context) => {
    queryClient.prefetchQuery({
      queryKey: ['dashboard', 'summary', context],
      queryFn: () => get(`/dashboard/summary?context=${context}`),
      staleTime: 3 * 60 * 1000,
    });
  };

  const prefetchAll = (context) => {
    prefetchTransactions(context);
    prefetchCategories(context);
    prefetchDashboard(context);
  };

  return {
    prefetchTransactions,
    prefetchCategories,
    prefetchDashboard,
    prefetchAll
  };
};

// Hook para invalidar caches
export const useInvalidateCache = () => {
  const queryClient = useQueryClient();

  const invalidateTransactions = (context) => {
    queryClient.invalidateQueries({ queryKey: ['transactions', context] });
  };

  const invalidateCategories = (context) => {
    queryClient.invalidateQueries({ queryKey: ['categories', context] });
  };

  const invalidateDashboard = (context) => {
    queryClient.invalidateQueries({ queryKey: ['dashboard', context] });
  };

  const invalidateAll = (context) => {
    invalidateTransactions(context);
    invalidateCategories(context);
    invalidateDashboard(context);
  };

  const clearAllCache = () => {
    queryClient.clear();
  };

  return {
    invalidateTransactions,
    invalidateCategories,
    invalidateDashboard,
    invalidateAll,
    clearAllCache
  };
};