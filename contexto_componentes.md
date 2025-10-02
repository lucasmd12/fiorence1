# Contexto dos Componentes React e Módulo VoiceCommand

Este documento contém o código-fonte dos componentes encontrados em `./src/static/src/components`, com exceção do diretório `./src/static/src/components/ui`.

## Componente: `./src/static/src/components/Categories.jsx`
```jsx
import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  TrendingUp,
  TrendingDown,
  Tag,
  MoreHorizontal,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import apiClient from '../lib/apiClient' // IMPORTAÇÃO DO NOVO CLIENT

const Categories = ({ context }) => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all') // 'all', 'income', 'expense'
  const [showModal, setShowModal] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense',
    color: '#DC2626',
    emoji: '📁'
  })

  // Cores vibrantes e fortes
  const vibrantColors = [
    '#DC2626', // Vermelho vibrante
    '#EA580C', // Laranja vibrante  
    '#D97706', // Âmbar vibrante
    '#CA8A04', // Amarelo vibrante
    '#65A30D', // Lima vibrante
    '#059669', // Verde esmeralda vibrante
    '#0891B2', // Ciano vibrante
    '#0284C7', // Azul céu vibrante
    '#2563EB', // Azul vibrante
    '#7C3AED', // Violeta vibrante
    '#C026D3', // Fúcsia vibrante
    '#DB2777', // Rosa vibrante
    '#BE123C', // Rosa escuro vibrante
    '#92400E', // Marrom vibrante
    '#374151'  // Cinza escuro vibrante
  ]

  // Emojis básicos sempre disponíveis
  const basicEmojis = [
    '📁', '🏠', '🚗', '🛒', '💼',
    '👥', '⛽', '🔧', '🏢', '🛡️',
    '💰', '🧾', '💳', '📱', '☕'
  ]

  // Coleção extensa de emojis por categoria
  const emojiCategories = {
    'Financeiro': ['💰', '💳', '💵', '💸', '💎', '🏦', '📊', '📈', '📉', '💹'],
    'Casa': ['🏠', '🏡', '🏢', '🏬', '🏭', '🏪', '🛏️', '🛋️', '🚿', '🔌'],
    'Transporte': ['🚗', '🚙', '🚐', '🚚', '🛻', '🏍️', '🚲', '🛴', '⛽', '🚏'],
    'Alimentação': ['🍕', '🍔', '🌭', '🥪', '🌮', '🍝', '🍜', '🍱', '☕', '🍺'],
    'Compras': ['🛒', '🛍️', '👕', '👔', '👗', '👠', '💄', '📱', '💻', '⌚'],
    'Saúde': ['🏥', '💊', '🩺', '💉', '🦷', '👓', '🏃', '🧘', '💪', '❤️'],
    'Educação': ['📚', '📖', '✏️', '🖊️', '📝', '🎓', '🎒', '💡', '🔬', '📐'],
    'Lazer': ['🎬', '🎮', '🎵', '🎸', '🎨', '📺', '📷', '🎪', '🎭', '🎫'],
    'Trabalho': ['💼', '📊', '📈', '📉', '💹', '📋', '📄', '🖥️', '⌨️', '🖨️'],
    'Viagem': ['✈️', '🏨', '🗺️', '🧳', '📷', '🎒', '🌍', '🗽', '🏖️', '⛱️'],
    'Serviços': ['🔧', '🔨', '🪚', '⚡', '🔌', '🧹', '🧽', '🧴', '🚿', '🔑'],
    'Impostos': ['📋', '📄', '📊', '💼', '🏛️', '⚖️', '📝', '✍️', '🎯', '📌']
  }

  useEffect(() => {
    fetchCategories()
  }, [context, filterType])

  // MÉTODO ATUALIZADO COM API CLIENT
  const fetchCategories = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ context })
      if (filterType !== 'all') {
        params.append('type', filterType)
      }
      
      // SUBSTITUÍDO: fetch() por apiClient.get() - TOKEN AUTOMÁTICO
      const data = await apiClient.get(`/categories?${params}`)
      setCategories(data)
      
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  // MÉTODO ATUALIZADO COM API CLIENT
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const transactionData = {
        ...formData,
        context
      }

      if (editingCategory) {
        // SUBSTITUÍDO: fetch() por apiClient.put() - TOKEN AUTOMÁTICO
        await apiClient.put(`/categories/${editingCategory.id}`, transactionData)
      } else {
        // SUBSTITUÍDO: fetch() por apiClient.post() - TOKEN AUTOMÁTICO
        await apiClient.post('/categories', transactionData)
      }
      
      setShowModal(false)
      setEditingCategory(null)
      resetForm()
      fetchCategories()
      
    } catch (error) {
      console.error('Error saving category:', error)
      alert(error.message || 'Erro ao salvar categoria')
    }
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color || '#DC2626',
      emoji: category.emoji || '📁'
    })
    setShowModal(true)
  }

  // MÉTODO ATUALIZADO COM API CLIENT
  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        // SUBSTITUÍDO: fetch() por apiClient.delete() - TOKEN AUTOMÁTICO
        await apiClient.delete(`/categories/${id}`)
        fetchCategories()
      } catch (error) {
        console.error('Error deleting category:', error)
        alert(error.message || 'Erro ao excluir categoria')
      }
    }
  }

  // MÉTODO ATUALIZADO COM API CLIENT
  const seedDefaultCategories = async () => {
    try {
      // SUBSTITUÍDO: fetch() por apiClient.post() - TOKEN AUTOMÁTICO
      const result = await apiClient.post('/categories/seed')
      alert(result.message)
      fetchCategories()
    } catch (error) {
      console.error('Error seeding categories:', error)
      alert(error.message || 'Erro ao criar categorias padrão')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'expense',
      color: '#DC2626',
      emoji: '📁'
    })
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categorias</h1>
          <p className="text-gray-600 mt-1">
            Gerencie suas categorias {context === 'business' ? 'empresariais' : 'pessoais'}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            onClick={seedDefaultCategories}
            variant="outline"
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <Tag className="w-4 h-4 mr-2" />
            Categorias Padrão
          </Button>
          <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Nova Categoria
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar categorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <div className="flex space-x-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'income'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Receitas
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === 'expense'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Despesas
            </button>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Carregando categorias...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">📁</div>
            <p className="text-gray-600 mb-4">Nenhuma categoria encontrada</p>
            <Button onClick={seedDefaultCategories} variant="outline">
              <Tag className="w-4 h-4 mr-2" />
              Criar Categorias Padrão
            </Button>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      {/* Emoji com fundo vibrante e forte */}
                      <div 
                        className="p-3 rounded-lg text-white font-semibold text-lg"
                        style={{ backgroundColor: category.color || '#DC2626' }}
                      >
                        {category.emoji || '📁'}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{category.name}</h3>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          {category.type === 'income' ? (
                            <>
                              <TrendingUp className="w-3 h-3 text-green-600" />
                              <span>Receita</span>
                            </>
                          ) : (
                            <>
                              <TrendingDown className="w-3 h-3 text-red-600" />
                              <span>Despesa</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Criada em {new Date(category.created_at).toLocaleDateString('pt-BR')}</span>
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color || '#DC2626' }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Categoria
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Combustível, Aluguel, Salários..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="expense">Despesa</option>
                    <option value="income">Receita</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cor
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {vibrantColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-10 h-10 rounded-lg border-2 transition-all ${
                          formData.color === color ? 'border-gray-600 scale-110' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ícone
                  </label>
                  
                  {/* Emojis básicos */}
                  <div className="grid grid-cols-5 gap-2 mb-3">
                    {basicEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormData({ ...formData, emoji })}
                        className={`p-3 text-xl rounded-lg border transition-all ${
                          formData.emoji === emoji 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  {/* Botão Mais Emojis */}
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="w-full p-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                    <span>Mais Emojis</span>
                  </button>

                  {/* Seletor de Emojis Expandido */}
                  {showEmojiPicker && (
                    <div className="mt-3 border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-60 overflow-y-auto">
                      {Object.entries(emojiCategories).map(([categoryName, emojis]) => (
                        <div key={categoryName} className="mb-3">
                          <h4 className="text-xs font-medium text-gray-600 mb-2">{categoryName}</h4>
                          <div className="grid grid-cols-8 gap-1">
                            {emojis.map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, emoji })
                                  setShowEmojiPicker(false)
                                }}
                                className={`p-2 text-lg rounded hover:bg-white transition-all ${
                                  formData.emoji === emoji ? 'bg-blue-100' : ''
                                }`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Preview com cores vibrantes */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <div className="flex items-center space-x-3">
                    <div 
                      className="p-3 rounded-lg text-white font-semibold text-lg"
                      style={{ backgroundColor: formData.color }}
                    >
                      {formData.emoji}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{formData.name || 'Nome da categoria'}</p>
                      <p className="text-sm text-gray-500">
                        {formData.type === 'income' ? 'Receita' : 'Despesa'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    {editingCategory ? 'Atualizar' : 'Criar'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false)
                      setShowEmojiPicker(false)
                      setEditingCategory(null)
                      resetForm()
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Categories
```

## Componente: `./src/static/src/components/Dashboard.jsx`
```jsx
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

export default Dashboard;```

## Componente: `./src/static/src/components/DocumentUploadImproved.jsx`
```jsx
// ARQUIVO: src/static/src/components/DocumentUploadImproved.jsx (CORRIGIDO)

import { useState, useRef, useEffect } from 'react';
import { Upload, FileText, Image, Table, Check, X, Eye, Download, AlertCircle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// 1. IMPORTAR AS FUNÇÕES DO apiClient
import { get, post, upload } from '../lib/apiClient';

const DocumentUploadImproved = ({ context, onTransactionsExtracted }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedTransactions, setExtractedTransactions] = useState([]);
  const [processingResult, setProcessingResult] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [allCategories, setAllCategories] = useState([]);
  const fileInputRef = useRef(null);

  // 2. FUNÇÃO DE BUSCAR CATEGORIAS ATUALIZADA
  const fetchCategories = async () => {
    try {
      // Usa o método 'get' do apiClient
      const result = await get(`/categories?context=${context}`);
      setAllCategories(result || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      setAllCategories([]);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [context]);

  // ... (o resto dos estados e funções que não fazem chamadas à API permanecem iguais)

  // 3. FUNÇÃO DE PROCESSAR DOCUMENTO ATUALIZADA
  const processDocument = async () => {
    if (!selectedFile) {
      setError('Selecione um arquivo primeiro');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('context', context);
      formData.append('auto_save', 'false');

      // Usa o método 'upload' especial do apiClient
      const result = await upload('/documents/process', formData);

      if (result.success) {
        setExtractedTransactions(result.transactions);
        setProcessingResult(result.summary);
        setSuccess(`${result.transactions.length} transação(ões) encontrada(s)`);
        
        if (result.transactions.length > 0) {
          setShowPreview(true);
        }
      } else {
        setError(result.error || 'Erro ao processar documento');
      }
    } catch (error) {
      console.error('Erro ao processar documento:', error);
      setError(`Erro de conexão: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. FUNÇÃO DE SALVAR TRANSAÇÕES ATUALIZADA
  const saveTransactions = async () => {
    try {
      setIsProcessing(true);
      const transactionsToSave = [...extractedTransactions];
      
      // A lógica de criar categorias dinamicamente permanece, mas usando 'post'
      for (let i = 0; i < transactionsToSave.length; i++) {
        const transaction = transactionsToSave[i];
        
        if (transaction.category_id === 'create_new_category' && transaction.new_category_name) {
          // Usa o método 'post' do apiClient para criar a categoria
          const categoryResult = await post('/categories', {
            name: transaction.new_category_name,
            context: context,
            type: transaction.type // Adiciona o tipo para a nova categoria
          });
          
          transactionsToSave[i].category_id = categoryResult.id; // Assumindo que a API retorna o ID
          delete transactionsToSave[i].new_category_name;
        }
      }
      
      // Usa o método 'post' para salvar o lote de transações
      const result = await post('/documents/save-transactions', {
        transactions: transactionsToSave
      });

      if (result.success) {
        setSuccess(`${result.saved_count} transação(ões) salva(s) com sucesso!`);
        setShowPreview(false);
        setExtractedTransactions([]);
        setSelectedFile(null);
        
        fetchCategories(); // Recarrega categorias para incluir as novas
        
        if (onTransactionsExtracted) {
          onTransactionsExtracted();
        }
      } else {
        setError(result.error || 'Erro ao salvar transações');
      }
    } catch (error) {
      setError(`Erro: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // O RESTANTE DO CÓDIGO (LÓGICA DE UI E JSX) PERMANECE EXATAMENTE O MESMO...
  const supportedFormats = {
    'application/pdf': { icon: FileText, label: 'PDF', description: 'Extratos bancários, comprovantes' },
    'image/jpeg': { icon: Image, label: 'JPEG', description: 'Fotos de comprovantes' },
    'image/png': { icon: Image, label: 'PNG', description: 'Capturas de tela' },
    'text/csv': { icon: Table, label: 'CSV', description: 'Planilhas de dados' },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { icon: Table, label: 'Excel', description: 'Planilhas Excel' }
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
      setError('')
      setSuccess('')
      setExtractedTransactions([])
      setProcessingResult(null)
    }
  }

  const handleDrop = (event) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      setSelectedFile(file)
      setError('')
    }
  }

  const handleDragOver = (event) => {
    event.preventDefault()
  }

  const updateTransaction = (index, field, value) => {
    const updated = [...extractedTransactions]
    updated[index] = { ...updated[index], [field]: value }
    setExtractedTransactions(updated)
  }

  const removeTransaction = (index) => {
    const updated = extractedTransactions.filter((_, i) => i !== index)
    setExtractedTransactions(updated)
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getFileIcon = (fileType) => {
    const format = supportedFormats[fileType]
    if (format) {
      const IconComponent = format.icon
      return <IconComponent className="w-8 h-8" />
    }
    return <FileText className="w-8 h-8" />
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Processar Documentos</span>
          </CardTitle>
          <CardDescription>
            Faça upload de extratos, comprovantes ou planilhas para extrair transações automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors ${
              selectedFile ? '' : 'hover:border-gray-400 cursor-pointer'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={selectedFile ? undefined : () => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.csv,.xlsx,.xls"
              onChange={handleFileSelect}
            />
            
            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center space-x-3">
                  {getFileIcon(selectedFile.type)}
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                
                <div className="flex space-x-2 justify-center">
                  <Button
                    onClick={processDocument}
                    disabled={isProcessing}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isProcessing ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Processar Documento
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedFile(null)
                      setExtractedTransactions([])
                      setProcessingResult(null)
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Arraste um arquivo aqui ou clique para selecionar
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Suporte a PDF, imagens (JPG, PNG) e planilhas (CSV, Excel)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Supported Formats */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Formatos Suportados:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.entries(supportedFormats).map(([type, format]) => {
                const IconComponent = format.icon
                return (
                  <div key={type} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                    <IconComponent className="w-4 h-4 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{format.label}</p>
                      <p className="text-xs text-gray-600">{format.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Processing Summary */}
      {processingResult && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo do Processamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{processingResult.total_transactions}</p>
                <p className="text-sm text-gray-600">Transações</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{processingResult.income_count}</p>
                <p className="text-sm text-gray-600">Receitas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{processingResult.expense_count}</p>
                <p className="text-sm text-gray-600">Despesas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(processingResult.net_amount)}
                </p>
                <p className="text-sm text-gray-600">Saldo Líquido</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transações Extraídas</DialogTitle>
            <DialogDescription>
              Revise as transações antes de salvar. Você pode editar ou remover itens conforme necessário.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {extractedTransactions.map((transaction, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                    <div>
                      <Label className="text-xs text-gray-500">Data</Label>
                      <Input
                        type="date"
                        value={transaction.date}
                        onChange={(e) => updateTransaction(index, 'date', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-gray-500">Tipo</Label>
                      <Select
                        value={transaction.type}
                        onValueChange={(value) => updateTransaction(index, 'type', value)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Receita</SelectItem>
                          <SelectItem value="expense">Despesa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs text-gray-500">Valor</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={transaction.amount}
                        onChange={(e) => updateTransaction(index, 'amount', parseFloat(e.target.value))}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-gray-500">Descrição</Label>
                      <Input
                        value={transaction.description}
                        onChange={(e) => updateTransaction(index, 'description', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div className="flex flex-col space-y-2">
                      <div>
                        <Label className="text-xs text-gray-500">Categoria</Label>
                        <Select
                          value={transaction.category_id || ''}
                          onValueChange={(value) => {
                            if (value === 'create_new_category') {
                              // Definir uma nova categoria baseada na sugestão original
                              const newCategoryName = transaction.category || transaction.suggested_category_name || 'Nova Categoria'
                              updateTransaction(index, 'category_id', 'create_new_category')
                              updateTransaction(index, 'new_category_name', newCategoryName)
                            } else {
                              updateTransaction(index, 'category_id', value)
                              // Remover campos de nova categoria se existirem
                              const updated = {...transaction}
                              delete updated.new_category_name
                              setExtractedTransactions(prev => prev.map((t, i) => i === index ? updated : t))
                            }
                          }}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* Opção para criar nova categoria se não existir */}
                            {(transaction.category || transaction.suggested_category_name) && 
                             !allCategories.find(cat => cat.name.toLowerCase() === (transaction.category || transaction.suggested_category_name).toLowerCase()) && (
                              <SelectItem value="create_new_category">
                                ✨ Criar e usar: "{transaction.category || transaction.suggested_category_name}"
                              </SelectItem>
                            )}
                            
                            {/* Categorias existentes */}
                            {allCategories.map(category => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {/* Campo para editar nome da nova categoria */}
                        {transaction.category_id === 'create_new_category' && (
                          <Input
                            value={transaction.new_category_name || ''}
                            onChange={(e) => updateTransaction(index, 'new_category_name', e.target.value)}
                            placeholder="Nome da nova categoria"
                            className="mt-2"
                          />
                        )}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeTransaction(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Remover
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Cancelar
            </Button>
            <Button
              onClick={saveTransactions}
              disabled={isProcessing || extractedTransactions.length === 0}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessing ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Salvar {extractedTransactions.length} Transação(ões)
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentUploadImproved;
```

## Componente: `./src/static/src/components/ErrorBoundary.jsx`
```jsx
import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error:', error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white text-gray-800 p-6">
          <div className="max-w-2xl text-center">
            <h2 className="text-2xl font-bold mb-2">Ocorreu um erro na aplicação</h2>
            <p className="mb-4">Verifique o console do navegador para mais detalhes.</p>
            <details className="text-left whitespace-pre-wrap bg-gray-100 p-3 rounded">
              <summary className="cursor-pointer">Detalhes (clique para abrir)</summary>
              <pre className="text-xs mt-2">{String(this.state.error)}</pre>
              {this.state.info && <pre className="text-xs mt-2">{String(this.state.info.componentStack)}</pre>}
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## Componente: `./src/static/src/components/ImportPage.jsx`
```jsx
import { useNavigate } from 'react-router-dom'
import DocumentUploadImproved from './DocumentUploadImproved'

const ImportPage = ({ context }) => {
  const navigate = useNavigate()

  const handleTransactionsExtracted = () => {
    // Opcional: redirecionar para lançamentos após sucesso
    // navigate('/transactions')
    
    // Ou apenas mostrar mensagem de sucesso e deixar o usuário decidir
    console.log('Transações importadas com sucesso!')
  }

  return (
    <div className="p-6">
      {/* Header da página */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Importação de Documentos</h1>
        <p className="text-gray-600 mt-1">
          Importe extratos bancários, comprovantes e planilhas para extrair transações automaticamente
        </p>
      </div>

      {/* Componente principal de upload */}
      <DocumentUploadImproved 
        context={context} 
        onTransactionsExtracted={handleTransactionsExtracted}
      />

      {/* Dicas de uso */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-3">Dicas para melhor importação:</h3>
        <ul className="list-disc list-inside space-y-2 text-blue-800">
          <li>Use imagens nítidas e bem iluminadas para melhor reconhecimento de texto</li>
          <li>PDFs de extratos bancários têm a maior precisão na extração</li>
          <li>Planilhas Excel/CSV devem ter colunas organizadas com data, descrição e valor</li>
          <li>Revise sempre as transações antes de salvar para garantir precisão</li>
          <li>Você pode criar novas categorias durante o processo de revisão</li>
        </ul>
      </div>
    </div>
  )
}

export default ImportPage
```

## Componente: `./src/static/src/components/Login.jsx`
```jsx
// ARQUIVO: src/static/src/components/Login.jsx (CORRIGIDO)

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
// 1. IMPORTAR A FUNÇÃO 'post' DO apiClient
import { post } from '../lib/apiClient';

// Importamos o auth do firebase para o login com token que o backend vai retornar
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '../lib/firebase';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    displayName: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  // 2. FUNÇÃO DE LOGIN ATUALIZADA
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Usa o método 'post' do apiClient
      const data = await post('/auth/username-login', {
        username: formData.username,
        password: formData.password
      });

      // O backend nos deu um token customizado do Firebase.
      // Agora usamos esse token para fazer login no frontend.
      await signInWithCustomToken(auth, data.token);
      // O AuthProvider vai detectar o login e redirecionar a página.
      // Não precisamos mais verificar 'data.success' pois o apiClient já trata erros.

    } catch (err) {
      console.error('Erro no login:', err);
      setError(err.message || 'Nome de usuário ou senha inválidos');
      setIsLoading(false);
    }
  };

  // 3. FUNÇÃO DE REGISTRO ATUALIZADA
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Usa o método 'post' do apiClient
      const data = await post('/auth/register-with-username', {
        username: formData.username,
        password: formData.password,
        display_name: formData.displayName
      });

      // Após o registro, o backend já retorna um token para login automático.
      await signInWithCustomToken(auth, data.token);
      // O AuthProvider vai detectar o login e redirecionar.

    } catch (err) {
      console.error('Erro no registro:', err);
      setError(err.message || 'Não foi possível criar a conta.');
      setIsLoading(false);
    }
  };

  // O RESTANTE DO CÓDIGO (JSX) PERMANECE EXATAMENTE O MESMO...
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            FIORENCE CONTABIL
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            GESTAO INTELIGENTE
          </p>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-center">Acesse sua conta</CardTitle>
            <CardDescription className="text-center">
              Use seu nome de usuário e senha ou crie uma nova conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Criar Conta</TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Formulário de Login Modificado */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username-login">Nome de Usuário</Label>
                    <Input
                      id="username-login"
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Seu nome de usuário"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password-login">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password-login"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Sua senha"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...</> : 'Entrar'}
                  </Button>
                </form>
              </TabsContent>

              {/* Formulário de Registro Modificado */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName-register">Nome Completo</Label>
                    <Input
                      id="displayName-register"
                      name="displayName"
                      type="text"
                      required
                      value={formData.displayName}
                      onChange={handleInputChange}
                      placeholder="Como você quer ser chamado"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username-register">Nome de Usuário</Label>
                    <Input
                      id="username-register"
                      name="username"
                      type="text"
                      required
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Crie um nome de usuário único"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password-register">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password-register"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Mínimo 6 caracteres"
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando conta...</> : 'Criar Conta'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
```

## Componente: `./src/static/src/components/QuickActions.jsx`
```jsx
import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import * as Dialog from '@/components/ui/dialog' // <-- import como namespace
import { Alert, AlertDescription } from '@/components/ui/alert'

const QuickActions = ({ context, onTransactionAdded }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [actionType, setActionType] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [categories, setCategories] = useState([])

  // Estado inicial mais completo para o novo formulário
  const getInitialFormData = () => ({
    description: '',
    amount: '',
    category_id: '',
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    context: context,
    is_recurring: false,
    recurring_frequency: 'monthly',
    recurring_day_of_week: '1',
    recurring_day_of_month: new Date().getDate().toString(),
    recurring_end_date: '',
  })

  const [formData, setFormData] = useState(getInitialFormData())

  // Efeito para carregar as categorias uma única vez quando o componente monta / context muda
  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context]);

  const resetForm = () => {
    setFormData(getInitialFormData())
    setError('')
    setSuccess('')
  }

  const openDialog = (type) => {
    resetForm()
    setActionType(type)
    const isRecurring = type === 'recurring'
    const transactionType = isRecurring ? 'expense' : type

    setFormData(prev => ({
      ...prev,
      type: transactionType,
      is_recurring: isRecurring
    }))

    setIsDialogOpen(true)
  }

  // Função de carregamento corrigida: busca todas as categorias de uma vez
  const loadCategories = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`/api/categories?context=${context}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        setCategories(await response.json())
      } else {
        console.error('Erro ao carregar categorias:', response.status)
        setCategories([])
      }
    } catch (error) {
      console.error('Erro de rede ao carregar categorias:', error)
      setCategories([])
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === 'type') {
      setFormData(prev => ({ ...prev, category_id: '' }))
    }
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.description.trim() || !formData.amount || parseFloat(formData.amount) <= 0 || !formData.category_id) {
      setError('Preencha todos os campos obrigatórios corretamente.')
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('authToken')

      const transactionData = {
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        category_id: String(formData.category_id),
        date: formData.date,
        type: formData.type,
        context: formData.context,
        is_recurring: formData.is_recurring,
        recurring_frequency: formData.is_recurring ? formData.recurring_frequency : null,
        recurring_day_of_week: formData.is_recurring && formData.recurring_frequency === 'weekly' ? parseInt(formData.recurring_day_of_week) : null,
        recurring_day_of_month: formData.is_recurring && formData.recurring_frequency === 'monthly' ? parseInt(formData.recurring_day_of_month) : null,
        recurring_end_date: formData.is_recurring && formData.recurring_end_date ? formData.recurring_end_date : null,
      }

      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(transactionData)
      })

      if (response.ok) {
        setSuccess(getSuccessMessage())
        if (onTransactionAdded) onTransactionAdded()

        setTimeout(() => {
          setIsDialogOpen(false)
          resetForm()
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erro ao criar transação')
      }
    } catch (error) {
      setError('Erro interno. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const getSuccessMessage = () => actionType === 'recurring' ? 'Agendamento configurado com sucesso!' : `${formData.type === 'income' ? 'Receita' : 'Despesa'} registrada com sucesso!`
  const getDialogTitle = () => ({ income: 'Nova Receita', expense: 'Nova Despesa', recurring: 'Agendar Recorrente' })[actionType]
  const getDialogDescription = () => ({ income: 'Registre uma nova entrada de dinheiro', expense: 'Registre uma nova saída de dinheiro', recurring: 'Configure uma transação que se repete automaticamente' })[actionType]

  const renderRecurringFields = () => (
    <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <h4 className="font-medium text-blue-900">Configurações de Recorrência</h4>

      <div className="space-y-2">
        <Label htmlFor="recurring_frequency">Frequência</Label>
        <Select value={formData.recurring_frequency} onValueChange={(value) => handleSelectChange('recurring_frequency', value)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="weekly">Semanal</SelectItem>
            <SelectItem value="monthly">Mensal</SelectItem>
            <SelectItem value="yearly">Anual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.recurring_frequency === 'weekly' && (
        <div className="space-y-2">
          <Label htmlFor="recurring_day_of_week">Dia da Semana</Label>
          <Select value={formData.recurring_day_of_week} onValueChange={(value) => handleSelectChange('recurring_day_of_week', value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Segunda-feira</SelectItem>
              <SelectItem value="2">Terça-feira</SelectItem>
              <SelectItem value="3">Quarta-feira</SelectItem>
              <SelectItem value="4">Quinta-feira</SelectItem>
              <SelectItem value="5">Sexta-feira</SelectItem>
              <SelectItem value="6">Sábado</SelectItem>
              <SelectItem value="7">Domingo</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {formData.recurring_frequency === 'monthly' && (
        <div className="space-y-2">
          <Label htmlFor="recurring_day_of_month">Dia do Mês</Label>
          <Input id="recurring_day_of_month" name="recurring_day_of_month" type="number" min="1" max="31" value={formData.recurring_day_of_month} onChange={handleInputChange} />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="recurring_end_date">Data de Fim (Opcional)</Label>
        <Input id="recurring_end_date" name="recurring_end_date" type="date" value={formData.recurring_end_date} onChange={handleInputChange} min={formData.date} />
      </div>
    </div>
  )

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Dialog.Root open={isDialogOpen && actionType === 'income'} onOpenChange={(open) => {
          if (!open) {
            setIsDialogOpen(false)
            resetForm()
          }
        }}>
          <Dialog.Trigger asChild>
            <button
              onClick={() => openDialog('income')}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Nova Receita</p>
                <p className="text-sm text-gray-600">Registrar entrada</p>
              </div>
            </button>
          </Dialog.Trigger>
        </Dialog.Root>

        <Dialog.Root open={isDialogOpen && actionType === 'expense'} onOpenChange={(open) => {
          if (!open) {
            setIsDialogOpen(false)
            resetForm()
          }
        }}>
          <Dialog.Trigger asChild>
            <button
              onClick={() => openDialog('expense')}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Nova Despesa</p>
                <p className="text-sm text-gray-600">Registrar saída</p>
              </div>
            </button>
          </Dialog.Trigger>
        </Dialog.Root>

        <Dialog.Root open={isDialogOpen && actionType === 'recurring'} onOpenChange={(open) => {
          if (!open) {
            setIsDialogOpen(false)
            resetForm()
          }
        }}>
          <Dialog.Trigger asChild>
            <button
              onClick={() => openDialog('recurring')}
              className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900">Agendar Recorrente</p>
                <p className="text-sm text-gray-600">Configurar automático</p>
              </div>
            </button>
          </Dialog.Trigger>
        </Dialog.Root>
      </div>

      <Dialog.Root open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsDialogOpen(false)
          resetForm()
        }
      }}>
        <Dialog.Content className="sm:max-w-[425px]">
          <Dialog.Header>
            <Dialog.Title>{getDialogTitle()}</Dialog.Title>
            <Dialog.Description>{getDialogDescription()}</Dialog.Description>
          </Dialog.Header>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)} disabled={actionType === 'recurring'}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Despesa</SelectItem>
                  <SelectItem value="income">Receita</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Ex: Venda de produto, Pagamento de salário..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0,00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category_id">Categoria</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => handleSelectChange('category_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(cat => cat.type === formData.type).map((category) => (
                    <SelectItem key={category._id || category.id} value={String(category._id || category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data de Início</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>

            {formData.is_recurring && renderRecurringFields()}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false)
                  resetForm()
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  )
}

export default QuickActions
```

## Componente: `./src/static/src/components/RecurringManager.jsx`
```jsx
// ARQUIVO: src/static/src/components/RecurringManager.jsx (CORRIGIDO)

import { useState, useEffect } from 'react';
import { Calendar, Clock, Edit, Trash2, Play, Pause, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import * as Dialog from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
// 1. IMPORTAR O apiClient
import { get, post, del } from '../lib/apiClient';

const RecurringManager = ({ context }) => {
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [previewSchedule, setPreviewSchedule] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const loadRecurringTransactions = async () => {
    try {
      setLoading(true);
      setError(''); // Limpa erros anteriores
      // 2. USAR apiClient.get
      const data = await get(`/recurring/transactions?context=${context}`);
      setRecurringTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao carregar transações recorrentes:', err);
      setError(err.message || 'Erro de conexão');
      setRecurringTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecurringTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context]);

  const toggleTransaction = async (transactionId) => {
    try {
      // 3. USAR apiClient.post
      await post(`/recurring/transactions/${transactionId}/toggle`);
      await loadRecurringTransactions(); // Recarrega a lista
    } catch (err) {
      console.error('Erro ao alterar status:', err);
      setError(err.message || 'Erro de conexão');
    }
  };

  const deleteTransaction = async (transactionId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta transação recorrente?')) {
      return;
    }
    try {
      // 4. USAR apiClient.del
      await del(`/recurring/transactions/${transactionId}`);
      await loadRecurringTransactions(); // Recarrega a lista
    } catch (err) {
      console.error('Erro ao excluir:', err);
      setError(err.message || 'Erro de conexão');
    }
  };

  const previewScheduleForTransaction = async (transaction) => {
    try {
      const payload = {
        recurring_frequency: transaction.recurring_frequency,
        recurring_day: transaction.recurring_day,
        months_ahead: 6
      };
      // 5. USAR apiClient.post (mesmo que não precise de token, padroniza a chamada)
      const data = await post('/recurring/preview', payload);
      setPreviewSchedule(Array.isArray(data.schedule) ? data.schedule : []);
      setSelectedTransaction(transaction);
      setShowPreview(true);
    } catch (err) {
      console.error('Erro ao gerar preview:', err);
      setError(err.message || 'Erro ao gerar preview');
    }
  };

  const processRecurringTransactions = async () => {
    try {
      // 6. USAR apiClient.post
      const data = await post('/recurring/process');
      alert(`${data.processed_count} transação(ões) processada(s) com sucesso!`);
      await loadRecurringTransactions();
    } catch (err) {
      console.error('Erro ao processar transações:', err);
      setError(err.message || 'Erro ao processar transações');
    }
  };

  // ... O resto do seu componente (funções de formatação e JSX) permanece o mesmo
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatFrequency = (frequency) => {
    const frequencies = {
      weekly: 'Semanal',
      monthly: 'Mensal',
      yearly: 'Anual'
    };
    return frequencies[frequency] || frequency;
  };

  const formatNextOccurrence = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '-' : date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Transações Recorrentes</h2>
          <p className="text-gray-600 mt-1">
            Gerencie suas transações automáticas {context === 'business' ? 'empresariais' : 'pessoais'}
          </p>
        </div>
        <Button onClick={processRecurringTransactions} className="bg-blue-600 hover:bg-blue-700">
          <Clock className="w-4 h-4 mr-2" />
          Processar Pendentes
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Transactions List */}
      {recurringTransactions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma transação recorrente
            </h3>
            <p className="text-gray-600">
              Configure transações automáticas usando as ações rápidas no Dashboard
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {recurringTransactions.map((transaction) => (
            <Card key={transaction.id || transaction._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {transaction.description}
                      </h3>
                      <Badge
                        variant={transaction.recurring_active ? "default" : "secondary"}
                        className={transaction.recurring_active ? "bg-green-100 text-green-800" : ""}
                      >
                        {transaction.recurring_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                      <Badge variant="outline">
                        {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Valor:</span>
                        <p className={`font-semibold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>

                      <div>
                        <span className="font-medium">Frequência:</span>
                        <p>{formatFrequency(transaction.recurring_frequency)}</p>
                      </div>

                      <div>
                        <span className="font-medium">Próxima:</span>
                        <p>{formatNextOccurrence(transaction.next_occurrence)}</p>
                      </div>

                      <div>
                        <span className="font-medium">Categoria:</span>
                        <p>{transaction.category_name || 'Sem categoria'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => previewScheduleForTransaction(transaction)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleTransaction(transaction.id || transaction._id)}
                    >
                      {transaction.recurring_active ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTransaction(transaction.id || transaction._id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog.Root open={showPreview} onOpenChange={setShowPreview}>
        <Dialog.Content className="sm:max-w-[600px]">
          <Dialog.Header>
            <Dialog.Title>Cronograma de Recorrência</Dialog.Title>
            <Dialog.Description>
              {selectedTransaction && (
                <>
                  {selectedTransaction.description} - {formatFrequency(selectedTransaction.recurring_frequency)}
                </>
              )}
            </Dialog.Description>
          </Dialog.Header>

          <div className="max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {previewSchedule.map((occurrence, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{occurrence.formatted_date}</p>
                    <p className="text-sm text-gray-600">{occurrence.day_of_week}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{occurrence.month_year}</p>
                    {selectedTransaction && (
                      <p className={`font-semibold ${
                        selectedTransaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(selectedTransaction.amount)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setShowPreview(false)}>
              Fechar
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  );
};

export default RecurringManager;
```

## Componente: `./src/static/src/components/Reports.jsx`
```jsx
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
```

## Componente: `./src/static/src/components/Sidebar.jsx`
```jsx
// ARQUIVO: src/static/src/components/Sidebar.jsx (MODIFICADO)

import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  ArrowUpDown, 
  FolderOpen, 
  BarChart3, 
  Building2, 
  User,
  ChevronLeft,
  ChevronRight,
  Upload,
  LogOut // 1. Importe o ícone de Sair
} from 'lucide-react'
import ThemeToggle from './ThemeToggle'

// 2. Adicione a prop 'onLogout' que vem do App.jsx
const Sidebar = ({ isOpen, setIsOpen, currentContext, setCurrentContext, onLogout }) => {
  const location = useLocation()

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/transactions', icon: ArrowUpDown, label: 'Lançamentos' },
    { path: '/import', icon: Upload, label: 'Importação' },
    { path: '/categories', icon: FolderOpen, label: 'Categorias' },
    { path: '/reports', icon: BarChart3, label: 'Relatórios' },
  ]

  const isActive = (path) => location.pathname === path || (path === '/dashboard' && location.pathname === '/')

  return (
    // A div principal agora é um flex container para empurrar o logout para baixo
    <div className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 z-50 flex flex-col transition-all duration-300 ${
      isOpen ? 'w-64' : 'w-16'
    }`}>
      
      {/* Parte Superior (Logo, Contexto, Navegação) */}
      <div className="flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {isOpen && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CR</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white">Contabilidade</span>
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {isOpen ? (
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>

        {/* Context Indicator */}
        {isOpen && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 text-sm">
              {currentContext === 'business' ? (
                <>
                  <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-gray-700 dark:text-gray-300">Modo Empresarial</span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-gray-700 dark:text-gray-300">Modo Pessoal</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className={`w-5 h-5 ${
                  isActive(item.path) 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }`} />
                {isOpen && (
                  <span className={`font-medium ${
                    isActive(item.path) 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {item.label}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Parte Inferior (Theme Toggle, Logout, Footer) - mt-auto empurra para baixo */}
      <div className="mt-auto">
        {/* Theme Toggle */}
        <ThemeToggle isOpen={isOpen} />

        {/* 3. Botão de Logout */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onLogout}
            className={`flex items-center w-full space-x-3 px-3 py-2.5 rounded-lg transition-colors text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20`}
          >
            <LogOut className="w-5 h-5" />
            {isOpen && (
              <span className="font-medium">Sair</span>
            )}
          </button>
        </div>

        {/* Footer */}
        {isOpen && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                Fiorence Contabilidade
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Sidebar
```

## Componente: `./src/static/src/components/ThemeToggle.jsx`
```jsx
import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Palette, 
  Sun, 
  Moon, 
  Check,
  ChevronDown
} from 'lucide-react';

const ThemeToggle = ({ isOpen }) => {
  const { currentTheme, theme, themes, changeTheme, toggleDarkMode, isDark } = useTheme();
  const [showColorPicker, setShowColorPicker] = useState(false);

  const vibrantThemes = Object.entries(themes).filter(([key]) => 
    !['light', 'dark'].includes(key)
  );

  if (!isOpen) {
    return (
      <div className="px-2 py-2">
        <button
          onClick={toggleDarkMode}
          className="w-full p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
          title={`Alternar para modo ${isDark ? 'claro' : 'escuro'}`}
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tema
          </span>
          <button
            onClick={toggleDarkMode}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {isDark ? (
              <>
                <Moon className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Escuro</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-700">Claro</span>
              </>
            )}
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: theme.primary }}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Cores
              </span>
            </div>
            <ChevronDown 
              className={`w-4 h-4 text-gray-500 transition-transform ${
                showColorPicker ? 'rotate-180' : ''
              }`} 
            />
          </button>

          {showColorPicker && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 z-50">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    changeTheme('light');
                    setShowColorPicker(false);
                  }}
                  className={`flex items-center space-x-2 px-2 py-1.5 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    currentTheme === 'light' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-gray-700 dark:text-gray-300">Claro</span>
                  {currentTheme === 'light' && <Check className="w-3 h-3 text-blue-600 ml-auto" />}
                </button>

                <button
                  onClick={() => {
                    changeTheme('dark');
                    setShowColorPicker(false);
                  }}
                  className={`flex items-center space-x-2 px-2 py-1.5 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    currentTheme === 'dark' ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="w-3 h-3 rounded-full bg-gray-800" />
                  <span className="text-gray-700 dark:text-gray-300">Escuro</span>
                  {currentTheme === 'dark' && <Check className="w-3 h-3 text-blue-600 ml-auto" />}
                </button>

                {vibrantThemes.map(([key, themeData]) => (
                  <button
                    key={key}
                    onClick={() => {
                      changeTheme(key);
                      setShowColorPicker(false);
                    }}
                    className={`flex items-center space-x-2 px-2 py-1.5 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      currentTheme === key ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div 
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{ backgroundColor: themeData.primary }}
                    />
                    <span className="text-gray-700 dark:text-gray-300 text-xs">
                      {themeData.name}
                    </span>
                    {currentTheme === key && <Check className="w-3 h-3 text-blue-600 ml-auto" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle;
```

## Componente: `./src/static/src/components/Transactions.jsx`
```jsx
import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTransactions, useCategories } from '../hooks/useFinanceData';

const Transactions = ({ context }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense',
    category_id: '',
    date: new Date().toISOString().split('T')[0],
    status: 'pending'
  });

  // Usando os hooks customizados - MUITO MAIS SIMPLES!
  const {
    transactions,
    isLoading: loadingTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction
  } = useTransactions(context, filterType);

  const { categories, isLoading: loadingCategories } = useCategories(context);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const transactionData = {
      ...formData,
      amount: parseFloat(formData.amount)
    };

    if (editingTransaction) {
      updateTransaction.mutate({
        id: editingTransaction.id || editingTransaction._id,
        data: transactionData
      }, {
        onSuccess: () => {
          setShowModal(false);
          setEditingTransaction(null);
          resetForm();
        }
      });
    } else {
      createTransaction.mutate(transactionData, {
        onSuccess: () => {
          setShowModal(false);
          resetForm();
        }
      });
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      description: transaction.description || '',
      amount: transaction.amount != null ? String(transaction.amount) : '',
      type: transaction.type || 'expense',
      category_id: String(transaction.category_id || transaction.category || ''),
      date: transaction.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      status: transaction.status || 'pending'
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
      deleteTransaction.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      type: 'expense',
      category_id: '',
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    });
  };

  const filteredTransactions = transactions.filter(transaction =>
    (transaction.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (transaction.category_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid':
        return 'Pago';
      case 'pending':
        return 'Pendente';
      default:
        return 'Desconhecido';
    }
  };

  const loading = loadingTransactions || loadingCategories;
  const isSubmitting = createTransaction.isLoading || updateTransaction.isLoading;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lançamentos</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerencie suas transações {context === 'business' ? 'empresariais' : 'pessoais'}
            {transactions.length > 0 && ` (${transactions.length} ${transactions.length === 1 ? 'transação' : 'transações'})`}
          </p>
        </div>
        <Button 
          onClick={() => setShowModal(true)} 
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Lançamento
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar transações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex space-x-2">
            {['all', 'income', 'expense'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === type
                    ? type === 'all' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : type === 'income' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {type === 'all' ? 'Todos' : type === 'income' ? 'Receitas' : 'Despesas'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Carregando...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Nenhuma transação encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Descrição</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Categoria</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Valor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id || transaction._id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${transaction._optimistic ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full mr-3 ${transaction.type === 'income' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                          {transaction.type === 'income' ? (
                            <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{transaction.description}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{transaction.type === 'income' ? 'Receita' : 'Despesa'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {transaction.category_name || transaction.category || 'Sem categoria'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {transaction.date ? new Date(transaction.date).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(transaction.status)}
                        <span className="text-sm text-gray-900 dark:text-gray-300">{getStatusText(transaction.status)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button onClick={() => handleEdit(transaction)} disabled={transaction._optimistic} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 disabled:opacity-50">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(transaction.id || transaction._id)} disabled={transaction._optimistic || deleteTransaction.isLoading} className="text-red-600 hover:text-red-900 dark:text-red-400 disabled:opacity-50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                  <input type="text" required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                    <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                      <option value="expense">Despesa</option>
                      <option value="income">Receita</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor</label>
                    <input type="number" step="0.01" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
                  <select required value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                    <option value="">Selecione uma categoria</option>
                    {categories.filter(cat => cat.type === formData.type).map(category => (
                      <option key={category._id || category.id} value={category._id || category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data</label>
                    <input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                      <option value="pending">Pendente</option>
                      <option value="paid">Pago</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 disabled:opacity-50">
                    {isSubmitting ? 'Salvando...' : (editingTransaction ? 'Atualizar' : 'Criar')}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => { setShowModal(false); setEditingTransaction(null); resetForm(); }} disabled={isSubmitting} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
```

## Componente: `./src/static/src/components/VoiceCommand.jsx`
```jsx
// ARQUIVO: src/static/src/components/VoiceCommand.jsx (VERSÃO 2 - CORRIGIDA)

import { useState, useEffect, useRef } from 'react'; // Removido useCallback
import { Mic, MicOff, Volume2, Check, X, AlertCircle, MessageCircle, Calendar, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';

import VoiceNLPProcessor from './voice-command/core/NLPProcessor';
import { fetchCategories, createTransaction } from './voice-command/services/apiClient';
import { useSpeechRecognition } from './voice-command/hooks/useSpeechRecognition';
import { speakText } from './voice-command/services/SpeechSynthesisService';
import { formatCurrency } from './voice-command/formatters/CurrencyFormatter';
import { formatBR } from './voice-command/formatters/DateFormatter';
import { generateQuestion } from './voice-command/core/CommandMapper';
import { addToConversation, resetConversationState } from './voice-command/utils/ConversationManager';

// Renomeado para VoiceCommand para consistência com o nome do arquivo
const VoiceCommand = ({ context, onTransactionAdded }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [currentTransaction, setCurrentTransaction] = useState({});
  const [missingFields, setMissingFields] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isInConversation, setIsInConversation] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  
  const nlpProcessorRef = useRef(null);

  // A chamada do hook permanece limpa
  const { isListening, transcript, startListening, stopListening, setError: setSpeechError, setTranscript } = useSpeechRecognition();

  // Usamos uma ref para ter acesso aos estados mais recentes dentro dos callbacks
  const stateRef = useRef();
  stateRef.current = { context, categories, isInConversation, currentTransaction, missingFields };

  useEffect(() => {
    loadCategories();
  }, [context]);

  useEffect(() => {
    if (categories.length > 0) {
      nlpProcessorRef.current = new VoiceNLPProcessor(categories);
    }
  }, [categories]);

  const loadCategories = async () => {
    try {
      const data = await fetchCategories(context);
      setCategories(data);
    } catch (err) {
      console.error('Falha ao carregar categorias:', err);
      setError('Não foi possível carregar as categorias para o comando de voz.');
      setCategories([]);
    }
  };

  // Esta função agora é definida fora de um useCallback
  const processVoiceInput = async (input) => {
    // Acessa os estados mais recentes através da ref
    const currentState = stateRef.current;
    
    setIsProcessing(true);
    setError('');
    
    try {
      if (currentState.isInConversation) {
        await handleMissingFieldResponse(input);
      } else {
        await processInitialCommand(input);
      }
    } catch (error) {
      console.error("Erro no processamento de voz:", error);
      setError('Erro ao processar comando. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartListening = () => {
    resetConversation();
    startListening(processVoiceInput);
  };

  const processInitialCommand = async (command) => {
    const currentState = stateRef.current;
    if (!nlpProcessorRef.current || nlpProcessorRef.current.categories !== currentState.categories) {
      nlpProcessorRef.current = new VoiceNLPProcessor(currentState.categories);
    }

    const processed = nlpProcessorRef.current.processCommand(command, currentState.context);
    
    addToConversation(setConversation, 'user', command);

    if (processed.missing_fields.length > 0) {
      setCurrentTransaction(processed.entities);
      setMissingFields(processed.missing_fields);
      setIsInConversation(true);
      
      const nextField = processed.missing_fields[0];
      const question = generateQuestion(nextField);
      addToConversation(setConversation, 'assistant', question);
      speakText(question);
    } else {
      setConfirmation(processed);
    }
  };

  const handleMissingFieldResponse = async (response) => {
    const currentState = stateRef.current;
    const currentField = currentState.missingFields[0];
    const updatedTransaction = { ...currentState.currentTransaction };
    
    if (!nlpProcessorRef.current || nlpProcessorRef.current.categories !== currentState.categories) {
        nlpProcessorRef.current = new VoiceNLPProcessor(currentState.categories);
    }
      
    const processed = nlpProcessorRef.current.processCommand(response, currentState.context);
    
    // ... (o resto da lógica do switch permanece a mesma)
    switch (currentField) {
        case 'type':
          if (processed.entities.type) {
            updatedTransaction.type = processed.entities.type;
            addToConversation(setConversation, 'user', response);
            addToConversation(setConversation, 'assistant', `Entendi, é uma ${processed.entities.type === 'income' ? 'receita' : 'despesa'}.`);
          } else {
            addToConversation(setConversation, 'user', response);
            const clarification = 'Não entendi. É uma entrada (receita) ou saída (despesa)?';
            addToConversation(setConversation, 'assistant', clarification);
            speakText(clarification);
            return;
          }
          break;
          
        case 'amount':
          if (processed.entities.amount) {
            updatedTransaction.amount = processed.entities.amount;
            addToConversation(setConversation, 'user', response);
            addToConversation(setConversation, 'assistant', `Valor registrado: ${formatCurrency(processed.entities.amount)}`);
          } else {
            addToConversation(setConversation, 'user', response);
            const clarification = 'Não consegui identificar o valor. Pode repetir o valor em reais?';
            addToConversation(setConversation, 'assistant', clarification);
            speakText(clarification);
            return;
          }
          break;
          
        case 'description':
          if (processed.entities.description && processed.entities.description.length > 2) {
            updatedTransaction.description = processed.entities.description;
            addToConversation(setConversation, 'user', response);
            addToConversation(setConversation, 'assistant', `Descrição: ${processed.entities.description}`);
          } else {
            addToConversation(setConversation, 'user', response);
            const clarification = 'Preciso de uma descrição mais detalhada. Para que foi essa transação?';
            addToConversation(setConversation, 'assistant', clarification);
            speakText(clarification);
            return;
          }
          break;
      }
    
    setCurrentTransaction(updatedTransaction);
    
    const remainingMissing = currentState.missingFields.slice(1);
    setMissingFields(remainingMissing);
    
    if (remainingMissing.length > 0) {
      const nextField = remainingMissing[0];
      const question = generateQuestion(nextField, updatedTransaction);
      addToConversation(setConversation, 'assistant', question);
      speakText(question);
    } else {
      setIsInConversation(false);
      
      const finalProcessed = {
        intent: 'create_transaction',
        entities: updatedTransaction,
        originalCommand: updatedTransaction.description,
        confidence: 0.9
      };
      
      setConfirmation(finalProcessed);
    }
  };

  const confirmAction = async () => {
    if (!confirmation.entities.category_id) {
      setError('Por favor, selecione uma categoria antes de confirmar.');
      speakText('Por favor, selecione uma categoria.');
      return;
    }

    try {
      setIsProcessing(true);
      
      const transactionData = {
        description: confirmation.entities.description,
        amount: confirmation.entities.amount,
        type: confirmation.entities.type,
        context: confirmation.entities.context,
        category_id: confirmation.entities.category_id,
        date: confirmation.entities.date,
        due_date: confirmation.entities.due_date,
        status: confirmation.entities.status,
        is_recurring: confirmation.entities.is_recurring,
        recurring_day: confirmation.entities.recurring_day,
      };

      await createTransaction(transactionData);

      setSuccess('Transação criada com sucesso via comando de voz!');
      speakText('Transação criada com sucesso!');
      resetConversation();
      
      if (onTransactionAdded) {
        onTransactionAdded();
      }
    } catch (err) {
      console.error('Erro ao confirmar transação:', err);
      setError(err.message || 'Erro ao criar transação');
      speakText('Erro ao criar transação');
    } finally {
      setIsProcessing(false);
    }
  };

  const cancelAction = () => {
    resetConversation();
  };

  const resetConversation = () => {
    resetConversationState(setConversation, setCurrentTransaction, setMissingFields, setIsInConversation, setTranscript, setConfirmation, setError, setSuccess);
  };

  const handleCategoryChange = (e) => {
    const newCategoryId = e.target.value;
    setConfirmation(prev => ({
      ...prev,
      entities: {
        ...prev.entities,
        category_id: newCategoryId
      }
    }));
  };

  return (
    // O JSX permanece o mesmo
    <div className="relative">
      <Button
        onClick={isListening ? stopListening : handleStartListening}
        disabled={isProcessing}
        className={`relative ${
          isListening 
            ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isListening ? (
          <MicOff className="w-4 h-4 mr-2" />
        ) : (
          <Mic className="w-4 h-4 mr-2" />
        )}
        {isListening ? 'Ouvindo...' : 'Comando de Voz'}
      </Button>

      {conversation.length > 0 && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 max-h-96 overflow-y-auto">
          <div className="space-y-3">
            {conversation.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs p-3 rounded-lg ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {confirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  {confirmation.intent === 'schedule_transaction' ? (
                    <Repeat className="w-5 h-5 text-blue-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {confirmation.intent === 'schedule_transaction' ? 'Confirmar Agendamento' : 'Confirmar Lançamento'}
                </h3>
              </div>
              
              <div className="space-y-3 mb-6">
                <p className="text-sm text-gray-600">
                  <strong>Comando:</strong> "{confirmation.originalCommand}"
                </p>
                <p className="text-sm text-gray-500">
                  <strong>Confiança:</strong> {Math.round(confirmation.confidence * 100)}%
                </p>
                
                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <p className="text-sm font-medium text-gray-900">
                    {confirmation.intent === 'schedule_transaction' ? 'Agendar lançamento recorrente:' : 'Criar lançamento:'}
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li><strong>Descrição:</strong> {confirmation.entities.description || 'Não especificada'}</li>
                    <li><strong>Tipo:</strong> {confirmation.entities.type === 'expense' ? 'Despesa' : 'Receita'}</li>
                    <li><strong>Valor:</strong> {confirmation.entities.amount ? formatCurrency(confirmation.entities.amount) : 'Não especificado'}</li>
                    <li><strong>Data de Vencimento:</strong> {confirmation.entities.due_date ? formatBR(new Date(confirmation.entities.due_date + 'T00:00:00')) : 'Não especificada'}</li>
                    <li><strong>Status:</strong> {confirmation.entities.status === 'paid' ? 'Pago' : 'Pendente'}</li>
                    {confirmation.entities.is_recurring && (
                      <li><strong>Recorrência:</strong> Todo dia {confirmation.entities.recurring_day}</li>
                    )}
                  </ul>

                  <div className="pt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoria
                    </label>
                    <select
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      value={confirmation.entities.category_id || ''}
                      onChange={handleCategoryChange}
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={cancelAction}
                  disabled={isProcessing}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  onClick={confirmAction}
                  disabled={isProcessing || !confirmation.entities.category_id}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Confirmar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {transcript && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-blue-50 border border-blue-200 rounded-lg p-3 z-40">
          <div className="flex items-start space-x-2">
            <Volume2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Comando detectado:</p>
              <p className="text-sm text-blue-700 italic">"{transcript}"</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-green-50 border border-green-200 rounded-lg p-3 z-50">
          <div className="flex items-start space-x-2">
            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-red-50 border border-red-200 rounded-lg p-3 z-50">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Exportando com o nome correto do componente
export default VoiceCommand;
```

## Componente: `./src/static/src/components/voice-command/constants/brazilianSlangDictionary.js`
```js
// ============================================
// DICIONÁRIO BRASILEIRO DE GÍRIAS FINANCEIRAS
// ============================================

// 💰 GÍRIAS DE DINHEIRO (para AmountExtractor)
export const moneySlang = {
  // Unidades básicas (equivalem a R$ 1,00)
  basicUnits: {
    'conto': 1,
    'contos': 1,
    'pau': 1,
    'paus': 1,
    'pila': 1,
    'pilas': 1,
    'mango': 1,
    'mangos': 1,
    'prata': 1,
    'pratas': 1,
    'grana': 1,
    'real': 1,
    'reais': 1,
    'dinheiro': 1,
    'dindin': 1
  },

  // Multiplicadores grandes
  bigMultipliers: {
    'milão': 1000,
    'milhão': 1000000,
    'milhões': 1000000,
    'bilhão': 1000000000,
    'bilhões': 1000000000,
    'barão': 1000, // "um barão" = R$ 1.000
    'barões': 1000,
    'k': 1000,
    'mil': 1000
  },

  // Valores específicos (notas do Real)
  specificNotes: {
    'uma nota': 100,
    'um toco': 100,
    'uma onça': 50, // Nota de R$ 50 (tem uma onça-pintada)
    'um peixe': 100, // Nota de R$ 100 (tem uma garoupa)
    'uma arara': 10, // Nota de R$ 10 (tem uma arara)
    'um beija-flor': 1, // Moeda de R$ 1
    'cinquentão': 50,
    'cinquenta': 50,
    'vintão': 20,
    'dez paus': 10,
    'cinco paus': 5
  },

  // Frações e parciais
  fractions: {
    'meio': 0.5,
    'metade': 0.5,
    'meia': 0.5,
    'um quarto': 0.25,
    'três quartos': 0.75,
    'dois terços': 0.666
  }
};

// 🎯 PADRÕES DE TRANSAÇÃO (para TransactionTypeExtractor)
export const transactionPatterns = {
  expense: {
    // Peso 10 - Indicadores fortíssimos de despesa
    strongVerbs: [
      'gastei', 'torrei', 'queimei', 'paguei', 'comprei', 'adquiri',
      'contratei', 'assinei', 'renovei', 'deixei', 'dei', 'mandei'
    ],

    // Peso 8 - Verbos médios
    mediumVerbs: [
      'foi', 'custou', 'saiu', 'ficou', 'deu', 'passei', 'fiz',
      'usei', 'investi', 'apliquei', 'coloquei'
    ],

    // Peso 6 - Substantivos que indicam despesa
    nouns: [
      'despesa', 'gasto', 'compra', 'pagamento', 'conta', 'boleto',
      'fatura', 'parcela', 'prestação', 'mensalidade', 'anuidade'
    ],

    // Peso 5 - Expressões coloquiais
    slangExpressions: [
      'levei um tombo', 'tomei uma facada', 'levou uma paulada',
      'deu um preju', 'foi um rombo', 'arrombou o bolso',
      'sangrou', 'foi salgado', 'pesou no bolso', 'estourei',
      'varei', 'fritei', 'derreti', 'evaporou'
    ],

    // Peso 4 - Métodos de pagamento
    paymentMethods: [
      'no crédito', 'no débito', 'no pix', 'via pix', 'transferi',
      'doc', 'ted', 'boleto', 'dinheiro', 'espécie', 'parcelado',
      'à vista', 'cartão', 'no cartão'
    ],

    // Peso 3 - Contextos de despesa
    contexts: [
      'em', 'no', 'na', 'pra', 'para', 'com', 'de', 'do', 'da'
    ]
  },

  income: {
    // Peso 10 - Indicadores fortíssimos de receita
    strongVerbs: [
      'recebi', 'ganhei', 'faturei', 'embolsei', 'lucrei', 'arrecadei',
      'resgatei', 'saquei', 'entrou', 'caiu', 'pingou', 'creditaram'
    ],

    // Peso 8 - Verbos médios
    mediumVerbs: [
      'levantei', 'fiz', 'tirei', 'consegui', 'obtive', 'juntei',
      'acumulei', 'somei'
    ],

    // Peso 6 - Substantivos de receita
    nouns: [
      'receita', 'ganho', 'lucro', 'renda', 'entrada', 'crédito',
      'rendimento', 'proventos', 'honorários', 'cachê'
    ],

    // Peso 5 - Expressões coloquiais
    slangExpressions: [
      'fiz uma grana', 'fiz um dinheiro', 'levantei uma bolada',
      'garimpei', 'caiu uma graninha', 'entrou uma bufunfa',
      'veio um troco', 'rendeu', 'deu lucro', 'fiz caixa'
    ],

    // Peso 4 - Tipos de receita
    incomeTypes: [
      'salário', 'cachê', 'freelance', 'bico', 'freela', 'projeto',
      'venda', 'comissão', 'bônus', 'adiantamento', 'vale',
      'décimo terceiro', '13º', 'férias', 'dividendos', 'juros'
    ],

    // Peso 3 - Métodos de recebimento
    receivingMethods: [
      'via pix', 'por pix', 'transferência', 'depósito', 'ted', 'doc',
      'na conta', 'em espécie', 'dinheiro'
    ]
  }
};

// 🏷️ CATEGORIAS EXPANDIDAS (para CategoryExtractor)
export const categoryKeywords = {
  alimentacao: {
    priority: 10, // Quanto maior, mais peso
    
    brands: [
      'ifood', 'rappi', 'uber eats', 'zé delivery', 'james delivery',
      'mcdonalds', 'bk', 'burger king', "bob's", 'subway', 'dominos',
      'pizza hut', 'spoleto', 'gendai', 'china in box', 'outback',
      'giraffas', 'habib', 'burguer king'
    ],
    
    places: [
      'restaurante', 'padaria', 'mercado', 'supermercado', 'açougue',
      'feira', 'quitanda', 'hortifruti', 'sacolão', 'empório',
      'lanchonete', 'boteco', 'bar', 'pizzaria', 'sorveteria',
      'cafeteria', 'café', 'confeitaria', 'doceria'
    ],
    
    keywords: [
      'comida', 'almoço', 'almoçar', 'jantar', 'janta', 'jantei',
      'café da manhã', 'cafezinho', 'lanche', 'lanchinho', 'merenda',
      'pizza', 'hambúrguer', 'burger', 'x-burger', 'xis', 'sanduíche',
      'salgado', 'pastel', 'coxinha', 'esfirra', 'açaí', 'sorvete'
    ],
    
    slang: [
      'rango', 'rangu', 'bóia', 'larica', 'come', 'comê', 'papou',
      'mandei ver', 'petiscou', 'beliscou'
    ]
  },

  transporte: {
    priority: 9,
    
    brands: [
      'uber', '99', '99 pop', 'cabify', 'lady driver', 'buser',
      'blablacar', 'waze carpool', 'shell', 'petrobras', 'ipiranga',
      'ale', 'br'
    ],
    
    services: [
      'taxi', 'táxi', 'ônibus', 'busão', 'metrô', 'metro', 'trem',
      'brt', 'vlt', 'bilhete único', 'uber', 'aplicativo',
      'estacionamento', 'pedágio', 'lavagem', 'mecânico'
    ],
    
    keywords: [
      'combustível', 'gasolina', 'gasosa', 'etanol', 'álcool', 'diesel',
      'gás', 'gnv', 'abasteci', 'abastecer', 'enchi o tanque',
      'corrida', 'viagem', 'deslocamento', 'frete', 'mudança'
    ],
    
    slang: [
      'corridinha', 'uber', 'busão', 'metrô', 'gasosa', 'álcool',
      'abastecida', 'tanque cheio'
    ]
  },

  saude: {
    priority: 10,
    
    places: [
      'hospital', 'clínica', 'consultório', 'posto de saúde', 'upa',
      'pronto socorro', 'ps', 'farmácia', 'drogaria', 'laboratório',
      'dentista', 'oftalmologista', 'dermatologista'
    ],
    
    keywords: [
      'médico', 'doutor', 'consulta', 'exame', 'raio-x', 'ultrassom',
      'tomografia', 'ressonância', 'cirurgia', 'procedimento',
      'remédio', 'medicamento', 'vacina', 'injeção', 'tratamento',
      'terapia', 'sessão', 'fisioterapia', 'psicólogo', 'terapeuta'
    ],
    
    brands: [
      'unimed', 'amil', 'bradesco saúde', 'sulamerica', 'notredame',
      'hapvida', 'samp', 'golden cross', 'drogasil', 'pacheco',
      'droga raia', 'pague menos', 'panvel', 'extrafarma', 'venancio'
    ],
    
    slang: [
      'plano de saúde', 'convênio', 'médico particular'
    ]
  },

  casa: {
    priority: 8,
    
    keywords: [
      'aluguel', 'locação', 'luz', 'energia', 'elétrica', 'conta de luz',
      'água', 'esgoto', 'saneamento', 'conta de água', 'internet',
      'net', 'wi-fi', 'wifi', 'banda larga', 'telefone', 'celular',
      'linha', 'condomínio', 'taxa condominial', 'iptu', 'imposto',
      'gás', 'botijão', 'móveis', 'eletrodoméstico', 'reforma',
      'manutenção', 'conserto', 'pintura', 'encanador', 'eletricista'
    ],
    
    brands: [
      'enel', 'light', 'cemig', 'celpe', 'copel', 'sabesp', 'cedae',
      'caesb', 'sanepar', 'vivo', 'claro', 'tim', 'oi', 'net',
      'sky', 'directv', 'ultragaz', 'liquigás', 'copagaz'
    ],
    
    slang: [
      'a luz', 'a água', 'a net', 'o condomínio'
    ]
  },

  assinaturas: {
    priority: 7,
    
    brands: [
      'netflix', 'amazon prime', 'prime video', 'disney plus', 'disney+',
      'hbo max', 'paramount plus', 'paramount+', 'apple tv', 'globoplay',
      'spotify', 'deezer', 'youtube premium', 'youtube music',
      'amazon music', 'apple music', 'tidal', 'google one',
      'icloud', 'dropbox', 'onedrive', 'adobe', 'canva', 'notion',
      'evernote', 'microsoft 365', 'office 365', 'ps plus', 'xbox live'
    ],
    
    keywords: [
      'streaming', 'assinatura', 'mensalidade', 'plano', 'pacote',
      'serviço', 'aplicativo', 'app', 'renovação', 'premium',
      'plus', 'pro', 'anual', 'mensal'
    ],
    
    slang: [
      'meu netflix', 'meu spotify', 'a netflix', 'o spotify'
    ]
  },

  lazer: {
    priority: 6,
    
    keywords: [
      'cinema', 'filme', 'ingresso', 'teatro', 'show', 'festa',
      'balada', 'show', 'festival', 'evento', 'parque', 'diversão',
      'passeio', 'viagem', 'turismo', 'hotel', 'pousada', 'airbnb',
      'hospedagem', 'parque', 'zoológico', 'museu', 'exposição'
    ],
    
    slang: [
      'rolê', 'role', 'saída', 'cineminha', 'bailão', 'festinha'
    ]
  },

  trabalho: {
    priority: 9,
    
    keywords: [
      'salário', 'salario', 'ordenado', 'vencimento', 'pagamento',
      'freelance', 'freela', 'bico', 'projeto', 'serviço', 'job',
      'trabalho', 'consulta', 'consultoria', 'honorário', 'honorarios',
      'cachê', 'cache', 'comissão', 'comissao', 'bônus', 'bonus',
      'gratificação', 'vale', 'adiantamento', 'décimo terceiro',
      '13º', 'férias', 'participação nos lucros', 'plr'
    ],
    
    slang: [
      'trampo', 'grana do trampo', 'pagamento', 'salário do mês'
    ]
  },

  educacao: {
    priority: 7,
    
    keywords: [
      'escola', 'colégio', 'faculdade', 'universidade', 'curso',
      'mensalidade escolar', 'matrícula', 'material escolar',
      'livros', 'apostila', 'uniforme', 'transporte escolar',
      'aula particular', 'professor', 'reforço', 'cursinho',
      'pré-vestibular', 'idiomas', 'inglês', 'espanhol'
    ],
    
    brands: [
      'kumon', 'wizard', 'ccaa', 'cultura inglesa', 'fisk',
      'skill', 'udemy', 'coursera', 'alura', 'rocketseat'
    ]
  },

  vestuario: {
    priority: 5,
    
    keywords: [
      'roupa', 'calça', 'camisa', 'camiseta', 'blusa', 'vestido',
      'short', 'bermuda', 'sapato', 'tênis', 'sandália', 'chinelo',
      'bota', 'meia', 'cueca', 'calcinha', 'sutiã', 'lingerie',
      'jaqueta', 'casaco', 'moletom', 'blusa', 'polo'
    ],
    
    brands: [
      'zara', 'renner', 'c&a', 'riachuelo', 'marisa', 'pernambucanas',
      'lojas americanas', 'magazine luiza', 'nike', 'adidas',
      'puma', 'farm', 'shoulder', 'reserva', 'aramis'
    ],
    
    slang: [
      'look', 'fit', 'outfit', 'peça', 'trampo'
    ]
  },

  beleza: {
    priority: 5,
    
    keywords: [
      'salão', 'cabeleireiro', 'barbeiro', 'manicure', 'pedicure',
      'depilação', 'sobrancelha', 'massagem', 'spa', 'estética',
      'maquiagem', 'perfume', 'cosmético', 'shampoo', 'condicionador',
      'creme', 'hidratante', 'protetor solar'
    ],
    
    slang: [
      'cabelo', 'unha', 'pelos', 'make'
    ]
  }
};

// 📊 STATUS DE PAGAMENTO (para StatusExtractor)
export const paymentStatus = {
  paid: {
    verbs: [
      'paguei', 'quitei', 'resolvi', 'acertei', 'liquidei', 'saldei',
      'finalizei', 'fechei', 'zerei', 'matei', 'encerrei'
    ],
    
    expressions: [
      'já pago', 'já foi', 'tá pago', 'está pago', 'pago',
      'já era', 'resolvido', 'quitado', 'liquidado', 'zerado',
      'fechado', 'finalizado'
    ]
  },
  
  pending: {
    verbs: [
      'preciso pagar', 'tenho que pagar', 'devo', 'falta pagar',
      'ainda não paguei', 'esqueci de pagar', 'vence', 'tô devendo'
    ],
    
    expressions: [
      'pendente', 'em aberto', 'a pagar', 'pra pagar', 'para pagar',
      'não pago', 'ainda não', 'tá devendo', 'está devendo',
      'na agulha', 'atrasado', 'vencido', 'vence hoje', 'vence amanhã'
    ]
  }
};

export default {
  moneySlang,
  transactionPatterns,
  categoryKeywords,
  paymentStatus
};```

## Componente: `./src/static/src/components/voice-command/constants/keywords.js`
```js

export const contextualKeywords = {
  alimentação: [
    'comida', 'almoço', 'jantar', 'café', 'lanche', 'restaurante', 'padaria', 
    'mercado', 'supermercado', 'ifood', 'delivery', 'pizza', 'hambúrguer'
  ],
  transporte: [
    'uber', '99', 'taxi', 'ônibus', 'metrô', 'combustível', 'gasolina',
    'álcool', 'posto', 'estacionamento', 'pedágio', 'mecânico'
  ],
  saúde: [
    'médico', 'farmácia', 'remédio', 'medicamento', 'hospital', 'consulta',
    'plano de saúde', 'dentista', 'exame', 'laboratório'
  ],
  casa: [
    'aluguel', 'luz', 'energia', 'água', 'internet', 'telefone', 'celular',
    'condomínio', 'iptu', 'móveis', 'decoração', 'limpeza'
  ],
  trabalho: [
    'salário', 'freelance', 'projeto', 'serviço', 'consulta', 'honorário',
    'comissão', 'bônus', 'vale', 'adiantamento'
  ]
};

```

## Componente: `./src/static/src/components/voice-command/constants/numberMaps.js`
```js

export const numbersMap = {
  'zero': 0, 'um': 1, 'uma': 1, 'dois': 2, 'duas': 2, 'três': 3, 'tres': 3,
  'quatro': 4, 'cinco': 5, 'seis': 6, 'sete': 7, 'oito': 8, 'nove': 9,
  'dez': 10, 'onze': 11, 'doze': 12, 'treze': 13, 'catorze': 14, 'quatorze': 14,
  'quinze': 15, 'dezesseis': 16, 'dezessete': 17, 'dezoito': 18, 'dezenove': 19,
  'vinte': 20, 'trinta': 30, 'quarenta': 40, 'cinquenta': 50,
  'sessenta': 60, 'setenta': 70, 'oitenta': 80, 'noventa': 90,
  'cem': 100, 'cento': 100, 'duzentos': 200, 'trezentos': 300,
  'quatrocentos': 400, 'quinhentos': 500, 'seiscentos': 600,
  'setecentos': 700, 'oitocentos': 800, 'novecentos': 900
};

export const multipliers = {
  'mil': 1000,
  'milhão': 1000000, 'milhao': 1000000,
  'milhões': 1000000, 'milhoes': 1000000,
  'bilhão': 1000000000, 'bilhao': 1000000000,
  'bilhões': 1000000000, 'bilhoes': 1000000000,
  'trilhão': 1000000000000, 'trilhao': 1000000000000,
  'trilhões': 1000000000000, 'trilhoes': 1000000000000
};

export const decimalWords = {
  'meio': 0.5, 'metade': 0.5,
  'um quarto': 0.25, 'dois terços': 0.67, 'três quartos': 0.75
};

```

## Componente: `./src/static/src/components/voice-command/constants/patterns.js`
```js
// ============================================
// PATTERNS.JS - VERSÃO INTEGRADA
// Mantém padrões antigos + adiciona brasileiros
// ============================================

// 🎯 PADRÕES DE INTENÇÃO (mantidos do original)
export const intentPatterns = {
  schedule_transaction: [
    /agendar|agende|programar|todo (dia|mês|ano)|mensal|semanal|anual|recorrente/i,
    /repetir|automático|fixo|sempre/i
  ],
  create_transaction: [
    /pagar|paguei|despesa|gasto|receita|receber|recebi|entrada|saída/i
  ]
};

// 💰 PADRÕES DE TIPO DE TRANSAÇÃO (expandidos)
export const typePatterns = {
  expense: [
    // Padrões originais (mantidos)
    /despesa|gasto|pagar|paguei|saída|débito|conta|boleto/i,
    /comprar|comprei|gastei|perdi/i,
    
    // ⭐ NOVOS: Gírias brasileiras de despesa
    /torrei|queimei|deixei|fritei|varei|derreti|estourei/i,
    /levei (um )?tombo|levou (uma )?paulada|tomei (uma )?facada/i,
    /deu (um )?preju|foi (um )?rombo|arrombou o bolso|sangrou|pesou no bolso/i,
    /no crédito|no débito|via pix|transferi|doc|ted/i,
    /foi salgado|foi caro|custou caro/i
  ],
  
  income: [
    // Padrões originais (mantidos)
    /receita|entrada|receber|recebi|crédito|ganho|salário/i,
    /vender|vendi|lucro|rendimento/i,
    
    // ⭐ NOVOS: Gírias brasileiras de receita
    /faturei|embolsei|lucrei|arrecadei|resgatei|saquei/i,
    /caiu|pingou|creditaram|entrou (na conta)?/i,
    /fiz (uma )?grana|levantei (uma )?bolada|garimpei/i,
    /cachê|freelance|freela|bico|comissão|bônus/i,
    /décimo terceiro|13º|férias|vale|adiantamento/i
  ]
};

// 📊 PADRÕES DE STATUS (expandidos)
export const statusPatterns = {
  paid: [
    // Padrões originais (mantidos)
    /paguei|pago|quitei|quitado|já paguei|paga|recebi|recebido/i,
    
    // ⭐ NOVOS: Expressões brasileiras de "pago"
    /resolvi|acertei|liquidei|saldei|finalizei|fechei/i,
    /zerei|matei (a conta)?|já era|tá pago|está pago/i,
    /já foi|resolvido|encerrei/i
  ],
  
  pending: [
    // Padrões originais (mantidos)
    /vou pagar|preciso pagar|devo|pendente|em aberto/i,
    
    // ⭐ NOVOS: Expressões brasileiras de "pendente"
    /tenho que pagar|falta pagar|ainda não paguei|esqueci de pagar/i,
    /tô devendo|tá devendo|está devendo|na agulha/i,
    /a pagar|pra pagar|para pagar|não pago/i,
    /vence (hoje|amanhã|essa semana)?|vencido|atrasado/i
  ]
};

// 🎨 PADRÕES DE CATEGORIA (para compatibilidade)
export const categoryPatterns = {
  alimentacao: [
    /comida|almoço|jantar|café|lanche|restaurante|padaria|mercado|supermercado/i,
    /ifood|rappi|delivery|pizza|hambúrguer|rango|bóia|larica/i,
    /mcdonalds|bk|burger king|habib|subway/i
  ],
  
  transporte: [
    /uber|99|taxi|ônibus|metrô|combustível|gasolina|álcool/i,
    /posto|estacionamento|pedágio|mecânico|corridinha|busão|gasosa/i,
    /buser|blablacar|corrida|viagem|abasteci/i
  ],
  
  saude: [
    /médico|farmácia|remédio|medicamento|hospital|consulta/i,
    /plano de saúde|dentista|exame|laboratório|convênio/i,
    /drogasil|pacheco|unimed|amil/i
  ],
  
  casa: [
    /aluguel|luz|energia|água|internet|telefone|celular|condomínio|iptu/i,
    /móveis|decoração|limpeza|a luz|a água|a net/i,
    /enel|light|sabesp|vivo|claro|tim|oi/i
  ],
  
  assinaturas: [
    /netflix|spotify|amazon prime|disney|hbo|youtube premium/i,
    /streaming|assinatura|mensalidade|plano|renovação/i,
    /apple tv|globoplay|paramount/i
  ],
  
  lazer: [
    /cinema|filme|ingresso|teatro|show|festa|balada|passeio|viagem/i,
    /hotel|airbnb|parque|rolê|role|cineminha|bailão/i
  ],
  
  trabalho: [
    /salário|freelance|freela|bico|projeto|serviço|consultoria/i,
    /honorário|cachê|comissão|bônus|vale|trampo/i
  ],
  
  educacao: [
    /escola|faculdade|curso|mensalidade|matrícula|livros|apostila/i,
    /cursinho|idiomas|inglês|professor|aula/i
  ],
  
  vestuario: [
    /roupa|calça|camisa|camiseta|vestido|sapato|tênis/i,
    /zara|renner|c&a|nike|adidas|look|fit/i
  ],
  
  beleza: [
    /salão|cabeleireiro|barbeiro|manicure|depilação|maquiagem/i,
    /cabelo|unha|make|spa|massagem/i
  ]
};

// 🔢 PADRÕES DE VALORES (para detecção)
export const amountPatterns = {
  digital: [
    /r\$\s*\d+(?:[.,]\d+)?/i,
    /\d+(?:[.,]\d+)?\s*(?:reais?|mil|milhão|milhões|k)/i
  ],
  
  slang: [
    /\d+\s*(?:pau|paus|conto|contos|pila|pilas|mango|mangos|prata)/i,
    /(?:um|uma|dois|duas|três|meio|meia)\s*(?:milão|barão|k)/i,
    /(?:uma onça|um peixe|um toco|cinquentão|vintão)/i
  ],
  
  written: [
    /(?:um|dois|três|quatro|cinco|dez|vinte|trinta|cinquenta|cem|mil)\s+(?:reais?|mil)?/i
  ]
};

// 📅 PADRÕES DE DATA (mantidos para compatibilidade)
export const datePatterns = {
  relative: [
    /hoje|agora|ontem|amanhã|depois de amanhã|anteontem/i,
    /essa semana|semana passada|próxima semana|semana que vem/i,
    /esse mês|mês passado|próximo mês|mês que vem/i
  ],
  
  absolute: [
    /\d{1,2}\/\d{1,2}\/\d{2,4}/,
    /\d{1,2} de (janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)/i,
    /dia \d{1,2}/i
  ]
};

// 🔄 PADRÕES DE RECORRÊNCIA (mantidos)
export const recurringPatterns = {
  frequency: [
    /todo (dia|dia útil|semana|mês|ano)/i,
    /diário|semanal|mensal|anual|bimestral|trimestral|semestral/i,
    /a cada \d+ (dia|semana|mês|ano)s?/i
  ],
  
  duration: [
    /por \d+ (mês|meses|ano|anos)/i,
    /durante \d+ (mês|meses|ano|anos)/i,
    /até (quando|o dia)/i
  ]
};

export default {
  intentPatterns,
  typePatterns,
  statusPatterns,
  categoryPatterns,
  amountPatterns,
  datePatterns,
  recurringPatterns
};```

## Componente: `./src/static/src/components/voice-command/core/CommandMapper.js`
```js
// ============================================
// COMMAND MAPPER - VERSÃO TURBINADA BRASILEIRA
// Gerador inteligente de perguntas contextuais
// ============================================

/**
 * ⭐ NOVO: Banco de perguntas variadas para não ser repetitivo
 */
const questionBank = {
  type: [
    "É uma entrada (receita) ou saída (despesa)?",
    "Isso é dinheiro que entrou ou saiu?",
    "Você recebeu ou gastou?",
    "É um ganho ou um gasto?",
    "Foi receita ou despesa?"
  ],
  
  amount: [
    "Qual o valor da transação?",
    "Quanto foi?",
    "Qual o valor disso?",
    "Quantos reais?",
    "Me diz o valor?"
  ],
  
  description: [
    "Pode me dar mais detalhes sobre essa transação?",
    "Me conta mais sobre isso?",
    "O que foi exatamente?",
    "Pode descrever melhor?",
    "Qual a descrição?"
  ],
  
  category: [
    "Qual a categoria dessa transação?",
    "Isso se encaixa em qual categoria?",
    "É de qual tipo de despesa/receita?",
    "Em que categoria você quer classificar?"
  ],
  
  date: [
    "Quando foi isso?",
    "Qual a data dessa transação?",
    "Foi hoje ou outro dia?",
    "Pode me dizer quando aconteceu?"
  ],
  
  status: [
    "Você já pagou ou ainda vai pagar?",
    "Está pago ou pendente?",
    "Já foi quitado?",
    "Essa conta já foi paga?"
  ]
};

/**
 * ⭐ NOVO: Perguntas contextuais inteligentes baseadas no que já foi dito
 */
const contextualQuestions = {
  type: {
    hasAmount: {
      high: "Você recebeu ou gastou esses {amount}?",
      low: "Esses {amount} entraram ou saíram?"
    },
    hasCategory: {
      alimentacao: "Foi uma compra de comida ou você vendeu algo?",
      transporte: "Você pagou essa corrida ou foi um reembolso?",
      trabalho: "É o seu salário ou um pagamento que você fez?"
    }
  },
  
  amount: {
    hasType: {
      expense: "Quanto você gastou?",
      income: "Quanto você recebeu?"
    },
    hasCategory: {
      alimentacao: "Quanto gastou com comida?",
      transporte: "Quanto foi essa corrida/combustível?",
      assinaturas: "Qual o valor da assinatura?"
    },
    hasDescription: "Quanto foi esse \"{description}\"?"
  },
  
  description: {
    hasType: {
      expense: "Com o que você gastou?",
      income: "De onde veio esse dinheiro?"
    },
    hasCategory: {
      alimentacao: "Onde você comeu? Ou o que comprou?",
      transporte: "Foi Uber, 99, ou gasolina?",
      saude: "Foi médico, farmácia, ou exame?",
      assinaturas: "Qual serviço você pagou?"
    },
    hasAmount: "Me fala mais sobre essa transação de {amount}?"
  },
  
  category: {
    hasDescription: {
      patterns: [
        { match: /ifood|rappi|delivery|restaurante|comida/i, suggest: "Parece ser Alimentação, confirma?" },
        { match: /uber|99|taxi|gasolina|combustível/i, suggest: "Parece ser Transporte, tá certo?" },
        { match: /netflix|spotify|prime|hbo/i, suggest: "É uma Assinatura?" },
        { match: /médico|farmácia|remédio|hospital/i, suggest: "É Saúde?" },
        { match: /luz|água|internet|telefone|aluguel/i, suggest: "É conta de Casa?" }
      ]
    }
  },
  
  date: {
    hasAmount: "Quando foi essa transação de {amount}?",
    hasType: {
      expense: "Quando você fez esse gasto?",
      income: "Quando você recebeu?"
    },
    default: "Foi hoje, ontem, ou outro dia?"
  },
  
  status: {
    hasType: {
      expense: "Você já pagou ou ainda vai pagar?",
      income: "Você já recebeu esse dinheiro?"
    },
    hasDate: {
      future: "Você vai pagar quando chegar a data?",
      past: "Essa conta do dia {date} já foi paga?",
      today: "Você já pagou hoje ou ainda vai pagar?"
    }
  }
};

/**
 * ⭐ NOVO: Respostas amigáveis após receber informação
 */
const acknowledgments = {
  type: {
    expense: ["Entendi, é uma despesa.", "Ok, gasto anotado.", "Certo, saída registrada."],
    income: ["Entendi, é uma receita.", "Legal, entrada anotada.", "Ótimo, ganho registrado."]
  },
  
  amount: [
    "Anotado o valor de {amount}.",
    "Ok, {amount} registrado.",
    "Perfeito, {amount}.",
    "Entendi, {amount}."
  ],
  
  description: [
    "Descrição salva: \"{description}\".",
    "Ok, anotei: \"{description}\".",
    "Certo: \"{description}\"."
  ],
  
  category: [
    "Classificado como {category}.",
    "Ok, categoria {category}.",
    "Anotado em {category}."
  ],
  
  date: [
    "Data registrada: {date}.",
    "Ok, para o dia {date}.",
    "Anotado para {date}."
  ],
  
  status: {
    paid: ["Marcado como pago.", "Ok, conta quitada.", "Registrado como pago."],
    pending: ["Marcado como pendente.", "Ok, fica na lista de contas a pagar.", "Anotado como não pago ainda."]
  }
};

/**
 * ⭐ NOVO: Sugestões inteligentes baseadas em padrões comuns
 */
const smartSuggestions = {
  amount: {
    round: (value) => {
      if (value % 10 === 0 && value < 1000) {
        return `Confirma ${value} reais?`;
      }
      return null;
    }
  },
  
  category: {
    byAmount: (amount) => {
      if (amount < 50) return "Parece ser algo pequeno, tipo lanche ou transporte?";
      if (amount < 200) return "Pode ser compras no mercado ou combustível?";
      if (amount < 500) return "É alguma conta maior, tipo luz, água ou internet?";
      if (amount > 1000) return "Parece ser algo significativo, tipo aluguel ou salário?";
      return null;
    }
  }
};

/**
 * ⭐ NOVO: Dicas para ajudar o usuário a fornecer informações
 */
const helpfulTips = {
  type: "Dica: Diga 'gastei' para despesas ou 'recebi' para receitas.",
  amount: "Dica: Pode falar '50 reais', 'cinquenta pau', ou só '50'.",
  description: "Dica: Seja breve, tipo 'mercado', 'uber', 'netflix'.",
  category: "Dica: Temos categorias como Alimentação, Transporte, Saúde, Casa...",
  date: "Dica: Pode dizer 'hoje', 'ontem', 'dia 15', ou uma data específica.",
  status: "Dica: Diga 'já paguei' ou 'vou pagar depois'."
};

// ==========================================
// FUNÇÃO PRINCIPAL
// ==========================================

/**
 * Gera pergunta inteligente baseada no campo faltante e contexto
 * 
 * @param {string} field - Campo faltante (type, amount, description, etc)
 * @param {Object} transaction - Objeto de transação com dados parciais
 * @param {Object} options - Opções adicionais
 * @returns {string} - Pergunta contextual
 */
export const generateQuestion = (field, transaction = {}, options = {}) => {
  const {
    useContextual = true,
    includeAcknowledgment = false,
    includeTip = false,
    variateQuestions = true
  } = options;

  // Se deve incluir reconhecimento de campo anterior
  let question = "";
  if (includeAcknowledgment && transaction.lastFieldFilled) {
    const ack = generateAcknowledgment(transaction.lastFieldFilled, transaction);
    if (ack) question += ack + " ";
  }

  // Gera a pergunta principal
  if (useContextual) {
    question += generateContextualQuestion(field, transaction);
  } else {
    question += generateBasicQuestion(field, variateQuestions);
  }

  // Adiciona dica se solicitado
  if (includeTip) {
    question += "\n\n" + (helpfulTips[field] || "");
  }

  return question;
};

/**
 * ⭐ NOVO: Gera pergunta contextual inteligente
 */
const generateContextualQuestion = (field, transaction) => {
  const ctx = contextualQuestions[field];
  if (!ctx) return generateBasicQuestion(field);

  // Verifica contextos disponíveis e gera pergunta mais específica
  
  // Para TYPE
  if (field === 'type') {
    if (transaction.amount) {
      const amountFormatted = formatCurrency(transaction.amount);
      const question = transaction.amount > 500 
        ? ctx.hasAmount.high 
        : ctx.hasAmount.low;
      return question.replace('{amount}', amountFormatted);
    }
    if (transaction.category) {
      const categoryQuestion = ctx.hasCategory[transaction.category.slug];
      if (categoryQuestion) return categoryQuestion;
    }
  }

  // Para AMOUNT
  if (field === 'amount') {
    if (transaction.type) {
      return ctx.hasType[transaction.type];
    }
    if (transaction.category) {
      const categoryQuestion = ctx.hasCategory[transaction.category.slug];
      if (categoryQuestion) return categoryQuestion;
    }
    if (transaction.description) {
      return ctx.hasDescription.replace('{description}', transaction.description);
    }
  }

  // Para DESCRIPTION
  if (field === 'description') {
    if (transaction.type) {
      return ctx.hasType[transaction.type];
    }
    if (transaction.category) {
      const categoryQuestion = ctx.hasCategory[transaction.category.slug];
      if (categoryQuestion) return categoryQuestion;
    }
    if (transaction.amount) {
      return ctx.hasAmount.replace('{amount}', formatCurrency(transaction.amount));
    }
  }

  // Para CATEGORY
  if (field === 'category' && transaction.description) {
    for (const pattern of ctx.hasDescription.patterns) {
      if (pattern.match.test(transaction.description)) {
        return pattern.suggest;
      }
    }
  }

  // Para DATE
  if (field === 'date') {
    if (transaction.amount) {
      return ctx.hasAmount.replace('{amount}', formatCurrency(transaction.amount));
    }
    if (transaction.type) {
      return ctx.hasType[transaction.type];
    }
    return ctx.default;
  }

  // Para STATUS
  if (field === 'status') {
    if (transaction.type) {
      return ctx.hasType[transaction.type];
    }
    if (transaction.date) {
      const dateStatus = getDateStatus(transaction.date);
      const dateFormatted = formatDate(transaction.date);
      return ctx.hasDate[dateStatus]?.replace('{date}', dateFormatted) || ctx.hasDate.today;
    }
  }

  // Fallback para pergunta básica
  return generateBasicQuestion(field);
};

/**
 * Gera pergunta básica (sem contexto)
 */
const generateBasicQuestion = (field, variate = true) => {
  const questions = questionBank[field];
  if (!questions) return "Preciso de mais informações.";

  if (variate) {
    // Retorna pergunta aleatória do banco
    const randomIndex = Math.floor(Math.random() * questions.length);
    return questions[randomIndex];
  }

  // Retorna sempre a primeira (mais formal)
  return questions[0];
};

/**
 * ⭐ NOVO: Gera reconhecimento do campo anterior preenchido
 */
const generateAcknowledgment = (field, transaction) => {
  const acks = acknowledgments[field];
  if (!acks) return "";

  if (Array.isArray(acks)) {
    const randomAck = acks[Math.floor(Math.random() * acks.length)];
    return randomAck
      .replace('{amount}', formatCurrency(transaction.amount))
      .replace('{description}', transaction.description)
      .replace('{category}', transaction.category?.name || transaction.category)
      .replace('{date}', formatDate(transaction.date));
  }

  // Para campos com opções (type, status)
  if (typeof acks === 'object' && transaction[field]) {
    const specificAcks = acks[transaction[field]];
    if (specificAcks && Array.isArray(specificAcks)) {
      return specificAcks[Math.floor(Math.random() * specificAcks.length)];
    }
  }

  return "";
};

/**
 * ⭐ NOVO: Gera sugestão inteligente baseada nos dados
 */
export const generateSmartSuggestion = (field, transaction) => {
  if (field === 'amount' && transaction.amount) {
    return smartSuggestions.amount.round(transaction.amount);
  }

  if (field === 'category' && transaction.amount) {
    return smartSuggestions.category.byAmount(transaction.amount);
  }

  return null;
};

/**
 * Gera mensagem de confirmação final antes de salvar
 */
export const generateConfirmationMessage = (transaction) => {
  const parts = [];
  
  // Tipo
  const typeText = transaction.type === 'expense' ? 'Despesa' : 'Receita';
  parts.push(`**${typeText}**`);
  
  // Valor
  if (transaction.amount) {
    parts.push(`de **${formatCurrency(transaction.amount)}**`);
  }
  
  // Descrição
  if (transaction.description) {
    parts.push(`"${transaction.description}"`);
  }
  
  // Categoria
  if (transaction.category) {
    const catName = transaction.category.name || transaction.category;
    parts.push(`em **${catName}**`);
  }
  
  // Data
  if (transaction.date) {
    parts.push(`para **${formatDate(transaction.date)}**`);
  }
  
  // Status
  if (transaction.status) {
    const statusText = transaction.status === 'paid' ? 'já paga' : 'pendente';
    parts.push(`(${statusText})`);
  }

  return `Vou registrar: ${parts.join(' ')}. Confirma?`;
};

/**
 * Gera mensagem de sucesso após salvar
 */
export const generateSuccessMessage = (transaction) => {
  const typeText = transaction.type === 'expense' ? 'Despesa' : 'Receita';
  const amount = formatCurrency(transaction.amount);
  
  const messages = [
    `${typeText} de ${amount} registrada com sucesso! ✅`,
    `Pronto! ${typeText} de ${amount} salva.`,
    `${typeText} criada: ${amount}. Tudo certo! 👍`,
    `Feito! ${typeText} de ${amount} está no sistema.`
  ];

  return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Gera mensagem de erro amigável
 */
export const generateErrorMessage = (error) => {
  const errorMessages = {
    'network': 'Ops! Problema de conexão. Tenta de novo?',
    'validation': 'Alguns dados não estão corretos. Vamos revisar?',
    'server': 'Erro no servidor. Aguarda um momento e tenta novamente.',
    'default': 'Algo deu errado. Pode tentar de novo?'
  };

  return errorMessages[error.type] || errorMessages.default;
};

// ==========================================
// UTILITÁRIOS DE FORMATAÇÃO
// ==========================================

/**
 * Formata valor monetário
 */
const formatCurrency = (value) => {
  if (!value) return "R$ 0,00";
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * Formata data de forma amigável
 */
const formatDate = (date) => {
  if (!date) return "";
  
  const dateObj = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Compara apenas dia/mês/ano
  const isSameDay = (d1, d2) => {
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
  };

  if (isSameDay(dateObj, today)) return "hoje";
  if (isSameDay(dateObj, yesterday)) return "ontem";
  if (isSameDay(dateObj, tomorrow)) return "amanhã";

  // Formato DD/MM/YYYY
  return dateObj.toLocaleDateString('pt-BR');
};

/**
 * Retorna status da data (passado, presente, futuro)
 */
const getDateStatus = (date) => {
  if (!date) return 'today';
  
  const dateObj = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dateObj.setHours(0, 0, 0, 0);

  if (dateObj < today) return 'past';
  if (dateObj > today) return 'future';
  return 'today';
};

// ==========================================
// MAPEAMENTO DE COMANDOS PARA AÇÕES
// ==========================================

/**
 * Mapeia comando do usuário para ação do sistema
 */
export const mapCommandToAction = (intent, transaction) => {
  const actionMap = {
    'create_transaction': {
      action: 'create',
      endpoint: '/api/transactions',
      method: 'POST'
    },
    'schedule_transaction': {
      action: 'schedule',
      endpoint: '/api/transactions/recurring',
      method: 'POST'
    },
    'list_transactions': {
      action: 'list',
      endpoint: '/api/transactions',
      method: 'GET'
    },
    'update_transaction': {
      action: 'update',
      endpoint: `/api/transactions/${transaction?.id}`,
      method: 'PUT'
    },
    'delete_transaction': {
      action: 'delete',
      endpoint: `/api/transactions/${transaction?.id}`,
      method: 'DELETE'
    }
  };

  return actionMap[intent] || null;
};

/**
 * Valida se transação está completa para ser salva
 */
export const validateTransaction = (transaction) => {
  const required = ['type', 'amount', 'description', 'date'];
  const missing = required.filter(field => !transaction[field]);
  
  return {
    isValid: missing.length === 0,
    missingFields: missing
  };
};

// ==========================================
// EXPORTAÇÕES
// ==========================================

export default {
  generateQuestion,
  generateSmartSuggestion,
  generateConfirmationMessage,
  generateSuccessMessage,
  generateErrorMessage,
  mapCommandToAction,
  validateTransaction,
  questionBank,
  contextualQuestions,
  acknowledgments,
  smartSuggestions,
  helpfulTips
};
```

## Componente: `./src/static/src/components/voice-command/core/NLPProcessor.js`
```js
import { extractAmount } from "../extractors/AmountExtractor";
import { findBestCategory } from "../extractors/CategoryExtractor";
import { extractDate } from "../extractors/DateExtractor";
import { extractDescription } from "../extractors/DescriptionExtractor";
import { extractIntent } from "../extractors/IntentExtractor";
import { extractRecurring } from "../extractors/RecurringExtractor";
import { extractStatus } from "../extractors/StatusExtractor";
import { extractTransactionType } from "../extractors/TransactionTypeExtractor";
import { identifyMissingFields } from "../validators/MissingFieldsIdentifier";
import { formatISO } from "../formatters/DateFormatter";

// ============================================
// NLP PROCESSOR - VERSÃO TURBINADA BRASILEIRA
// Sistema inteligente que entende gírias e contexto
// ============================================

class VoiceNLPProcessor {
  constructor(categories = []) {
    this.categories = categories;
    this.conversationHistory = [];
    this.userPatterns = {}; // Aprende padrões do usuário
    this.contextStack = []; // Pilha de contexto conversacional
  }

  // ==========================================
  // PROCESSAMENTO PRINCIPAL
  // ==========================================

  /**
   * Processa comando de voz com análise contextual
   */
  processCommand(command, context) {
    const normalizedCommand = this.normalizeCommand(command);
    
    // Adiciona ao histórico conversacional
    this.addToHistory(command, normalizedCommand);
    
    // Análise completa
    const analysis = {
      originalCommand: command,
      normalizedCommand,
      intent: extractIntent(normalizedCommand),
      type: extractTransactionType(normalizedCommand),
      amount: extractAmount(normalizedCommand),
      description: extractDescription(normalizedCommand),
      date: extractDate(normalizedCommand),
      status: extractStatus(normalizedCommand),
      category: findBestCategory(normalizedCommand, this.categories),
      recurring: extractRecurring(normalizedCommand),
      confidence: 0,
      
      // ⭐ NOVOS CAMPOS
      slangDetected: this.detectSlangUsage(normalizedCommand),
      contextEnhanced: false,
      userPatternMatch: this.matchUserPattern(normalizedCommand)
    };

    // ⭐ NOVO: Enriquecimento contextual
    const enhancedAnalysis = this.enhanceWithContext(analysis, context);

    // Calcula confiança
    enhancedAnalysis.confidence = this.calculateConfidence(enhancedAnalysis);
    
    // Constrói objeto final
    const transaction = this.buildTransactionObject(enhancedAnalysis, context);

    // ⭐ NOVO: Aprende padrões do usuário
    this.learnUserPattern(enhancedAnalysis);

    return transaction;
  }

  // ==========================================
  // NORMALIZAÇÃO AVANÇADA
  // ==========================================

  /**
   * ⭐ MELHORADO: Normalização mais inteligente
   */
  normalizeCommand(command) {
    let normalized = command
      .toLowerCase()
      .trim();

    // Remove pontuação mas preserva vírgulas em valores
    // Ex: "1,50" deve permanecer, mas "olá," vira "olá"
    normalized = normalized.replace(/([^\d]),/g, '$1 '); // Vírgula após não-dígito
    normalized = normalized.replace(/,([^\d])/g, ' $1'); // Vírgula antes de não-dígito
    normalized = normalized.replace(/[.!?;]/g, ' ');
    
    // Normaliza espaços múltiplos
    normalized = normalized.replace(/\s+/g, ' ');

    // ⭐ NOVO: Expande contrações brasileiras comuns
    normalized = this.expandContractions(normalized);

    // ⭐ NOVO: Corrige erros comuns de reconhecimento de voz
    normalized = this.fixCommonVoiceErrors(normalized);

    return normalized.trim();
  }

  /**
   * ⭐ NOVO: Expande contrações brasileiras
   */
  expandContractions(text) {
    const contractions = {
      'tô': 'estou',
      'tá': 'está',
      'cê': 'você',
      'pra': 'para',
      'pro': 'para o',
      'vc': 'você',
      'vlw': 'valeu',
      'blz': 'beleza',
      'tmj': 'tamo junto',
      'vcs': 'vocês'
    };

    let expanded = text;
    for (const [contraction, full] of Object.entries(contractions)) {
      const regex = new RegExp(`\\b${contraction}\\b`, 'gi');
      expanded = expanded.replace(regex, full);
    }

    return expanded;
  }

  /**
   * ⭐ NOVO: Corrige erros comuns de reconhecimento de voz
   */
  fixCommonVoiceErrors(text) {
    const corrections = {
      // Valores monetários
      'cincuenta': 'cinquenta',
      'sescenta': 'sessenta',
      'cetenta': 'setenta',
      'oitenta': 'oitenta',
      
      // Gírias de dinheiro
      'pão': 'pau', // "50 pão" → "50 pau"
      'cinto': 'conto',
      'pena': 'pila',
      
      // Categorias
      'ifi': 'ifood',
      'uber': 'uber',
      'notflix': 'netflix',
      'ispotify': 'spotify',
      
      // Verbos comuns
      'torrei': 'torrei',
      'queimei': 'queimei',
      'gastei': 'gastei'
    };

    let fixed = text;
    for (const [error, correction] of Object.entries(corrections)) {
      const regex = new RegExp(`\\b${error}\\b`, 'gi');
      fixed = fixed.replace(regex, correction);
    }

    return fixed;
  }

  // ==========================================
  // DETECÇÃO E ANÁLISE DE GÍRIAS
  // ==========================================

  /**
   * ⭐ NOVO: Detecta quais gírias foram usadas no comando
   */
  detectSlangUsage(command) {
    const detected = {
      money: [],
      transaction: [],
      category: [],
      status: []
    };

    const cmd = command.toLowerCase();

    // Gírias de dinheiro
    const moneySlang = ['pau', 'conto', 'pila', 'mango', 'prata', 'milão', 'k', 'barão', 'onça', 'peixe', 'toco'];
    detected.money = moneySlang.filter(slang => cmd.includes(slang));

    // Gírias de transação
    const transactionSlang = ['torrei', 'queimei', 'fritei', 'pingou', 'caiu', 'garimpei'];
    detected.transaction = transactionSlang.filter(slang => cmd.includes(slang));

    // Gírias de categoria
    const categorySlang = ['rango', 'bóia', 'larica', 'corridinha', 'busão', 'rolê'];
    detected.category = categorySlang.filter(slang => cmd.includes(slang));

    // Gírias de status
    const statusSlang = ['zerei', 'matei', 'já era', 'tô devendo', 'na agulha'];
    detected.status = statusSlang.filter(slang => cmd.includes(slang));

    return detected;
  }

  // ==========================================
  // ENRIQUECIMENTO CONTEXTUAL
  // ==========================================

  /**
   * ⭐ NOVO: Enriquece análise com contexto conversacional
   */
  enhanceWithContext(analysis, context) {
    const enhanced = { ...analysis };

    // Se não encontrou tipo, tenta inferir do contexto
    if (!enhanced.type && this.contextStack.length > 0) {
      const lastContext = this.contextStack[this.contextStack.length - 1];
      if (lastContext.type) {
        enhanced.type = lastContext.type;
        enhanced.contextEnhanced = true;
      }
    }

    // Se não encontrou categoria, tenta inferir da descrição
    if (!enhanced.category && enhanced.description) {
      enhanced.category = findBestCategory(enhanced.description, this.categories);
      if (enhanced.category) {
        enhanced.contextEnhanced = true;
      }
    }

    // Se tem valor mas não tem tipo, infere pelo verbo
    if (enhanced.amount && !enhanced.type) {
      if (analysis.normalizedCommand.match(/gastei|paguei|comprei|torrei/i)) {
        enhanced.type = 'expense';
        enhanced.contextEnhanced = true;
      } else if (analysis.normalizedCommand.match(/recebi|ganhei|faturei/i)) {
        enhanced.type = 'income';
        enhanced.contextEnhanced = true;
      }
    }

    // Atualiza pilha de contexto
    this.updateContextStack(enhanced);

    return enhanced;
  }

  /**
   * ⭐ NOVO: Atualiza pilha de contexto conversacional
   */
  updateContextStack(analysis) {
    const context = {
      timestamp: new Date(),
      type: analysis.type,
      category: analysis.category?.slug,
      amount: analysis.amount
    };

    this.contextStack.push(context);

    // Mantém apenas últimos 5 contextos
    if (this.contextStack.length > 5) {
      this.contextStack.shift();
    }
  }

  // ==========================================
  // SISTEMA DE APRENDIZADO
  // ==========================================

  /**
   * ⭐ NOVO: Aprende padrões do usuário
   */
  learnUserPattern(analysis) {
    // Se o comando foi bem-sucedido (alta confiança), salva o padrão
    if (analysis.confidence > 0.7) {
      const pattern = {
        command: analysis.normalizedCommand,
        type: analysis.type,
        category: analysis.category?.slug,
        timestamp: new Date()
      };

      // Cria hash simples do comando para indexação
      const hash = this.hashCommand(analysis.normalizedCommand);
      
      if (!this.userPatterns[hash]) {
        this.userPatterns[hash] = [];
      }

      this.userPatterns[hash].push(pattern);

      // Mantém apenas últimos 10 padrões por hash
      if (this.userPatterns[hash].length > 10) {
        this.userPatterns[hash].shift();
      }
    }
  }

  /**
   * ⭐ NOVO: Verifica se comando casa com padrão conhecido do usuário
   */
  matchUserPattern(command) {
    const hash = this.hashCommand(command);
    const patterns = this.userPatterns[hash];

    if (!patterns || patterns.length === 0) {
      return null;
    }

    // Retorna padrão mais recente
    return patterns[patterns.length - 1];
  }

  /**
   * ⭐ NOVO: Cria hash simples do comando
   */
  hashCommand(command) {
    // Remove valores e mantém só a estrutura
    const structure = command
      .replace(/\d+/g, 'NUM')
      .replace(/\b(pau|conto|pila|mango|k|milão|barão)\b/g, 'MONEY')
      .replace(/\b(reais?|r\$)\b/g, 'CURRENCY');
    
    return structure;
  }

  // ==========================================
  // HISTÓRICO CONVERSACIONAL
  // ==========================================

  /**
   * ⭐ NOVO: Adiciona comando ao histórico
   */
  addToHistory(original, normalized) {
    this.conversationHistory.push({
      original,
      normalized,
      timestamp: new Date()
    });

    // Mantém apenas últimos 20 comandos
    if (this.conversationHistory.length > 20) {
      this.conversationHistory.shift();
    }
  }

  /**
   * ⭐ NOVO: Retorna histórico conversacional
   */
  getHistory() {
    return this.conversationHistory;
  }

  // ==========================================
  // CÁLCULO DE CONFIANÇA AVANÇADO
  // ==========================================

  /**
   * ⭐ MELHORADO: Cálculo de confiança mais sofisticado
   */
  calculateConfidence(analysis) {
    let confidence = 0;
    
    // Pesos básicos
    const baseWeights = {
      intent: 0.05,
      type: 0.20,
      amount: 0.30,
      description: 0.15,
      date: 0.10,
      category: 0.15,
      status: 0.05
    };
    
    // Calcula confiança base
    if (analysis.intent) confidence += baseWeights.intent;
    if (analysis.type) confidence += baseWeights.type;
    if (analysis.amount) confidence += baseWeights.amount;
    if (analysis.description) confidence += baseWeights.description;
    if (analysis.date) confidence += baseWeights.date;
    if (analysis.category) confidence += baseWeights.category;
    if (analysis.status) confidence += baseWeights.status;

    // ⭐ NOVO: Bônus por uso de gírias (indica naturalidade)
    const totalSlang = Object.values(analysis.slangDetected).reduce((acc, arr) => acc + arr.length, 0);
    if (totalSlang > 0) {
      confidence += 0.05; // Bônus de 5%
    }

    // ⭐ NOVO: Bônus por enriquecimento contextual
    if (analysis.contextEnhanced) {
      confidence += 0.05; // Bônus de 5%
    }

    // ⭐ NOVO: Bônus por match com padrão do usuário
    if (analysis.userPatternMatch) {
      confidence += 0.10; // Bônus de 10%
    }

    // Garante que confiança fica entre 0 e 1
    return Math.min(confidence, 1.0);
  }

  // ==========================================
  // CONSTRUÇÃO DO OBJETO DE TRANSAÇÃO
  // ==========================================

  /**
   * Constrói objeto final de transação
   */
  buildTransactionObject(analysis, context) {
    return {
      intent: analysis.intent,
      entities: {
        context: context,
        type: analysis.type,
        amount: analysis.amount,
        description: analysis.description,
        date: analysis.date ? formatISO(analysis.date) : formatISO(new Date()),
        due_date: analysis.date ? formatISO(analysis.date) : formatISO(new Date()),
        status: analysis.status,
        category_id: analysis.category ? String(analysis.category.id || analysis.category._id) : null,
        is_recurring: analysis.recurring?.is_recurring || false,
        recurring_day: analysis.recurring?.recurring_day || null
      },
      originalCommand: analysis.originalCommand,
      confidence: analysis.confidence,
      missing_fields: identifyMissingFields(analysis),
      
      // ⭐ NOVOS METADADOS
      metadata: {
        slangUsed: analysis.slangDetected,
        contextEnhanced: analysis.contextEnhanced,
        userPatternMatched: !!analysis.userPatternMatch,
        processingTimestamp: new Date().toISOString()
      }
    };
  }

  // ==========================================
  // UTILIDADES PÚBLICAS
  // ==========================================

  /**
   * Limpa histórico e padrões aprendidos
   */
  reset() {
    this.conversationHistory = [];
    this.userPatterns = {};
    this.contextStack = [];
  }

  /**
   * Exporta padrões aprendidos (para salvar no DB)
   */
  exportLearnedPatterns() {
    return {
      patterns: this.userPatterns,
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Importa padrões aprendidos (do DB)
   */
  importLearnedPatterns(data) {
    if (data && data.patterns) {
      this.userPatterns = data.patterns;
    }
  }
}

export default VoiceNLPProcessor;
```

## Componente: `./src/static/src/components/voice-command/extractors/AmountExtractor.js`
```js
import { numbersMap, multipliers } from '../constants/numberMaps';
import { moneySlang } from '../constants/brazilianSlangDictionary';

// ============================================
// AMOUNT EXTRACTOR - VERSÃO COMPLETA
// Original + Sistema Brasileiro de Gírias
// ============================================

// ==========================================
// FUNÇÕES ORIGINAIS (mantidas 100%)
// ==========================================

const extractSpecialCases = (command) => {
  const specialPatterns = [
    { pattern: /meio milhão|meia milhão/i, value: 500000 },
    { pattern: /meio bilhão|meia bilhão/i, value: 500000000 },
    { pattern: /meio trilhão|meia trilhão/i, value: 500000000000 },
    { pattern: /um quarto de milhão/i, value: 250000 },
    { pattern: /três quartos de milhão/i, value: 750000 },
    { pattern: /dois terços de milhão/i, value: 666666.67 }
  ];

  for (const { pattern, value } of specialPatterns) {
    if (pattern.test(command)) {
      return value;
    }
  }
  return null;
};

const normalizeDigitalValue = (valueStr, multiplierStr = null) => {
  valueStr = valueStr.trim();
  let numericValue = 0;

  if (valueStr.includes(',') && valueStr.includes('.')) {
    numericValue = parseFloat(valueStr.replace(/\./g, '').replace(',', '.'));
  } else if (valueStr.includes(',')) {
    const parts = valueStr.split(',');
    if (parts[1].length <= 2) {
      numericValue = parseFloat(valueStr.replace(',', '.'));
    } else {
      numericValue = parseFloat(valueStr.replace(/,/g, ''));
    }
  } else if (valueStr.includes('.')) {
    const parts = valueStr.split('.');
    if (parts.length === 2 && parts[1].length <= 2 && parts[0].length <= 3) {
      numericValue = parseFloat(valueStr);
    } else {
      numericValue = parseFloat(valueStr.replace(/\./g, ''));
    }
  } else {
    numericValue = parseFloat(valueStr);
  }

  if (multiplierStr && multipliers[multiplierStr.toLowerCase()]) {
    const multiplier = multipliers[multiplierStr.toLowerCase()];
    numericValue *= multiplier;
  }
  return isNaN(numericValue) ? null : numericValue;
};

const extractDigitalPatterns = (command) => {
  const digitalPatterns = [
    /(?:r\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{1,2})\s*(?:reais?)?/i,
    /(?:r\$\s*)?(\d+(?:[.,]\d+)?)\s*(mil|milhão|milhões|milhao|milhoes|bilhão|bilhões|bilhao|bilhoes|trilhão|trilhões|trilhao|trilhoes)/i,
    /(?:r\$\s*)?(\d{1,3}(?:\.\d{3})+)(?!\s*vírgula|\s*,)/i,
    /(?:r\$\s*)?(\d+\.\d{3})(?!\d)/i,
    /(?:r\$\s*)?(\d+,\d{1,2})/i,
    /(\d+(?:[.,]\d+)?)\s*(?:reais?|r\$)/i,
    /(?:r\$\s*)?(\d+(?:\.\d{1,2})?)/i
  ];

  for (let i = 0; i < digitalPatterns.length; i++) {
    const pattern = digitalPatterns[i];
    const match = command.match(pattern);
    if (match) {
      let valueStr = match[1];
      const multiplierStr = match[2];
      const normalizedValue = normalizeDigitalValue(valueStr, multiplierStr);
      if (normalizedValue !== null) {
        return normalizedValue;
      }
    }
  }
  return null;
};

const convertWordsToNumber = (text) => {
  if (!text) return null;
  const words = text.toLowerCase().split(/\s+/);
  let total = 0;
  let current = 0;

  for (const word of words) {
    if (numbersMap[word] !== undefined) {
      if (numbersMap[word] === 100) {
        current = current === 0 ? 100 : current * 100;
      } else {
        current += numbersMap[word];
      }
    } else if (multipliers[word]) {
      if (current === 0) current = 1;
      total += current * multipliers[word];
      current = 0;
    }
  }
  return total + current || null;
};

const parseComplexWordsToNumber = (match) => {
  let total = 0;
  for (let i = 1; i < match.length; i += 2) {
    const numberPart = match[i];
    const multiplierPart = match[i + 1];
    if (!numberPart) continue;
    const baseNumber = convertWordsToNumber(numberPart);
    if (!baseNumber) continue;
    if (multiplierPart) {
      const multiplier = multipliers[multiplierPart.toLowerCase()];
      if (multiplier) {
        total += baseNumber * multiplier;
      }
    } else {
      total += baseNumber;
    }
  }
  return total > 0 ? total : null;
};

const extractAmountFromWords = (command) => {
  const wordPatterns = [
    /(\w+(?:\s+\w+)*?)\s+(trilhões?|trilhoes?)\s*(?:e\s+(\w+(?:\s+\w+)*?)\s+(bilhões?|bilhoes?))?\s*(?:e\s+(\w+(?:\s+\w+)*?)\s+(milhões?|milhoes?))?\s*(?:e\s+(\w+(?:\s+\w+)*?)\s+mil)?\s*(?:e\s+(\w+(?:\s+\w+)*?))?/i,
    /(\w+(?:\s+\w+)*?)\s+(bilhões?|bilhoes?)\s*(?:e\s+(\w+(?:\s+\w+)*?)\s+(milhões?|milhoes?))?\s*(?:e\s+(\w+(?:\s+\w+)*?)\s+mil)?\s*(?:e\s+(\w+(?:\s+\w+)*?))?/i,
    /(\w+(?:\s+\w+)*?)\s+(milhões?|milhoes?)\s*(?:e\s+(\w+(?:\s+\w+)*?)\s+mil)?\s*(?:e\s+(\w+(?:\s+\w+)*?))?/i,
    /(\w+(?:\s+\w+)*?)\s+mil\s*(?:e\s+(\w+(?:\s+\w+)*?))?/i,
    /^(\w+(?:\s+\w+)*?)$/i
  ];

  for (const pattern of wordPatterns) {
    const match = command.match(pattern);
    if (match) {
      const value = parseComplexWordsToNumber(match);
      if (value !== null && value > 0) {
        return value;
      }
    }
  }
  return null;
};

// ==========================================
// NOVAS FUNÇÕES - SISTEMA BRASILEIRO
// ==========================================

/**
 * ⭐ NOVO: Extrai valores de notas específicas
 * Ex: "uma onça" = R$ 50, "um peixe" = R$ 100, "um toco" = R$ 100
 */
const extractSpecificNotes = (command) => {
  const cmd = command.toLowerCase();
  
  for (const [slang, value] of Object.entries(moneySlang.specificNotes)) {
    if (cmd.includes(slang)) {
      // Verifica se tem quantidade antes (ex: "duas onças")
      const quantityPattern = new RegExp(`(\\w+)\\s+${slang.replace(/[()]/g, '\\$&')}`, 'i');
      const match = cmd.match(quantityPattern);
      
      if (match) {
        const quantity = convertWordsToNumber(match[1]) || 1;
        return value * quantity;
      }
      return value;
    }
  }
  return null;
};

/**
 * ⭐ NOVO: Extrai gírias brasileiras de dinheiro
 * Ex: "cinquenta pau", "dez conto", "vinte pila", "cem mangos"
 */
const extractBrazilianSlang = (command) => {
  const cmd = command.toLowerCase();
  
  // Padrão 1: [número] + [gíria básica]
  // Ex: "50 pau", "dez conto", "vinte pila"
  const basicSlangPattern = /(\d+|um|uma|dois|duas|três|quatro|cinco|seis|sete|oito|nove|dez|vinte|trinta|quarenta|cinquenta|sessenta|setenta|oitenta|noventa|cem|duzentos|trezentos|quatrocentos|quinhentos)\s*(pau|paus|conto|contos|pila|pilas|mango|mangos|prata|pratas|grana|dindin)/gi;
  
  let match = cmd.match(basicSlangPattern);
  if (match) {
    const parts = match[0].split(/\s+/);
    const numberPart = parts[0];
    const slangPart = parts[1];
    
    // Converte o número (pode ser palavra ou dígito)
    let value = parseFloat(numberPart);
    if (isNaN(value)) {
      value = convertWordsToNumber(numberPart);
    }
    
    // Aplica o multiplicador da gíria (geralmente 1)
    if (value && moneySlang.basicUnits[slangPart]) {
      return value * moneySlang.basicUnits[slangPart];
    }
  }
  
  // Padrão 2: [número] + [multiplicador grande]
  // Ex: "dois milão" = 2000, "cinco k" = 5000, "um barão" = 1000
  const bigMultiplierPattern = /(\d+|um|uma|dois|duas|três|quatro|cinco|seis|sete|oito|nove|dez|meio|meia)\s*(milão|k|barão|barões)/gi;
  
  match = cmd.match(bigMultiplierPattern);
  if (match) {
    const parts = match[0].split(/\s+/);
    const quantity = parts[0];
    const multiplier = parts[1];
    
    let value = parseFloat(quantity);
    if (isNaN(value)) {
      value = convertWordsToNumber(quantity) || 1;
    }
    
    if (moneySlang.bigMultipliers[multiplier]) {
      return value * moneySlang.bigMultipliers[multiplier];
    }
  }
  
  // Padrão 3: Apenas o multiplicador (implica "um")
  // Ex: "um milão", "dois k"
  const implicitPattern = /(milão|barão|barões)\b/gi;
  match = cmd.match(implicitPattern);
  if (match) {
    const multiplier = match[0].toLowerCase();
    if (moneySlang.bigMultipliers[multiplier]) {
      // Verifica se tem número antes
      const numberBefore = cmd.match(new RegExp(`(\\d+|\\w+)\\s+${multiplier}`, 'i'));
      if (!numberBefore) {
        return moneySlang.bigMultipliers[multiplier]; // Retorna 1x o multiplicador
      }
    }
  }
  
  return null;
};

/**
 * ⭐ NOVO: Extrai frações + valores
 * Ex: "meio pau" = 0.50, "meia pila" = 0.50
 */
const extractFractionalAmounts = (command) => {
  const cmd = command.toLowerCase();
  
  const fractionalPattern = /(meio|meia|um quarto|três quartos|dois terços)\s+(pau|conto|pila|mango|prata|grana)/i;
  const match = cmd.match(fractionalPattern);
  
  if (match) {
    const fraction = match[1];
    const unit = match[2];
    
    if (moneySlang.fractions[fraction] && moneySlang.basicUnits[unit]) {
      return moneySlang.fractions[fraction] * moneySlang.basicUnits[unit];
    }
  }
  
  return null;
};

// ==========================================
// FUNÇÃO PRINCIPAL EXPANDIDA
// ==========================================

/**
 * FUNÇÃO PRINCIPAL: Extrai valores do comando
 * 
 * Ordem de prioridade (do mais específico ao mais genérico):
 * 1. Casos especiais (meio milhão, etc) - ORIGINAL
 * 2. Notas específicas (onça, peixe, toco) - NOVO
 * 3. Gírias brasileiras (pau, conto, pila, mango, milão, k) - NOVO
 * 4. Frações (meio pau, meia pila) - NOVO
 * 5. Valores digitais (R$ 100, 50,00) - ORIGINAL
 * 6. Valores por extenso (cinquenta reais) - ORIGINAL
 */
export const extractAmount = (command) => {
  // Normaliza o comando
  const normalizedCommand = command.toLowerCase().trim();
  
  // 1. Casos especiais (ORIGINAL)
  const specialCases = extractSpecialCases(normalizedCommand);
  if (specialCases !== null) {
    return specialCases;
  }

  // 2. ⭐ NOVO: Notas específicas (onça, peixe, toco)
  const noteValue = extractSpecificNotes(normalizedCommand);
  if (noteValue !== null) {
    return noteValue;
  }

  // 3. ⭐ NOVO: Gírias brasileiras (pau, conto, pila, mango, milão, k)
  const slangValue = extractBrazilianSlang(normalizedCommand);
  if (slangValue !== null) {
    return slangValue;
  }

  // 4. ⭐ NOVO: Frações (meio pau, meia pila)
  const fractionalValue = extractFractionalAmounts(normalizedCommand);
  if (fractionalValue !== null) {
    return fractionalValue;
  }

  // 5. Valores digitais (ORIGINAL)
  const digitalValue = extractDigitalPatterns(normalizedCommand);
  if (digitalValue !== null) {
    return digitalValue;
  }

  // 6. Valores por extenso (ORIGINAL)
  const extendedValue = extractAmountFromWords(normalizedCommand);
  if (extendedValue !== null) {
    return extendedValue;
  }
  
  return null;
};

// ==========================================
// EXPORTAÇÕES PARA TESTES E DEBUG
// ==========================================

export const testHelpers = {
  // Funções originais
  extractSpecialCases,
  normalizeDigitalValue,
  extractDigitalPatterns,
  convertWordsToNumber,
  extractAmountFromWords,
  
  // Novas funções brasileiras
  extractSpecificNotes,
  extractBrazilianSlang,
  extractFractionalAmounts
};```

## Componente: `./src/static/src/components/voice-command/extractors/CategoryExtractor.js`
```js
import { contextualKeywords } from '../constants/keywords';
import { categoryKeywords } from '../constants/brazilianSlangDictionary';

// ============================================
// CATEGORY EXTRACTOR - VERSÃO COMPLETA
// Original + Sistema Brasileiro Expandido
// ============================================

// ==========================================
// FUNÇÃO ORIGINAL (mantida 100%)
// ==========================================

const findBestCategoryOriginal = (command, categories) => {
  let bestCategory = null;
  let bestScore = 0;

  for (const categoryType in contextualKeywords) {
    const keywords = contextualKeywords[categoryType];
    const matchCount = keywords.filter(keyword => 
      command.includes(keyword.toLowerCase())
    ).length;
    
    if (matchCount > bestScore) {
      const category = categories.find(cat => 
        cat.name.toLowerCase().includes(categoryType) ||
        cat.slug?.toLowerCase().includes(categoryType)
      );
      
      if (category) {
        bestCategory = category;
        bestScore = matchCount;
      }
    }
  }
  
  return { category: bestCategory, score: bestScore };
};

// ==========================================
// NOVAS FUNÇÕES - SISTEMA BRASILEIRO
// ==========================================

/**
 * ⭐ NOVO: Calcula score detalhado de uma categoria
 */
const calculateDetailedCategoryScore = (command, categoryData) => {
  const cmd = command.toLowerCase();
  let score = 0;
  const matches = {
    brands: [],
    places: [],
    services: [],
    keywords: [],
    slang: []
  };

  // Peso 10 - Marcas/Brands (mais específico)
  if (categoryData.brands) {
    categoryData.brands.forEach(brand => {
      if (cmd.includes(brand.toLowerCase())) {
        score += 10;
        matches.brands.push(brand);
      }
    });
  }

  // Peso 7 - Lugares/Places
  if (categoryData.places) {
    categoryData.places.forEach(place => {
      if (cmd.includes(place.toLowerCase())) {
        score += 7;
        matches.places.push(place);
      }
    });
  }

  // Peso 7 - Serviços/Services
  if (categoryData.services) {
    categoryData.services.forEach(service => {
      if (cmd.includes(service.toLowerCase())) {
        score += 7;
        matches.services.push(service);
      }
    });
  }

  // Peso 5 - Keywords gerais
  if (categoryData.keywords) {
    categoryData.keywords.forEach(keyword => {
      if (cmd.includes(keyword.toLowerCase())) {
        score += 5;
        matches.keywords.push(keyword);
      }
    });
  }

  // Peso 3 - Gírias
  if (categoryData.slang) {
    categoryData.slang.forEach(slang => {
      if (cmd.includes(slang.toLowerCase())) {
        score += 3;
        matches.slang.push(slang);
      }
    });
  }

  // Aplica prioridade da categoria como multiplicador
  if (categoryData.priority) {
    score *= (categoryData.priority / 10);
  }

  return { score, matches };
};

/**
 * ⭐ NOVO: Normaliza nome de categoria para encontrar no banco
 */
const normalizeCategoryName = (categoryName) => {
  const normalizations = {
    'alimentacao': ['alimentação', 'comida', 'alimento', 'alimentaçao'],
    'transporte': ['transporte', 'locomoção', 'locomocao'],
    'saude': ['saúde', 'saude', 'médico', 'medico'],
    'casa': ['casa', 'moradia', 'residência', 'residencia'],
    'assinaturas': ['assinatura', 'assinaturas', 'streaming'],
    'lazer': ['lazer', 'entretenimento', 'diversão', 'diversao'],
    'trabalho': ['trabalho', 'renda', 'salário', 'salario'],
    'educacao': ['educação', 'educacao', 'estudo', 'educaçao'],
    'vestuario': ['vestuário', 'vestuario', 'roupa'],
    'beleza': ['beleza', 'estética', 'estetica']
  };

  const lower = categoryName.toLowerCase();
  for (const [slug, variants] of Object.entries(normalizations)) {
    if (variants.some(v => lower.includes(v))) {
      return slug;
    }
  }
  return categoryName.toLowerCase();
};

/**
 * ⭐ NOVO: Encontra categoria no array do banco de dados
 */
const findCategoryInDatabase = (categorySlug, categories) => {
  if (!categories || categories.length === 0) return null;

  // 1. Busca exata por slug
  let category = categories.find(cat => 
    cat.slug?.toLowerCase() === categorySlug
  );
  if (category) return category;

  // 2. Busca por nome normalizado
  category = categories.find(cat =>
    normalizeCategoryName(cat.name) === categorySlug
  );
  if (category) return category;

  // 3. Busca parcial no nome
  category = categories.find(cat =>
    cat.name.toLowerCase().includes(categorySlug)
  );
  if (category) return category;

  // 4. Busca parcial no slug
  category = categories.find(cat =>
    cat.slug?.toLowerCase().includes(categorySlug)
  );
  if (category) return category;

  return null;
};

/**
 * ⭐ NOVO: Calcula score usando o novo sistema brasileiro
 */
const calculateBrazilianScore = (command, categories) => {
  const normalizedCommand = command.toLowerCase().trim();
  const categoryScores = {};
  const categoryDetails = {};

  // Calcula score para cada categoria do dicionário
  for (const [categorySlug, categoryData] of Object.entries(categoryKeywords)) {
    const result = calculateDetailedCategoryScore(normalizedCommand, categoryData);
    if (result.score > 0) {
      categoryScores[categorySlug] = result.score;
      categoryDetails[categorySlug] = result.matches;
    }
  }

  // Ordena por score
  const sortedCategories = Object.entries(categoryScores)
    .sort((a, b) => b[1] - a[1]);

  // Tenta encontrar a categoria com maior score no banco
  for (const [categorySlug, score] of sortedCategories) {
    const category = findCategoryInDatabase(categorySlug, categories);
    if (category) {
      return {
        category,
        score,
        matches: categoryDetails[categorySlug],
        method: 'brazilian_system'
      };
    }
  }

  return null;
};

// ==========================================
// FUNÇÃO PRINCIPAL INTEGRADA
// ==========================================

/**
 * FUNÇÃO PRINCIPAL: Encontra melhor categoria
 * 
 * Estratégia:
 * 1. Tenta o novo sistema brasileiro (mais preciso)
 * 2. Fallback para o sistema original
 * 3. Retorna a categoria com maior confiança
 * 
 * @param {string} command - Comando do usuário
 * @param {Array} categories - Lista de categorias do banco
 * @returns {Object|null} - Categoria encontrada ou null
 */
export const findBestCategory = (command, categories) => {
  if (!command || !categories || categories.length === 0) {
    return null;
  }

  const normalizedCommand = command.toLowerCase().trim();

  // 1. ⭐ Tenta o NOVO SISTEMA BRASILEIRO (mais preciso e detalhado)
  const brazilianResult = calculateBrazilianScore(normalizedCommand, categories);
  
  // 2. Tenta o SISTEMA ORIGINAL (fallback)
  const originalResult = findBestCategoryOriginal(normalizedCommand, categories);

  // 3. Compara os resultados e retorna o melhor
  
  // Se apenas um sistema encontrou resultado
  if (brazilianResult && !originalResult.category) {
    return brazilianResult.category;
  }
  if (!brazilianResult && originalResult.category) {
    return originalResult.category;
  }
  
  // Se nenhum encontrou
  if (!brazilianResult && !originalResult.category) {
    return null;
  }

  // Se ambos encontraram, compara scores
  // Novo sistema tem pesos mais altos, então precisa normalizar
  const brazilianNormalizedScore = brazilianResult.score / 10; // Normaliza
  const originalScore = originalResult.score;

  if (brazilianNormalizedScore > originalScore) {
    return brazilianResult.category;
  } else if (brazilianNormalizedScore < originalScore) {
    return originalResult.category;
  } else {
    // Empate: prefere o resultado brasileiro por ser mais específico
    return brazilianResult.category;
  }
};

// ==========================================
// FUNÇÕES DE DEBUG E TESTES
// ==========================================

/**
 * ⭐ DEBUG: Mostra scores de todas categorias
 */
export const debugCategoryScores = (command, categories) => {
  const cmd = command.toLowerCase().trim();
  
  // Calcula scores do sistema brasileiro
  const brazilianScores = {};
  for (const [categorySlug, categoryData] of Object.entries(categoryKeywords)) {
    const result = calculateDetailedCategoryScore(cmd, categoryData);
    brazilianScores[categorySlug] = {
      score: result.score,
      matches: result.matches,
      priority: categoryData.priority
    };
  }

  // Calcula score do sistema original
  const originalResult = findBestCategoryOriginal(cmd, categories);

  // Resultado final
  const finalResult = findBestCategory(cmd, categories);

  return {
    command: cmd,
    brazilianSystem: Object.fromEntries(
      Object.entries(brazilianScores)
        .sort((a, b) => b[1].score - a[1].score)
        .slice(0, 5) // Top 5
    ),
    originalSystem: {
      category: originalResult.category?.name,
      score: originalResult.score
    },
    finalResult: {
      category: finalResult?.name,
      slug: finalResult?.slug
    }
  };
};

/**
 * ⭐ APRENDIZADO: Salva nova associação palavra -> categoria
 * (Preparado para sistema de aprendizado futuro)
 */
export const learnNewAssociation = (keyword, categorySlug) => {
  console.log(`[LEARNING] Nova associação: "${keyword}" -> ${categorySlug}`);
  
  // TODO: Implementar salvamento no localStorage ou DB
  // const learned = JSON.parse(localStorage.getItem('learned_keywords') || '{}');
  // learned[keyword] = categorySlug;
  // localStorage.setItem('learned_keywords', JSON.stringify(learned));
  
  return {
    keyword,
    categorySlug,
    timestamp: new Date().toISOString()
  };
};

// ==========================================
// EXPORTAÇÕES PARA TESTES
// ==========================================

export const testHelpers = {
  // Funções originais
  findBestCategoryOriginal,
  
  // Novas funções brasileiras
  calculateDetailedCategoryScore,
  normalizeCategoryName,
  findCategoryInDatabase,
  calculateBrazilianScore
};```

## Componente: `./src/static/src/components/voice-command/extractors/DateExtractor.js`
```js
export const extractDate = (command) => {
  const today = new Date();
  
  if (/hoje|agora/i.test(command)) {
    return today;
  }
  
  if (/ontem/i.test(command)) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  }
  
  if (/amanhã|amanha/i.test(command)) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  
  return today;
};
```

## Componente: `./src/static/src/components/voice-command/extractors/DescriptionExtractor.js`
```js
// ============================================
// DESCRIPTION EXTRACTOR - VERSÃO TURBINADA
// Extrai descrições com contexto de categoria
// ============================================

/**
 * Remove palavras-chave que não fazem parte da descrição
 */
const removeCommandKeywords = (text) => {
  return text
    // Remove verbos de transação
    .replace(/\b(receita|despesa|entrada|sa[íi]da|gast(o|ei|ar)|pag(ar|uei|o)|receb(i|er))\b/gi, "")
    
    // Remove verbos de ação (gírias)
    .replace(/\b(torrei|queimei|fritei|varei|derreti|estourei|pingou|caiu|garimpei|faturei)\b/gi, "")
    
    // Remove comandos de agendamento
    .replace(/\b(agendar|agende|mensal|semanal|anual|recorrente|repetir|autom[áa]tico|fixo|sempre)\b/gi, "")
    
    // Remove padrões de recorrência
    .replace(/\b(todo\s+dia\s+\d{1,2}|sempre\s+no\s+dia\s+\d{1,2})\b/gi, "")
    
    // Remove datas
    .replace(/\b(dia\s+\d{1,2}\s+de\s+\w+)\b/gi, "")
    .replace(/\b(hoje|ontem|amanh[ãa]|depois\s+de\s+amanh[ãa]|anteontem)\b/gi, "")
    
    // Remove valores monetários (mais patterns)
    .replace(/\b\d+(?:[.,]\d+)?\s*(?:reais?|r\$|pau|paus|conto|contos|pila|pilas|mango|mangos|prata|mil[ãa]o|k|bar[ãa]o)\b/gi, "")
    .replace(/\b(?:r\$\s*)?\d{1,3}(?:\.\d{3})*(?:,\d{2})?\b/gi, "")
    .replace(/\b(\d+(?:[.,]\d+)?)\s*(mil|milh[ãa]o|milh[õo]es|bilh[ãa]o|bilh[õo]es|trilh[ãa]o|trilh[õo]es)\b/gi, "")
    
    // Remove notas específicas
    .replace(/\b(uma\s+on[çc]a|um\s+peixe|um\s+toco|cinquent[ãa]o|vint[ãa]o)\b/gi, "")
    
    // Remove status
    .replace(/\b(pago|pendente|em\s+aberto|quitado|zerei|matei)\b/gi, "")
    
    // Remove comandos de categoria
    .replace(/\bna\s+categoria\s+[\w\s]+\b/gi, "")
    .replace(/\bcategoria\s+(de\s+)?[\w]+\b/gi, "")
    
    // ⭐ NOVO: Remove comandos de atualização
    .replace(/\b(atualizar|modificar|alterar|editar|mudar|corrigir)\b/gi, "")
    .replace(/\b(marcar\s+como|adicionar\s+status|definir\s+como)\b/gi, "")
    .replace(/\b(transaç[ãa]o|lan[çc]amento)\b/gi, "")
    
    // Remove preposições isoladas
    .replace(/\b(de|do|da|em|no|na|com|para|pra|pro)\s*$/gi, "")
    
    // Normaliza espaços
    .replace(/\s+/g, " ")
    .trim();
};

/**
 * ⭐ NOVO: Extrai nome de categoria mencionada no comando
 * Ex: "gastei 50 em pesca" → "pesca"
 */
const extractMentionedCategory = (text) => {
  const cmd = text.toLowerCase();
  
  const patterns = [
    // "em/no/na CATEGORIA"
    /\b(?:em|no|na|com|de|do|da)\s+([a-záàâãéèêíïóôõöúçñ]+)/i,
    
    // "categoria CATEGORIA"
    /\bcategoria\s+(?:de\s+)?([a-záàâãéèêíïóôõöúçñ]+)/i,
    
    // "para CATEGORIA"
    /\b(?:para|pra)\s+([a-záàâãéèêíïóôõöúçñ]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = cmd.match(pattern);
    if (match && match[1] && match[1].length > 2) {
      // Capitaliza primeira letra
      const category = match[1].trim();
      return category.charAt(0).toUpperCase() + category.slice(1);
    }
  }
  
  return null;
};

/**
 * ⭐ NOVO: Detecta se descrição é muito genérica
 */
const isTooGeneric = (description) => {
  if (!description || description.length < 3) return true;
  
  const genericWords = [
    'isso', 'isso ai', 'aquilo', 'la', 'coisas', 'coisa',
    'negocio', 'negócio', 'bagulho', 'trem', 'treco'
  ];
  
  return genericWords.some(word => 
    description.toLowerCase().trim() === word
  );
};

/**
 * ⭐ NOVO: Melhora descrição usando contexto
 */
const enhanceDescription = (description, context = {}) => {
  if (!description) return null;
  
  let enhanced = description;
  
  // Se tem categoria mencionada mas não na descrição, adiciona
  if (context.mentionedCategory && !enhanced.toLowerCase().includes(context.mentionedCategory.toLowerCase())) {
    enhanced = `${context.mentionedCategory} - ${enhanced}`;
  }
  
  // Se tem marca conhecida, garante que está capitalizada
  const brands = ['ifood', 'uber', '99', 'netflix', 'spotify'];
  brands.forEach(brand => {
    const regex = new RegExp(`\\b${brand}\\b`, 'gi');
    enhanced = enhanced.replace(regex, brand.charAt(0).toUpperCase() + brand.slice(1));
  });
  
  return enhanced;
};

/**
 * FUNÇÃO PRINCIPAL: Extrai descrição do comando
 * 
 * @param {string} command - Comando do usuário
 * @param {Object} options - Opções de extração
 * @returns {string|null} - Descrição extraída ou null
 */
export const extractDescription = (command, options = {}) => {
  const {
    includeCategory = false,
    enhance = true
  } = options;
  
  // Remove palavras-chave
  let description = removeCommandKeywords(command);
  
  // ⭐ NOVO: Extrai categoria mencionada
  const mentionedCategory = extractMentionedCategory(command);
  
  // Se descrição ficou muito curta ou genérica, tenta pegar contexto
  if (isTooGeneric(description)) {
    // Se tem categoria mencionada, usa ela como base
    if (mentionedCategory) {
      description = mentionedCategory;
    } else {
      return null;
    }
  }
  
  // Melhora a descrição se solicitado
  if (enhance) {
    description = enhanceDescription(description, { mentionedCategory });
  }
  
  // Capitaliza primeira letra
  if (description && description.length > 0) {
    description = description.charAt(0).toUpperCase() + description.slice(1);
  }
  
  return description || null;
};

/**
 * ⭐ NOVO: Extrai descrição para busca de transação
 * Usado quando usuário quer atualizar/deletar transação existente
 */
export const extractTransactionSearchTerm = (command) => {
  const cmd = command.toLowerCase();
  
  // Remove comandos de ação primeiro
  const cleaned = cmd
    .replace(/\b(atualizar|modificar|alterar|editar|mudar|corrigir|marcar|adicionar|definir|excluir|deletar|remover)\b/gi, "")
    .replace(/\b(como|status|transaç[ãa]o|lan[çc]amento|despesa|receita)\b/gi, "")
    .replace(/\b(pag(o|a)|pendente)\b/gi, "")
    .trim();
  
  // Extrai o que sobrou
  const patterns = [
    // "para X", "pra X"
    /(?:para|pra)\s+(?:a\s+|o\s+)?(.+)/i,
    
    // "de X"
    /\bde\s+(.+)/i,
    
    // "da/do X"
    /\b(?:da|do)\s+(.+)/i,
    
    // O que sobrou
    /(.+)/i
  ];
  
  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match && match[1] && match[1].trim().length > 2) {
      return match[1].trim();
    }
  }
  
  return null;
};

/**
 * ⭐ NOVO: Detecta se comando menciona uma categoria específica
 */
export const extractCategoryFromDescription = (command) => {
  return extractMentionedCategory(command);
};

// Exporta funções auxiliares
export const descriptionHelpers = {
  removeCommandKeywords,
  extractMentionedCategory,
  isTooGeneric,
  enhanceDescription,
  extractTransactionSearchTerm
};
```

## Componente: `./src/static/src/components/voice-command/extractors/IntentExtractor.js`
```js
import { intentPatterns } from "../constants/patterns";

// ============================================
// INTENT EXTRACTOR - VERSÃO SUPER TURBINADA
// Detecta todas as intenções possíveis do usuário
// ============================================

/**
 * ⭐ NOVOS PADRÕES DE INTENÇÃO
 */
const advancedIntentPatterns = {
  // Criar transação (padrão já existente)
  create_transaction: [
    /pagar|paguei|despesa|gasto|receita|receber|recebi|entrada|saída/i,
    /gastei|comprei|torrei|queimei|fritei|caiu|pingou/i
  ],
  
  // Agendar transação recorrente (padrão já existente)
  schedule_transaction: [
    /agendar|agende|programar|todo (dia|mês|ano)|mensal|semanal|anual|recorrente/i,
    /repetir|automático|fixo|sempre/i
  ],
  
  // ⭐ NOVO: Criar categoria
  create_category: [
    /criar (uma |a )?categoria/i,
    /nova categoria/i,
    /adicionar (uma |a )?categoria/i,
    /cadastrar (uma |a )?categoria/i,
    /registrar (uma |a )?categoria/i,
    /fazer (uma |a )?categoria/i,
    /quero (uma |a )?categoria/i
  ],
  
  // ⭐ NOVO: Atualizar transação existente
  update_transaction: [
    /atualizar (a |o )?transaç[ãa]o/i,
    /atualizar (a |o )?lan[çc]amento/i,
    /mudar (a |o )?transaç[ãa]o/i,
    /modificar (a |o )?transaç[ãa]o/i,
    /alterar (a |o )?transaç[ãa]o/i,
    /editar (a |o )?transaç[ãa]o/i,
    /corrigir (a |o )?transaç[ãa]o/i
  ],
  
  // ⭐ NOVO: Marcar como pago
  mark_as_paid: [
    /marcar como pag(o|a)/i,
    /adicionar status pag(o|a)/i,
    /definir como pag(o|a)/i,
    /foi pag(o|a)/i,
    /já paguei/i,
    /paguei (essa|isso|a|o)/i,
    /quitei/i,
    /zerei/i,
    /matei (a conta)?/i
  ],
  
  // ⭐ NOVO: Marcar como pendente
  mark_as_pending: [
    /marcar como pendente/i,
    /adicionar status pendente/i,
    /ainda n[ãa]o (paguei|foi pago)/i,
    /n[ãa]o paguei/i,
    /fica pendente/i,
    /deixar pendente/i
  ],
  
  // ⭐ NOVO: Excluir transação
  delete_transaction: [
    /excluir (a |o )?transaç[ãa]o/i,
    /deletar (a |o )?transaç[ãa]o/i,
    /remover (a |o )?transaç[ãa]o/i,
    /apagar (a |o )?transaç[ãa]o/i,
    /cancelar (a |o )?lan[çc]amento/i
  ],
  
  // ⭐ NOVO: Buscar transação
  search_transaction: [
    /buscar (a |o )?transaç[ãa]o/i,
    /procurar (a |o )?transaç[ãa]o/i,
    /encontrar (a |o )?transaç[ãa]o/i,
    /onde (est[áa]|fica) (a |o )?transaç[ãa]o/i,
    /mostrar (a |o )?transaç[ãa]o/i
  ]
};

/**
 * ⭐ NOVO: Detecta sub-intenção dentro de update
 * Ex: "atualizar status para pago" → update_status
 */
const detectUpdateSubIntent = (command) => {
  const cmd = command.toLowerCase();
  
  // Atualizar status
  if (/status|situaç[ãa]o/.test(cmd)) {
    if (/pag(o|a)/.test(cmd)) {
      return { subIntent: 'update_status', value: 'paid' };
    }
    if (/pendente|em aberto/.test(cmd)) {
      return { subIntent: 'update_status', value: 'pending' };
    }
    return { subIntent: 'update_status', value: null };
  }
  
  // Atualizar valor
  if (/valor|quantia|pre[çc]o/.test(cmd)) {
    return { subIntent: 'update_amount', value: null };
  }
  
  // Atualizar data
  if (/data|dia|vencimento/.test(cmd)) {
    return { subIntent: 'update_date', value: null };
  }
  
  // Atualizar categoria
  if (/categoria/.test(cmd)) {
    return { subIntent: 'update_category', value: null };
  }
  
  // Atualizar descrição
  if (/descri[çc][ãa]o|nome|t[íi]tulo/.test(cmd)) {
    return { subIntent: 'update_description', value: null };
  }
  
  return null;
};

/**
 * ⭐ NOVO: Detecta se comando menciona transação específica
 * Ex: "marcar como pago a despesa de pesca"
 */
const extractTransactionReference = (command) => {
  const cmd = command.toLowerCase();
  
  // Padrões de referência
  const patterns = [
    // "a despesa de X"
    /(?:a |o )?(?:despesa|lan[çc]amento|transaç[ãa]o|gasto|receita)\s+(?:de|do|da|com|no|na)\s+([^,.\n]+)/i,
    
    // "transação de 50 reais"
    /(?:transaç[ãa]o|lan[çc]amento|despesa|receita)\s+de\s+(\d+(?:[.,]\d+)?)\s*(?:reais?|r\$)?/i,
    
    // "gastei 50 em X"
    /gastei\s+\d+(?:[.,]\d+)?\s*(?:reais?|pau|conto)?\s+(?:em|no|na|com|de|do|da)\s+([^,.\n]+)/i,
    
    // Apenas a descrição depois de preposições
    /(?:para|pra)\s+(?:a |o )?([^,.\n]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = cmd.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return null;
};

/**
 * ⭐ NOVO: Calcula confiança da intenção detectada
 */
const calculateIntentConfidence = (command, intent) => {
  const cmd = command.toLowerCase();
  let confidence = 0.5; // Base
  
  // Palavras-chave específicas aumentam confiança
  const strongKeywords = {
    create_category: ['criar', 'nova', 'cadastrar'],
    update_transaction: ['atualizar', 'modificar', 'alterar'],
    mark_as_paid: ['marcar', 'paguei', 'quitei'],
    delete_transaction: ['excluir', 'deletar', 'remover']
  };
  
  const keywords = strongKeywords[intent];
  if (keywords) {
    const matches = keywords.filter(kw => cmd.includes(kw)).length;
    confidence += (matches * 0.15); // +15% por palavra-chave
  }
  
  // Se tem referência específica, aumenta confiança
  const reference = extractTransactionReference(cmd);
  if (reference && ['update_transaction', 'mark_as_paid', 'delete_transaction'].includes(intent)) {
    confidence += 0.2;
  }
  
  return Math.min(confidence, 1.0);
};

/**
 * FUNÇÃO PRINCIPAL: Extrai intenção do comando
 * 
 * @param {string} command - Comando do usuário
 * @returns {Object} - { intent, confidence, metadata }
 */
export const extractIntent = (command) => {
  const cmd = command.toLowerCase().trim();
  
  // 1. Tenta padrões avançados primeiro (mais específicos)
  for (const [intent, patterns] of Object.entries(advancedIntentPatterns)) {
    if (patterns.some(pattern => pattern.test(cmd))) {
      const confidence = calculateIntentConfidence(cmd, intent);
      
      const result = {
        intent,
        confidence,
        metadata: {}
      };
      
      // Adiciona metadados específicos por tipo
      switch (intent) {
        case 'update_transaction':
        case 'mark_as_paid':
        case 'mark_as_pending':
        case 'delete_transaction':
          result.metadata.transactionReference = extractTransactionReference(cmd);
          break;
          
        case 'update_transaction':
          result.metadata.subIntent = detectUpdateSubIntent(cmd);
          break;
      }
      
      return result;
    }
  }
  
  // 2. Fallback para padrões originais
  for (const [intent, patterns] of Object.entries(intentPatterns)) {
    if (patterns.some(pattern => pattern.test(cmd))) {
      return {
        intent,
        confidence: 0.7,
        metadata: {}
      };
    }
  }
  
  // 3. Default: criar transação
  return {
    intent: "create_transaction",
    confidence: 0.5,
    metadata: {}
  };
};

/**
 * ⭐ NOVO: Verifica se comando é sobre categoria
 */
export const isCategoryCommand = (command) => {
  const cmd = command.toLowerCase();
  return /\b(categoria|categorias)\b/.test(cmd);
};

/**
 * ⭐ NOVO: Extrai nome da nova categoria
 * Ex: "criar categoria de pescas" → "pescas"
 */
export const extractCategoryName = (command) => {
  const cmd = command.toLowerCase();
  
  const patterns = [
    /criar\s+(?:uma\s+)?categoria\s+(?:de\s+|chamada\s+)?([^\s,\.]+)/i,
    /nova\s+categoria\s+(?:de\s+|chamada\s+)?([^\s,\.]+)/i,
    /categoria\s+(?:de\s+)?([^\s,\.]+)/i,
    /adicionar\s+categoria\s+([^\s,\.]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = cmd.match(pattern);
    if (match && match[1]) {
      // Capitaliza primeira letra
      const name = match[1].trim();
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
  }
  
  return null;
};

/**
 * ⭐ NOVO: Detecta tipo da categoria (expense/income)
 */
export const extractCategoryType = (command) => {
  const cmd = command.toLowerCase();
  
  // Palavras que indicam despesa
  if (/despesa|gasto|pagar|custo|sa[íi]da/.test(cmd)) {
    return 'expense';
  }
  
  // Palavras que indicam receita
  if (/receita|ganho|receber|renda|entrada/.test(cmd)) {
    return 'income';
  }
  
  // Default: despesa (mais comum)
  return 'expense';
};

// Exporta funções auxiliares
export const intentHelpers = {
  detectUpdateSubIntent,
  extractTransactionReference,
  calculateIntentConfidence,
  isCategoryCommand,
  extractCategoryName,
  extractCategoryType
};
```

## Componente: `./src/static/src/components/voice-command/extractors/RecurringExtractor.js`
```js
export const extractRecurring = (command) => {
  const recurringMatch = command.match(/todo dia (\d{1,2})|sempre no dia (\d{1,2})/i);
  if (recurringMatch) {
    return {
      is_recurring: true,
      recurring_day: parseInt(recurringMatch[1] || recurringMatch[2], 10),
    };
  }
  return { is_recurring: false, recurring_day: null };
};
```

## Componente: `./src/static/src/components/voice-command/extractors/StatusExtractor.js`
```js
import { statusPatterns } from '../constants/patterns';
import { paymentStatus } from '../constants/brazilianSlangDictionary';

// ============================================
// EXTRATOR DE STATUS - INTEGRADO
// Usa sistema antigo + novo sistema brasileiro
// ============================================

/**
 * Calcula score usando PADRÕES ANTIGOS (patterns.js)
 */
const calculateScoreFromOldPatterns = (command) => {
  let paidScore = 0;
  let pendingScore = 0;

  // Sistema antigo - statusPatterns
  if (Array.isArray(statusPatterns.paid)) {
    statusPatterns.paid.forEach(pattern => {
      if (pattern.test(command)) paidScore += 5;
    });
  } else if (statusPatterns.paid && statusPatterns.paid.test(command)) {
    paidScore += 5;
  }

  if (Array.isArray(statusPatterns.pending)) {
    statusPatterns.pending.forEach(pattern => {
      if (pattern.test(command)) pendingScore += 5;
    });
  } else if (statusPatterns.pending && statusPatterns.pending.test(command)) {
    pendingScore += 5;
  }

  return { paidScore, pendingScore };
};

/**
 * Calcula score usando NOVO SISTEMA (dicionário brasileiro)
 */
const calculateScoreFromBrazilianSlang = (command) => {
  const cmd = command.toLowerCase();
  let paidScore = 0;
  let pendingScore = 0;

  // PAGO - Novo sistema com pesos
  paymentStatus.paid.verbs.forEach(verb => {
    if (cmd.includes(verb)) paidScore += 10;
  });

  paymentStatus.paid.expressions.forEach(expr => {
    if (cmd.includes(expr)) paidScore += 8;
  });

  // PENDENTE - Novo sistema com pesos
  paymentStatus.pending.verbs.forEach(verb => {
    if (cmd.includes(verb)) pendingScore += 10;
  });

  paymentStatus.pending.expressions.forEach(expr => {
    if (cmd.includes(expr)) pendingScore += 8;
  });

  return { paidScore, pendingScore };
};

/**
 * Detecta indicadores temporais que afetam o status
 */
const detectTemporalIndicators = (command) => {
  const cmd = command.toLowerCase();

  // Indicadores de futuro = pendente
  const futureIndicators = [
    'vou pagar', 'vou quitar', 'tenho que pagar', 'preciso pagar',
    'devo pagar', 'falta pagar', 'amanhã', 'semana que vem',
    'mês que vem', 'depois', 'ainda não', 'até'
  ];

  for (const indicator of futureIndicators) {
    if (cmd.includes(indicator)) {
      return 'pending';
    }
  }

  // Indicadores de passado = pago
  const pastIndicators = [
    'já paguei', 'já quitei', 'acabei de pagar', 'paguei ontem',
    'paguei hoje', 'paguei essa', 'paguei esse', 'já era', 'já foi'
  ];

  for (const indicator of pastIndicators) {
    if (cmd.includes(indicator)) {
      return 'paid';
    }
  }

  return null;
};

/**
 * Detecta contexto de criação vs. pagamento
 */
const detectCreationContext = (command) => {
  const cmd = command.toLowerCase();

  // Palavras que indicam nova transação
  const creationKeywords = [
    'registrar', 'registrei', 'anotar', 'anotei', 'lançar', 'lancei',
    'adicionar', 'adicionei', 'criar', 'criei', 'comprei', 'gastei',
    'foi', 'custou', 'saiu'
  ];

  for (const keyword of creationKeywords) {
    if (cmd.includes(keyword)) {
      // Se tem confirmação de pagamento, é pago
      const hasPaidConfirmation = 
        cmd.includes('já paguei') || 
        cmd.includes('pago') ||
        cmd.includes('quitei') ||
        cmd.includes('já foi') ||
        cmd.includes('já era');
      
      return hasPaidConfirmation ? 'paid' : 'pending';
    }
  }

  return null;
};

/**
 * FUNÇÃO PRINCIPAL: Extrai status de pagamento
 * 
 * Combina sistema antigo + novo para máxima precisão
 * 
 * @param {string} command - Comando do usuário
 * @returns {string} - 'paid' ou 'pending'
 */
export const extractStatus = (command) => {
  if (!command) return 'paid'; // Default

  const normalizedCommand = command.toLowerCase().trim();

  // 1. Verifica indicadores temporais (mais específico)
  const temporal = detectTemporalIndicators(normalizedCommand);
  if (temporal) {
    return temporal;
  }

  // 2. Verifica contexto de criação
  const creation = detectCreationContext(normalizedCommand);
  if (creation) {
    return creation;
  }

  // 3. Calcula scores do SISTEMA ANTIGO
  const oldScores = calculateScoreFromOldPatterns(normalizedCommand);
  let paidScore = oldScores.paidScore;
  let pendingScore = oldScores.pendingScore;

  // 4. Adiciona scores do NOVO SISTEMA BRASILEIRO
  const newScores = calculateScoreFromBrazilianSlang(normalizedCommand);
  paidScore += newScores.paidScore;
  pendingScore += newScores.pendingScore;

  // 5. Se ambos scores são zero, usa regra padrão
  if (paidScore === 0 && pendingScore === 0) {
    if (normalizedCommand.includes('pagar') && !normalizedCommand.includes('paguei')) {
      return 'pending';
    }
    if (normalizedCommand.includes('gastei') || 
        normalizedCommand.includes('comprei') ||
        normalizedCommand.includes('paguei')) {
      return 'paid';
    }
    return 'paid'; // Default
  }

  // 6. Decisão por score total
  if (paidScore > pendingScore) {
    return 'paid';
  }
  if (pendingScore > paidScore) {
    return 'pending';
  }

  // 7. Empate: usa contexto do verbo
  if (normalizedCommand.match(/\b(paguei|quitei|resolvi)\b/)) {
    return 'paid';
  }
  if (normalizedCommand.match(/\b(pagar|quitar|resolver)\b/)) {
    return 'pending';
  }

  return 'paid'; // Default
};

/**
 * Função auxiliar para debug - mostra todos os scores
 */
export const debugStatusScores = (command) => {
  const cmd = command.toLowerCase().trim();
  const oldScores = calculateScoreFromOldPatterns(cmd);
  const newScores = calculateScoreFromBrazilianSlang(cmd);
  const temporal = detectTemporalIndicators(cmd);
  const creation = detectCreationContext(cmd);
  const result = extractStatus(cmd);

  return {
    command: cmd,
    oldSystem: oldScores,
    newSystem: newScores,
    totalPaid: oldScores.paidScore + newScores.paidScore,
    totalPending: oldScores.pendingScore + newScores.pendingScore,
    temporal,
    creation,
    result,
    confidence: Math.abs(
      (oldScores.paidScore + newScores.paidScore) - 
      (oldScores.pendingScore + newScores.pendingScore)
    )
  };
};

// Exporta funções auxiliares para testes
export const testHelpers = {
  calculateScoreFromOldPatterns,
  calculateScoreFromBrazilianSlang,
  detectTemporalIndicators,
  detectCreationContext
};```

## Componente: `./src/static/src/components/voice-command/extractors/TransactionTypeExtractor.js`
```js
import { typePatterns } from "../constants/patterns";
import { contextualKeywords } from "../constants/keywords";
import { transactionPatterns } from "../constants/brazilianSlangDictionary";

// ============================================
// EXTRATOR DE TIPO DE TRANSAÇÃO - INTEGRADO
// Usa sistema antigo + novo sistema brasileiro
// ============================================

/**
 * Calcula score usando PADRÕES ANTIGOS (patterns.js)
 */
const calculateScoreFromOldPatterns = (command) => {
  let expenseScore = 0;
  let incomeScore = 0;

  // Sistema antigo - typePatterns
  typePatterns.expense.forEach(pattern => {
    if (pattern.test(command)) expenseScore += 5;
  });

  typePatterns.income.forEach(pattern => {
    if (pattern.test(command)) incomeScore += 5;
  });

  return { expenseScore, incomeScore };
};

/**
 * Calcula score usando NOVO SISTEMA (dicionário brasileiro)
 */
const calculateScoreFromBrazilianSlang = (command) => {
  let expenseScore = 0;
  let incomeScore = 0;
  const cmd = command.toLowerCase();

  // DESPESAS - Novo sistema com pesos
  transactionPatterns.expense.strongVerbs.forEach(verb => {
    if (cmd.includes(verb)) expenseScore += 10;
  });

  transactionPatterns.expense.mediumVerbs.forEach(verb => {
    if (cmd.includes(verb)) expenseScore += 8;
  });

  transactionPatterns.expense.nouns.forEach(noun => {
    if (cmd.includes(noun)) expenseScore += 6;
  });

  transactionPatterns.expense.slangExpressions.forEach(expr => {
    if (cmd.includes(expr)) expenseScore += 5;
  });

  transactionPatterns.expense.paymentMethods.forEach(method => {
    if (cmd.includes(method)) expenseScore += 4;
  });

  // RECEITAS - Novo sistema com pesos
  transactionPatterns.income.strongVerbs.forEach(verb => {
    if (cmd.includes(verb)) incomeScore += 10;
  });

  transactionPatterns.income.mediumVerbs.forEach(verb => {
    if (cmd.includes(verb)) incomeScore += 8;
  });

  transactionPatterns.income.nouns.forEach(noun => {
    if (cmd.includes(noun)) incomeScore += 6;
  });

  transactionPatterns.income.slangExpressions.forEach(expr => {
    if (cmd.includes(expr)) incomeScore += 5;
  });

  transactionPatterns.income.incomeTypes.forEach(type => {
    if (cmd.includes(type)) incomeScore += 4;
  });

  return { expenseScore, incomeScore };
};

/**
 * Adiciona score baseado em contexto de categorias
 */
const addCategoryContextScore = (command, expenseScore, incomeScore) => {
  let newExpenseScore = expenseScore;
  let newIncomeScore = incomeScore;

  for (const [category, keywords] of Object.entries(contextualKeywords)) {
    const matches = keywords.filter(kw => command.includes(kw)).length;
    if (matches > 0) {
      if (["alimentação", "transporte", "saúde", "casa"].includes(category)) {
        newExpenseScore += matches;
      } else if (category === "trabalho") {
        newIncomeScore += matches;
      }
    }
  }

  return { expenseScore: newExpenseScore, incomeScore: newIncomeScore };
};

/**
 * Detecta negações que invertem o sentido
 */
const detectNegation = (command) => {
  const negationPatterns = [
    /não\s+(recebi|ganhei|faturei)/i,
    /não\s+(gastei|paguei|comprei)/i,
    /nem\s+(recebi|ganhei)/i,
    /nem\s+(gastei|paguei)/i
  ];

  for (const pattern of negationPatterns) {
    const match = command.match(pattern);
    if (match) {
      const verb = match[1].toLowerCase();
      if (['recebi', 'ganhei', 'faturei'].includes(verb)) {
        return 'negated_income';
      }
      if (['gastei', 'paguei', 'comprei'].includes(verb)) {
        return 'negated_expense';
      }
    }
  }
  return null;
};

/**
 * FUNÇÃO PRINCIPAL: Extrai tipo de transação
 * 
 * Combina sistema antigo + novo para máxima precisão
 * 
 * @param {string} command - Comando do usuário
 * @returns {string} - 'expense', 'income' ou null
 */
export const extractTransactionType = (command) => {
  const normalizedCommand = command.toLowerCase().trim();

  // 1. Verifica negações primeiro
  const negation = detectNegation(normalizedCommand);
  if (negation === 'negated_income') return 'expense';
  if (negation === 'negated_expense') return 'income';

  // 2. Calcula scores do SISTEMA ANTIGO
  const oldScores = calculateScoreFromOldPatterns(normalizedCommand);
  let expenseScore = oldScores.expenseScore;
  let incomeScore = oldScores.incomeScore;

  // 3. Adiciona scores do NOVO SISTEMA BRASILEIRO
  const newScores = calculateScoreFromBrazilianSlang(normalizedCommand);
  expenseScore += newScores.expenseScore;
  incomeScore += newScores.incomeScore;

  // 4. Adiciona contexto de categorias
  const contextScores = addCategoryContextScore(
    normalizedCommand,
    expenseScore,
    incomeScore
  );
  expenseScore = contextScores.expenseScore;
  incomeScore = contextScores.incomeScore;

  // 5. Decisão baseada em score total
  if (expenseScore > incomeScore && expenseScore >= 5) {
    return "expense";
  }
  if (incomeScore > expenseScore && incomeScore >= 5) {
    return "income";
  }

  // 6. Fallback - palavras-chave diretas
  if (normalizedCommand.includes('recebi') || normalizedCommand.includes('ganhei')) {
    return 'income';
  }
  if (normalizedCommand.includes('gastei') || normalizedCommand.includes('paguei')) {
    return 'expense';
  }

  return null;
};

/**
 * Função auxiliar para debug - mostra todos os scores
 */
export const debugScores = (command) => {
  const cmd = command.toLowerCase().trim();
  const oldScores = calculateScoreFromOldPatterns(cmd);
  const newScores = calculateScoreFromBrazilianSlang(cmd);
  const result = extractTransactionType(cmd);

  return {
    command: cmd,
    oldSystem: oldScores,
    newSystem: newScores,
    totalExpense: oldScores.expenseScore + newScores.expenseScore,
    totalIncome: oldScores.incomeScore + newScores.incomeScore,
    result,
    confidence: Math.abs(
      (oldScores.expenseScore + newScores.expenseScore) - 
      (oldScores.incomeScore + newScores.incomeScore)
    )
  };
};

// Exporta funções auxiliares para testes
export const testHelpers = {
  calculateScoreFromOldPatterns,
  calculateScoreFromBrazilianSlang,
  detectNegation
};```

## Componente: `./src/static/src/components/voice-command/formatters/CurrencyFormatter.js`
```js
export const formatCurrency = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value || 0);
};
```

## Componente: `./src/static/src/components/voice-command/formatters/DateFormatter.js`
```js
export const formatISO = (date) => date.toISOString().split("T")[0];
export const formatBR = (date) => date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
```

## Componente: `./src/static/src/components/voice-command/hooks/useSpeechRecognition.js`
```js
// ARQUIVO: src/static/src/components/voice-command/hooks/useSpeechRecognition.js (VERSÃO 2 - MAIS ROBUSTA)

import { useState, useEffect, useRef, useCallback } from 'react';
import { initializeSpeechRecognition, startRecognition, stopRecognition } from '../services/SpeechRecognitionService';

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);
  const onResultCallbackRef = useRef(null);

  useEffect(() => {
    const handleResult = (event) => {
      const speechResult = event.results[0][0].transcript;
      setTranscript(speechResult);
      if (onResultCallbackRef.current) {
        onResultCallbackRef.current(speechResult);
      }
    };

    const handleError = (event) => {
      // Ignora o erro 'no-speech' que acontece quando o usuário não fala nada.
      if (event.error === 'no-speech') {
        console.warn('Nenhuma fala detectada.');
      } else {
        setError('Erro no reconhecimento de voz.');
      }
      setIsListening(false);
    };

    const handleStart = () => {
      setIsListening(true);
      setError('');
      setTranscript('');
    };

    const handleEnd = () => {
      setIsListening(false);
      onResultCallbackRef.current = null; // Limpa o callback no final.
    };

    try {
      recognitionRef.current = initializeSpeechRecognition(handleResult, handleError, handleStart, handleEnd);
    } catch (e) {
      setError('Reconhecimento de voz não suportado neste navegador.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []); // Sem dependências, executa apenas uma vez.

  const startListening = useCallback((onResultCallback) => {
    if (recognitionRef.current && !isListening) {
      onResultCallbackRef.current = onResultCallback;
      startRecognition(recognitionRef.current);
    } else if (!recognitionRef.current) {
      setError('Reconhecimento de voz não pode ser iniciado.');
    }
  }, [isListening]); // Depende de 'isListening' para não iniciar duas vezes.

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      stopRecognition(recognitionRef.current);
    }
  }, [isListening]);

  return { isListening, transcript, error, startListening, stopListening, setError, setTranscript };
};
```

## Componente: `./src/static/src/components/voice-command/services/SpeechRecognitionService.js`
```js

export const initializeSpeechRecognition = (onResult, onError, onStart, onEnd) => {
  if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "pt-BR";
  
  recognition.onstart = onStart;
  recognition.onresult = onResult;
  recognition.onerror = onError;
  recognition.onend = onEnd;

  return recognition;
};

export const startRecognition = (recognition) => {
  if (recognition) {
    recognition.start();
  }
};

export const stopRecognition = (recognition) => {
  if (recognition) {
    recognition.stop();
  }
};

```

## Componente: `./src/static/src/components/voice-command/services/SpeechSynthesisService.js`
```js
export const speakText = (text) => {
  if ("speechSynthesis" in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  }
};
```

## Componente: `./src/static/src/components/voice-command/services/apiClient.js`
```js
import { get, post } from "../../../lib/apiClient";

export const fetchCategories = async (context) => {
  const data = await get(`/categories?context=${context}`);
  return data;
};

export const createTransaction = async (transactionData) => {
  await post("/transactions", transactionData);
};
```

## Componente: `./src/static/src/components/voice-command/utils/ConversationManager.js`
```js

export const addToConversation = (setConversation, sender, message) => {
  setConversation(prev => [...prev, { sender, message, timestamp: new Date() }]);
};

export const resetConversationState = (setConversation, setCurrentTransaction, setMissingFields, setIsInConversation, setTranscript, setConfirmation, setError, setSuccess) => {
  setConversation([]);
  setCurrentTransaction({});
  setMissingFields([]);
  setIsInConversation(false);
  setTranscript("");
  setConfirmation(null);
  setError("");
  setSuccess("");
};

```

## Componente: `./src/static/src/components/voice-command/validators/AmountValidator.js`
```js
export const validateAmount = (amount, context) => {
  if (!amount || amount <= 0) return false;
  
  if ((context.includes("mil") || context.includes("thousand")) && amount < 1000) {
    console.warn("⚠️ Valor suspeito detectado - contexto indica milhares mas valor é baixo");
    return false;
  }
  
  if (amount > 999999999999999) {  // Mais de 999 trilhões
    console.warn("⚠️ Valor muito alto - pode ser erro");
    return false;
  }
  
  return true;
};
```

## Componente: `./src/static/src/components/voice-command/validators/MissingFieldsIdentifier.js`
```js
export const identifyMissingFields = (analysis) => {
  const required = ["type", "amount", "description"];
  return required.filter(field => !analysis[field]);
};
```

