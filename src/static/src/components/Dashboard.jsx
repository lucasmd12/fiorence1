import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  AlertCircle,
  Clock
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import QuickActions from './QuickActions';
import { get, prefetch } from '../lib/apiClient';

const Dashboard = ({ context }) => {
  const queryClient = useQueryClient();

  // QUERY: Summary com cache
  const { 
    data: summary = {
      balance: 0,
      total_income: 0,
      total_expenses: 0,
      pending_payments: 0,
      upcoming_receivables: 0
    },
    isLoading: loadingSummary 
  } = useQuery({
    queryKey: ['dashboard', 'summary', context],
    queryFn: () => get(`/dashboard/summary?context=${context}`),
    staleTime: 3 * 60 * 1000, // 3 minutos
  });

  // QUERY: Transactions com cache
  const { 
    data: transactions = [],
    isLoading: loadingTransactions 
  } = useQuery({
    queryKey: ['transactions', context],
    queryFn: () => get(`/transactions?context=${context}`),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // QUERY: Categories com cache
  const { 
    data: categories = [],
    isLoading: loadingCategories 
  } = useQuery({
    queryKey: ['categories', context],
    queryFn: () => get(`/categories?context=${context}`),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  // PREFETCH: Busca dados da página de transações em background
  useEffect(() => {
    // Após 2 segundos no dashboard, faz prefetch de transações detalhadas
    const timer = setTimeout(() => {
      prefetch(`/transactions?context=${context}`);
    }, 2000);

    return () => clearTimeout(timer);
  }, [context]);

  const loading = loadingSummary || loadingTransactions || loadingCategories;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  // Processar dados para gráfico mensal
  const processMonthlyData = () => {
    if (!transactions.length) return [];

    const monthlyData = {};
    const now = new Date();
    
    // Últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = {
        month: date.toLocaleDateString('pt-BR', { month: 'short' }),
        income: 0,
        expenses: 0
      };
    }
    
    // Adicionar dados das transações
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyData[monthKey]) {
        if (transaction.type === 'income') {
          monthlyData[monthKey].income += transaction.amount;
        } else {
          monthlyData[monthKey].expenses += transaction.amount;
        }
      }
    });
    
    return Object.values(monthlyData);
  };

  // Processar dados para gráfico de pizza
  const processCategoryData = () => {
    if (!transactions.length) return [];

    const categoryTotals = {};
    
    transactions.forEach(transaction => {
      const categoryName = transaction.category_name || 'Sem categoria';
      
      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = {
          name: categoryName,
          value: 0,
          type: transaction.type
        };
      }
      
      categoryTotals[categoryName].value += transaction.amount;
    });
    
    const sortedCategories = Object.values(categoryTotals)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
    
    const colors = {
      income: ['#10B981', '#059669', '#047857', '#065F46'],
      expense: ['#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#F59E0B', '#D97706', '#8B5CF6', '#7C3AED']
    };
    
    return sortedCategories.map((category, index) => ({
      ...category,
      color: category.type === 'income' 
        ? colors.income[index % colors.income.length]
        : colors.expense[index % colors.expense.length]
    }));
  };

  const monthlyData = processMonthlyData();
  const categoryData = processCategoryData();

  // Callback para quando QuickActions adicionar transação
  const handleTransactionAdded = () => {
    // Invalida caches relacionados
    queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary', context] });
    queryClient.invalidateQueries({ queryKey: ['transactions', context] });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Visão geral das finanças {context === 'business' ? 'empresariais' : 'pessoais'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">Último update</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Balance */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Saldo Atual</p>
              <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(summary.balance)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${summary.balance >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
              <DollarSign className={`w-6 h-6 ${summary.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
            </div>
          </div>
        </div>

        {/* Income */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Receitas do Mês</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(summary.total_income)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Expenses */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Despesas do Mês</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(summary.total_expenses)}
              </p>
            </div>
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pagamentos Pendentes</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {summary.pending_payments}
              </p>
            </div>
            <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tendência Mensal</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Bar dataKey="income" fill="#10B981" name="Receitas" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expenses" fill="#EF4444" name="Despesas" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>Nenhum dado disponível</p>
                <p className="text-sm">Adicione transações para ver os gráficos</p>
              </div>
            </div>
          )}
        </div>

        {/* Category Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribuição por Categoria</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: '#6B7280' }}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: '#1F2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <DollarSign className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>Nenhuma categoria encontrada</p>
                <p className="text-sm">Adicione transações para ver a distribuição</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Insights Section */}
      {transactions.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
            Insights Financeiros
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Maior Categoria de Despesa</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {categoryData.find(c => c.type === 'expense')?.name || 'N/A'}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Transações este Mês</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {transactions.filter(t => {
                  const transactionDate = new Date(t.date);
                  const now = new Date();
                  return transactionDate.getMonth() === now.getMonth() && 
                         transactionDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Média por Transação</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <QuickActions context={context} onTransactionAdded={handleTransactionAdded} />
    </div>
  );
};

export default Dashboard;