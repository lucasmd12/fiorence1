// ARQUIVO: src/static/src/components/Reports.jsx (CORRIGIDO)

import { useState, useEffect } from 'react';
import { 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  BarChart3,
  FileText,
  FileSpreadsheet,
  Loader
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { Button } from '@/components/ui/button';
import { get } from '../lib/apiClient'; // <-- 1. IMPORTAR O 'get' DO apiClient

const Reports = ({ context }) => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const [exporting, setExporting] = useState({ pdf: false, csv: false });

  // 2. FUNÇÃO DE BUSCA DE DADOS ATUALIZADA
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Usa Promise.all para buscar dados em paralelo com o apiClient
      const [transactionsData, categoriesData] = await Promise.all([
        get(`/transactions?context=${context}&period=${selectedPeriod}`), // Adiciona o período aos parâmetros
        get(`/categories?context=${context}`)
      ]);
      
      setTransactions(transactionsData);
      setCategories(categoriesData);

    } catch (error) {
      console.error('Error fetching data:', error);
      setTransactions([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [context, selectedPeriod]);

  // 3. FUNÇÃO DE EXPORTAR PDF ATUALIZADA
  const handleExportPDF = async () => {
    try {
      setExporting(prev => ({ ...prev, pdf: true }));
      
      // Usa o 'get' do apiClient. O token é adicionado automaticamente.
      // O apiClient foi configurado para retornar a resposta completa se não for JSON.
      const response = await get(`/reports/export-pdf?context=${context}&period=${selectedPeriod}`);

      // A lógica de criar o blob e o link de download permanece a mesma.
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const contextText = context === 'business' ? 'empresarial' : 'pessoal';
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      link.download = `relatorio_${contextText}_${dateStr}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Erro na exportação de PDF:', error);
      alert(`Erro ao gerar PDF: ${error.message}`);
    } finally {
      setExporting(prev => ({ ...prev, pdf: false }));
    }
  };

  // 4. FUNÇÃO DE EXPORTAR CSV ATUALIZADA
  const handleExportCSV = async () => {
    try {
      setExporting(prev => ({ ...prev, csv: true }));
      
      // Usa o 'get' do apiClient.
      const response = await get(`/reports/export-csv?context=${context}&period=${selectedPeriod}`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const contextText = context === 'business' ? 'empresarial' : 'pessoal';
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      link.download = `transacoes_${contextText}_${dateStr}.csv`;
      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Erro na exportação de CSV:', error);
      alert(`Erro ao gerar CSV: ${error.message}`);
    } finally {
      setExporting(prev => ({ ...prev, csv: false }));
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // O RESTANTE DO CÓDIGO (LÓGICA DE GRÁFICOS E JSX) PERMANECE EXATAMENTE O MESMO...
  
  // Process data for charts
  const processMonthlyData = () => {
    const monthlyData = {}
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
          income: 0,
          expenses: 0
        }
      }
      
      if (transaction.type === 'income') {
        monthlyData[monthKey].income += transaction.amount
      } else {
        monthlyData[monthKey].expenses += transaction.amount
      }
    })
    
    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month))
  }

  const processCategoryData = () => {
    const categoryData = {}
    
    transactions.forEach(transaction => {
      const categoryName = transaction.category_name || 'Sem categoria'
      
      if (!categoryData[categoryName]) {
        categoryData[categoryName] = {
          name: categoryName,
          income: 0,
          expenses: 0,
          total: 0
        }
      }
      
      if (transaction.type === 'income') {
        categoryData[categoryName].income += transaction.amount
      } else {
        categoryData[categoryName].expenses += transaction.amount
      }
      
      categoryData[categoryName].total += transaction.amount
    })
    
    return Object.values(categoryData)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10) // Top 10 categories
  }

  const processExpensesPieData = () => {
    const expensesByCategory = {}
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const categoryName = transaction.category_name || 'Sem categoria'
        expensesByCategory[categoryName] = (expensesByCategory[categoryName] || 0) + transaction.amount
      })
    
    const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16']
    
    return Object.entries(expensesByCategory)
      .map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8)
  }

  const calculateSummary = () => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const balance = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100) : 0
    
    return {
      totalIncome,
      totalExpenses,
      balance,
      savingsRate,
      transactionCount: transactions.length
    }
  }

  const monthlyData = processMonthlyData()
  const categoryData = processCategoryData()
  const expensesPieData = processExpensesPieData()
  const summary = calculateSummary()

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-1">
            Análise detalhada das finanças {context === 'business' ? 'empresariais' : 'pessoais'}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Period Selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="current_month">Mês Atual</option>
            <option value="last_3_months">Últimos 3 Meses</option>
            <option value="last_6_months">Últimos 6 Meses</option>
            <option value="current_year">Ano Atual</option>
          </select>
          
          {/* Export Buttons */}
          <div className="flex space-x-2">
            <Button 
              onClick={handleExportCSV}
              disabled={exporting.csv || transactions.length === 0}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              {exporting.csv ? (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4 mr-2" />
              )}
              Exportar CSV
            </Button>
            
            <Button 
              onClick={handleExportPDF}
              disabled={exporting.pdf || transactions.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {exporting.pdf ? (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              Exportar PDF
            </Button>
          </div>
        </div>
      </div>

      {/* No data message */}
      {transactions.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <BarChart3 className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Nenhuma transação encontrada</h3>
          <p className="text-yellow-700">
            Adicione algumas transações ou importe documentos para gerar relatórios.
          </p>
        </div>
      )}

      {transactions.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Receitas</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(summary.totalIncome)}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-100">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Despesas</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(summary.totalExpenses)}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-red-100">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Saldo Líquido</p>
                  <p className={`text-2xl font-bold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(summary.balance)}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${summary.balance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  <BarChart3 className={`w-6 h-6 ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taxa de Economia</p>
                  <p className={`text-2xl font-bold ${summary.savingsRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {summary.savingsRate.toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <PieChartIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trend */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendência Mensal</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stackId="1" 
                    stroke="#10B981" 
                    fill="#10B981" 
                    fillOpacity={0.6}
                    name="Receitas"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expenses" 
                    stackId="2" 
                    stroke="#EF4444" 
                    fill="#EF4444" 
                    fillOpacity={0.6}
                    name="Despesas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Expenses by Category */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Despesas por Categoria</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expensesPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {expensesPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Analysis */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Análise por Categoria</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="income" fill="#10B981" name="Receitas" />
                <Bar dataKey="expenses" fill="#EF4444" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Transaction Summary Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Resumo de Transações</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Receitas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Despesas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Saldo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      % do Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categoryData.map((category, index) => {
                    const balance = category.income - category.expenses
                    const percentage = summary.totalIncome > 0 ? ((category.total / (summary.totalIncome + summary.totalExpenses)) * 100) : 0
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {category.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                          {formatCurrency(category.income)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                          {formatCurrency(category.expenses)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                          balance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(balance)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {percentage.toFixed(1)}%
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
