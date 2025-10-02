# 1. Arquivos da Raiz do Projeto

## Conteúdo de: `./Readme.md`
```md
rezendeinteligente/
├── .github/
│   └── workflows/
│       ├── gcloud.yml
│       ├── npm-publish.yml
│       └── ... (outros arquivos de workflow)
├── src/
│   ├── auth/
│   │   └── __init__.py
│   ├── database/
│   │   ├── __pycache__/
│   │   ├── __init__.py
│   │   └── mongodb.py
│   ├── models/
│   │   ├── __pycache__/
│   │   ├── __init__.py
│   │   ├── category.py
│   │   ├── category_mongo.py
│   │   ├── transaction.py
│   │   ├── transaction_mongo.py
│   │   ├── user.py
│   │   ├── user_firebase.py
│   │   └── user_mongo.py
│   ├── routes/
│   │   ├── __pycache__/
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── categories_mongo.py
│   │   ├── document_processing.py
│   │   ├── recurring.py
│   │   ├── transactions.py
│   │   ├── transactions_mongo.py
│   │   ├── upload.py
│   │   ├── user.py
│   │   └── user_mongo.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── cloudinary_service.py
│   │   └── document_processor.py
│   ├── static/
│   │   ├── assets/
│   │   │   ├── index-*.css
│   │   │   └── index-*.js
│   │   ├── src/
│   │   │   ├── assets/
│   │   │   ├── components/
│   │   │   │   ├── ui/
│   │   │   │   │   ├── accordion.jsx
│   │   │   │   │   ├── alert-dialog.jsx
│   │   │   │   │   ├── alert.jsx
│   │   │   │   │   ├── ... (muitos outros componentes .jsx)
│   │   │   │   │   └── tooltip.jsx
│   │   │   │   ├── Categories.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── DocumentUploadImproved.jsx
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── RecurringManager.jsx
│   │   │   │   ├── Reports.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Transactions.jsx
│   │   │   │   └── VoiceCommand.jsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.js
│   │   │   ├── lib/
│   │   │   │   ├── firebase.js
│   │   │   │   └── utils.js
│   │   │   ├── App.jsx
│   │   │   ├── index.css
│   │   │   └── main.jsx
│   │   ├── .eslintrc.cjs
│   │   ├── components.json
│   │   ├── favicon.ico
│   │   ├── index.html
│   │   ├── jsconfig.json
│   │   ├── package-lock.json
│   │   ├── package.json
│   │   ├── postcss.config.js
│   │   ├── tailwind.config.js
│   │   └── vite.config.js
│   ├── __init__.py
│   ├── botacharliedeloy-*.json
│   ├── config.py
│   └── main.py
├── .gitignore
├── README.md
├── render.yaml
└── requirements.txt
```

## Conteúdo de: `./render.yaml`
```yaml
services:
  - type: web
    name: rezende-inteligente
    env: python
    # Define a versão do Python
    pythonVersion: '3.10.1'
    
    # --- BUILD COMMAND ---
    # Sequência: Backend Python → Frontend React → Volta para raiz
    buildCommand: |
      # 1. Instalar dependências do backend Python
      pip install -r requirements.txt
      
      # 2. Navegar para o frontend (src/static)
      cd src/static
      
      # 3. Instalar dependências do React
      npm install --legacy-peer-deps
      
      # 4. Buildar o frontend React
      npm run build
      
      # 5. IMPORTANTE: Voltar para a raiz do projeto
      cd ../..

    # --- START COMMAND ---
    # Inicia o servidor Flask a partir da raiz
    startCommand: "gunicorn --bind 0.0.0.0:$PORT src.main:app"

    # --- VARIÁVEIS DE AMBIENTE ---
    envVars:
      - key: MONGO_URI
        fromSecret: true
      - key: REDIS_URL
        fromSecret: true
      - key: SECRET_KEY
        fromSecret: true
      - key: CLOUDINARY_CLOUD_NAME
        fromSecret: true
      - key: CLOUDINARY_API_KEY
        fromSecret: true
      - key: CLOUDINARY_API_SECRET
        fromSecret: true
      - key: FIREBASE_SERVICE_ACCOUNT_BASE64
        fromSecret: true
```

## Conteúdo de: `./requirements.txt`
```txt
# Dependências existentes
gunicorn==21.2.0
blinker==1.9.0
click==8.2.1
Flask==3.1.1
flask-cors==6.0.0
itsdangerous==2.2.0
Jinja2==3.1.6
MarkupSafe==3.0.2
typing_extensions==4.14.0
Werkzeug==3.1.3
pymongo==4.6.1
python-dotenv==1.0.0
redis==5.0.1
firebase-admin==6.4.0
cloudinary==1.39.0

# Dependências para processamento de documentos
reportlab==4.0.9
PyPDF2==3.0.1
pytesseract==0.3.10
Pillow==10.0.1
pandas==2.1.4
openpyxl==3.1.2
opencv-python==4.8.1.78
python-dateutil==2.8.2
regex==2023.12.25

# Dependências adicionais necessárias
xlrd==2.0.1
lxml==4.9.4
beautifulsoup4==4.12.2
```

# 2. Componentes React (UI)

## Conteúdo de: `./src/static/src/components/Categories.jsx`
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

## Conteúdo de: `./src/static/src/components/Dashboard.jsx`
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

## Conteúdo de: `./src/static/src/components/DocumentUploadImproved.jsx`
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

## Conteúdo de: `./src/static/src/components/ErrorBoundary.jsx`
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

## Conteúdo de: `./src/static/src/components/ImportPage.jsx`
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

## Conteúdo de: `./src/static/src/components/Login.jsx`
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

## Conteúdo de: `./src/static/src/components/QuickActions.jsx`
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

## Conteúdo de: `./src/static/src/components/RecurringManager.jsx`
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

## Conteúdo de: `./src/static/src/components/Reports.jsx`
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

## Conteúdo de: `./src/static/src/components/Sidebar.jsx`
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

## Conteúdo de: `./src/static/src/components/ThemeToggle.jsx`
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

## Conteúdo de: `./src/static/src/components/Transactions.jsx`
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

## Conteúdo de: `./src/static/src/components/VoiceCommand.jsx`
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

## Conteúdo de: `./src/static/src/components/ui/accordion.jsx`
```jsx
import * as React from "react"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Accordion({
  ...props
}) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
  className,
  ...props
}) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b last:border-b-0", className)}
      {...props} />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}>
        {children}
        <ChevronDownIcon
          className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}>
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
```

## Conteúdo de: `./src/static/src/components/ui/alert-dialog.jsx`
```jsx
"use client"

import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function AlertDialog({
  ...props
}) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger({
  ...props
}) {
  return (<AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />);
}

function AlertDialogPortal({
  ...props
}) {
  return (<AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />);
}

function AlertDialogOverlay({
  className,
  ...props
}) {
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props} />
  );
}

function AlertDialogContent({
  className,
  ...props
}) {
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <AlertDialogPrimitive.Content
        data-slot="alert-dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        {...props} />
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({
  className,
  ...props
}) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props} />
  );
}

function AlertDialogFooter({
  className,
  ...props
}) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props} />
  );
}

function AlertDialogTitle({
  className,
  ...props
}) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn("text-lg font-semibold", className)}
      {...props} />
  );
}

function AlertDialogDescription({
  className,
  ...props
}) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props} />
  );
}

function AlertDialogAction({
  className,
  ...props
}) {
  return (<AlertDialogPrimitive.Action className={cn(buttonVariants(), className)} {...props} />);
}

function AlertDialogCancel({
  className,
  ...props
}) {
  return (
    <AlertDialogPrimitive.Cancel
      className={cn(buttonVariants({ variant: "outline" }), className)}
      {...props} />
  );
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
```

## Conteúdo de: `./src/static/src/components/ui/alert.jsx`
```jsx
import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props} />
  );
}

function AlertTitle({
  className,
  ...props
}) {
  return (
    <div
      data-slot="alert-title"
      className={cn("col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight", className)}
      {...props} />
  );
}

function AlertDescription({
  className,
  ...props
}) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className
      )}
      {...props} />
  );
}

export { Alert, AlertTitle, AlertDescription }
```

## Conteúdo de: `./src/static/src/components/ui/aspect-ratio.jsx`
```jsx
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"

function AspectRatio({
  ...props
}) {
  return <AspectRatioPrimitive.Root data-slot="aspect-ratio" {...props} />;
}

export { AspectRatio }
```

## Conteúdo de: `./src/static/src/components/ui/avatar.jsx`
```jsx
"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

function Avatar({
  className,
  ...props
}) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn("relative flex size-8 shrink-0 overflow-hidden rounded-full", className)}
      {...props} />
  );
}

function AvatarImage({
  className,
  ...props
}) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props} />
  );
}

function AvatarFallback({
  className,
  ...props
}) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props} />
  );
}

export { Avatar, AvatarImage, AvatarFallback }
```

## Conteúdo de: `./src/static/src/components/ui/badge.jsx`
```jsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props} />
  );
}

export { Badge, badgeVariants }
```

## Conteúdo de: `./src/static/src/components/ui/breadcrumb.jsx`
```jsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"

function Breadcrumb({
  ...props
}) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

function BreadcrumbList({
  className,
  ...props
}) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5",
        className
      )}
      {...props} />
  );
}

function BreadcrumbItem({
  className,
  ...props
}) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props} />
  );
}

function BreadcrumbLink({
  asChild,
  className,
  ...props
}) {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn("hover:text-foreground transition-colors", className)}
      {...props} />
  );
}

function BreadcrumbPage({
  className,
  ...props
}) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("text-foreground font-normal", className)}
      {...props} />
  );
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      {...props}>
      {children ?? <ChevronRight />}
    </li>
  );
}

function BreadcrumbEllipsis({
  className,
  ...props
}) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}>
      <MoreHorizontal className="size-4" />
      <span className="sr-only">More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
```

## Conteúdo de: `./src/static/src/components/ui/button.jsx`
```jsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
```

## Conteúdo de: `./src/static/src/components/ui/calendar.jsx`
```jsx
import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        caption: "flex justify-center pt-1 relative items-center w-full",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-x-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_start:
          "day-range-start aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_range_end:
          "day-range-end aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("size-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("size-4", className)} {...props} />
        ),
      }}
      {...props} />
  );
}

export { Calendar }
```

## Conteúdo de: `./src/static/src/components/ui/card.jsx`
```jsx
import * as React from "react"

import { cn } from "@/lib/utils"

function Card({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        "backdrop-blur-sm", // Adiciona o efeito de desfoque no fundo do card
        className
      )}
      {...props} />
  );
}

function CardHeader({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props} />
  );
}

function CardTitle({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props} />
  );
}

function CardDescription({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props} />
  );
}

function CardAction({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props} />
  );
}

function CardContent({
  className,
  ...props
}) {
  return (<div data-slot="card-content" className={cn("px-6", className)} {...props} />);
}

function CardFooter({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props} />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
```

## Conteúdo de: `./src/static/src/components/ui/carousel.jsx`
```jsx
"use client";
import * as React from "react"
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const CarouselContext = React.createContext(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}) {
  const [carouselRef, api] = useEmblaCarousel({
    ...opts,
    axis: orientation === "horizontal" ? "x" : "y",
  }, plugins)
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const onSelect = React.useCallback((api) => {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  const handleKeyDown = React.useCallback((event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      scrollPrev()
    } else if (event.key === "ArrowRight") {
      event.preventDefault()
      scrollNext()
    }
  }, [scrollPrev, scrollNext])

  React.useEffect(() => {
    if (!api || !setApi) return
    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) return
    onSelect(api)
    api.on("reInit", onSelect)
    api.on("select", onSelect)

    return () => {
      api?.off("select", onSelect)
    };
  }, [api, onSelect])

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}>
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}>
        {children}
      </div>
    </CarouselContext.Provider>
  );
}

function CarouselContent({
  className,
  ...props
}) {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden"
      data-slot="carousel-content">
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props} />
    </div>
  );
}

function CarouselItem({
  className,
  ...props
}) {
  const { orientation } = useCarousel()

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props} />
  );
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  ...props
}) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn("absolute size-8 rounded-full", orientation === "horizontal"
        ? "top-1/2 -left-12 -translate-y-1/2"
        : "-top-12 left-1/2 -translate-x-1/2 rotate-90", className)}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}>
      <ArrowLeft />
      <span className="sr-only">Previous slide</span>
    </Button>
  );
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  ...props
}) {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn("absolute size-8 rounded-full", orientation === "horizontal"
        ? "top-1/2 -right-12 -translate-y-1/2"
        : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90", className)}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}>
      <ArrowRight />
      <span className="sr-only">Next slide</span>
    </Button>
  );
}

export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext };
```

## Conteúdo de: `./src/static/src/components/ui/chart.jsx`
```jsx
import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = {
  light: "",
  dark: ".dark"
}

const ChartContext = React.createContext(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className
        )}
        {...props}>
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

const ChartStyle = ({
  id,
  config
}) => {
  const colorConfig = Object.entries(config).filter(([, config]) => config.theme || config.color)

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
.map(([key, itemConfig]) => {
const color =
  itemConfig.theme?.[theme] ||
  itemConfig.color
return color ? `  --color-${key}: ${color};` : null
})
.join("\n")}
}
`)
          .join("\n"),
      }} />
  );
}

const ChartTooltip = RechartsPrimitive.Tooltip

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey
}) {
  const { config } = useChart()

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null
    }

    const [item] = payload
    const key = `${labelKey || item?.dataKey || item?.name || "value"}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    const value =
      !labelKey && typeof label === "string"
        ? config[label]?.label || label
        : itemConfig?.label

    if (labelFormatter) {
      return (
        <div className={cn("font-medium", labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      );
    }

    if (!value) {
      return null
    }

    return <div className={cn("font-medium", labelClassName)}>{value}</div>;
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ])

  if (!active || !payload?.length) {
    return null
  }

  const nestLabel = payload.length === 1 && indicator !== "dot"

  return (
    <div
      className={cn(
        "border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}>
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload.map((item, index) => {
          const key = `${nameKey || item.name || item.dataKey || "value"}`
          const itemConfig = getPayloadConfigFromPayload(config, item, key)
          const indicatorColor = color || item.payload.fill || item.color

          return (
            <div
              key={item.dataKey}
              className={cn(
                "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
                indicator === "dot" && "items-center"
              )}>
              {formatter && item?.value !== undefined && item.name ? (
                formatter(item.value, item.name, item, index, item.payload)
              ) : (
                <>
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    !hideIndicator && (
                      <div
                        className={cn("shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)", {
                          "h-2.5 w-2.5": indicator === "dot",
                          "w-1": indicator === "line",
                          "w-0 border-[1.5px] border-dashed bg-transparent":
                            indicator === "dashed",
                          "my-0.5": nestLabel && indicator === "dashed",
                        })}
                        style={
                          {
                            "--color-bg": indicatorColor,
                            "--color-border": indicatorColor
                          }
                        } />
                    )
                  )}
                  <div
                    className={cn(
                      "flex flex-1 justify-between leading-none",
                      nestLabel ? "items-end" : "items-center"
                    )}>
                    <div className="grid gap-1.5">
                      {nestLabel ? tooltipLabel : null}
                      <span className="text-muted-foreground">
                        {itemConfig?.label || item.name}
                      </span>
                    </div>
                    {item.value && (
                      <span className="text-foreground font-mono font-medium tabular-nums">
                        {item.value.toLocaleString()}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ChartLegend = RechartsPrimitive.Legend

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey
}) {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className
      )}>
      {payload.map((item) => {
        const key = `${nameKey || item.dataKey || "value"}`
        const itemConfig = getPayloadConfigFromPayload(config, item, key)

        return (
          <div
            key={item.value}
            className={cn(
              "[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3"
            )}>
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color,
                }} />
            )}
            {itemConfig?.label}
          </div>
        );
      })}
    </div>
  );
}

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config,
  payload,
  key
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey = key

  if (
    key in payload &&
    typeof payload[key] === "string"
  ) {
    configLabelKey = payload[key]
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key] === "string"
  ) {
    configLabelKey = payloadPayload[key]
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key];
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}
```

## Conteúdo de: `./src/static/src/components/ui/checkbox.jsx`
```jsx
"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-input dark:bg-input/30 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}>
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none">
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox }
```

## Conteúdo de: `./src/static/src/components/ui/collapsible.jsx`
```jsx
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

function Collapsible({
  ...props
}) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

function CollapsibleTrigger({
  ...props
}) {
  return (<CollapsiblePrimitive.CollapsibleTrigger data-slot="collapsible-trigger" {...props} />);
}

function CollapsibleContent({
  ...props
}) {
  return (<CollapsiblePrimitive.CollapsibleContent data-slot="collapsible-content" {...props} />);
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
```

## Conteúdo de: `./src/static/src/components/ui/command.jsx`
```jsx
"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

function Command({
  className,
  ...props
}) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
        className
      )}
      {...props} />
  );
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  ...props
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent className="overflow-hidden p-0">
        <Command
          className="[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({
  className,
  ...props
}) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex h-9 items-center gap-2 border-b px-3">
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props} />
    </div>
  );
}

function CommandList({
  className,
  ...props
}) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn("max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto", className)}
      {...props} />
  );
}

function CommandEmpty({
  ...props
}) {
  return (<CommandPrimitive.Empty data-slot="command-empty" className="py-6 text-center text-sm" {...props} />);
}

function CommandGroup({
  className,
  ...props
}) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
        className
      )}
      {...props} />
  );
}

function CommandSeparator({
  className,
  ...props
}) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("bg-border -mx-1 h-px", className)}
      {...props} />
  );
}

function CommandItem({
  className,
  ...props
}) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props} />
  );
}

function CommandShortcut({
  className,
  ...props
}) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn("text-muted-foreground ml-auto text-xs tracking-widest", className)}
      {...props} />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
```

## Conteúdo de: `./src/static/src/components/ui/context-menu.jsx`
```jsx
"use client"

import * as React from "react"
import * as ContextMenuPrimitive from "@radix-ui/react-context-menu"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function ContextMenu({
  ...props
}) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

function ContextMenuTrigger({
  ...props
}) {
  return (<ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />);
}

function ContextMenuGroup({
  ...props
}) {
  return (<ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />);
}

function ContextMenuPortal({
  ...props
}) {
  return (<ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />);
}

function ContextMenuSub({
  ...props
}) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />;
}

function ContextMenuRadioGroup({
  ...props
}) {
  return (<ContextMenuPrimitive.RadioGroup data-slot="context-menu-radio-group" {...props} />);
}

function ContextMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}) {
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}>
      {children}
      <ChevronRightIcon className="ml-auto" />
    </ContextMenuPrimitive.SubTrigger>
  );
}

function ContextMenuSubContent({
  className,
  ...props
}) {
  return (
    <ContextMenuPrimitive.SubContent
      data-slot="context-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className
      )}
      {...props} />
  );
}

function ContextMenuContent({
  className,
  ...props
}) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-context-menu-content-available-height) min-w-[8rem] origin-(--radix-context-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className
        )}
        {...props} />
    </ContextMenuPrimitive.Portal>
  );
}

function ContextMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props} />
  );
}

function ContextMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}) {
  return (
    <ContextMenuPrimitive.CheckboxItem
      data-slot="context-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}>
      <span
        className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  );
}

function ContextMenuRadioItem({
  className,
  children,
  ...props
}) {
  return (
    <ContextMenuPrimitive.RadioItem
      data-slot="context-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}>
      <span
        className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <ContextMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </ContextMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </ContextMenuPrimitive.RadioItem>
  );
}

function ContextMenuLabel({
  className,
  inset,
  ...props
}) {
  return (
    <ContextMenuPrimitive.Label
      data-slot="context-menu-label"
      data-inset={inset}
      className={cn(
        "text-foreground px-2 py-1.5 text-sm font-medium data-[inset]:pl-8",
        className
      )}
      {...props} />
  );
}

function ContextMenuSeparator({
  className,
  ...props
}) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props} />
  );
}

function ContextMenuShortcut({
  className,
  ...props
}) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn("text-muted-foreground ml-auto text-xs tracking-widest", className)}
      {...props} />
  );
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}
```

## Conteúdo de: `./src/static/src/components/ui/dialog.jsx`
```jsx
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Dialog({
  ...props
}) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props} />
  );
}

function DialogContent({
  className,
  children,
  ...props
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        )}
        {...props}>
        {children}
        <DialogPrimitive.Close
          className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
          <XIcon />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({
  className,
  ...props
}) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props} />
  );
}

function DialogFooter({
  className,
  ...props
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props} />
  );
}

function DialogTitle({
  className,
  ...props
}) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props} />
  );
}

function DialogDescription({
  className,
  ...props
}) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props} />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  // Aliases para compatibilidade com quem espera Radix-style
  Dialog as Root,
  DialogTrigger as Trigger,
  DialogContent as Content,
  DialogHeader as Header,
  DialogTitle as Title,
  DialogDescription as Description,
}
```

## Conteúdo de: `./src/static/src/components/ui/drawer.jsx`
```jsx
import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn } from "@/lib/utils"

function Drawer({
  ...props
}) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />;
}

function DrawerTrigger({
  ...props
}) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal({
  ...props
}) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({
  ...props
}) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({
  className,
  ...props
}) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props} />
  );
}

function DrawerContent({
  className,
  children,
  ...props
}) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          "group/drawer-content bg-background fixed z-50 flex h-auto flex-col",
          "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b",
          "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
          "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm",
          "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm",
          className
        )}
        {...props}>
        <div
          className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  );
}

function DrawerHeader({
  className,
  ...props
}) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props} />
  );
}

function DrawerFooter({
  className,
  ...props
}) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props} />
  );
}

function DrawerTitle({
  className,
  ...props
}) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("text-foreground font-semibold", className)}
      {...props} />
  );
}

function DrawerDescription({
  className,
  ...props
}) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props} />
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}
```

## Conteúdo de: `./src/static/src/components/ui/dropdown-menu.jsx`
```jsx
"use client"

import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function DropdownMenu({
  ...props
}) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal({
  ...props
}) {
  return (<DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />);
}

function DropdownMenuTrigger({
  ...props
}) {
  return (<DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />);
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  ...props
}) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",
          className
        )}
        {...props} />
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuGroup({
  ...props
}) {
  return (<DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />);
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props} />
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  ...props
}) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}>
      <span
        className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup({
  ...props
}) {
  return (<DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />);
}

function DropdownMenuRadioItem({
  className,
  children,
  ...props
}) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}>
      <span
        className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn("px-2 py-1.5 text-sm font-medium data-[inset]:pl-8", className)}
      {...props} />
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props} />
  );
}

function DropdownMenuShortcut({
  className,
  ...props
}) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn("text-muted-foreground ml-auto text-xs tracking-widest", className)}
      {...props} />
  );
}

function DropdownMenuSub({
  ...props
}) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />;
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[inset]:pl-8",
        className
      )}
      {...props}>
      {children}
      <ChevronRightIcon className="ml-auto size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  ...props
}) {
  return (
    <DropdownMenuPrimitive.SubContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className
      )}
      {...props} />
  );
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
```

## Conteúdo de: `./src/static/src/components/ui/form.jsx`
```jsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { Controller, FormProvider, useFormContext, useFormState } from "react-hook-form";

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider

const FormFieldContext = React.createContext({})

const FormField = (
  {
    ...props
  }
) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: fieldContext.name })
  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

const FormItemContext = React.createContext({})

function FormItem({
  className,
  ...props
}) {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div data-slot="form-item" className={cn("grid gap-2", className)} {...props} />
    </FormItemContext.Provider>
  );
}

function FormLabel({
  className,
  ...props
}) {
  const { error, formItemId } = useFormField()

  return (
    <Label
      data-slot="form-label"
      data-error={!!error}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={formItemId}
      {...props} />
  );
}

function FormControl({
  ...props
}) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      data-slot="form-control"
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props} />
  );
}

function FormDescription({
  className,
  ...props
}) {
  const { formDescriptionId } = useFormField()

  return (
    <p
      data-slot="form-description"
      id={formDescriptionId}
      className={cn("text-muted-foreground text-sm", className)}
      {...props} />
  );
}

function FormMessage({
  className,
  ...props
}) {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message ?? "") : props.children

  if (!body) {
    return null
  }

  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn("text-destructive text-sm", className)}
      {...props}>
      {body}
    </p>
  );
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}
```

## Conteúdo de: `./src/static/src/components/ui/hover-card.jsx`
```jsx
import * as React from "react"
import * as HoverCardPrimitive from "@radix-ui/react-hover-card"

import { cn } from "@/lib/utils"

function HoverCard({
  ...props
}) {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />;
}

function HoverCardTrigger({
  ...props
}) {
  return (<HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />);
}

function HoverCardContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}) {
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className
        )}
        {...props} />
    </HoverCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent }
```

## Conteúdo de: `./src/static/src/components/ui/input-otp.jsx`
```jsx
"use client"

import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"
import { MinusIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function InputOTP({
  className,
  containerClassName,
  ...props
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn("flex items-center gap-2 has-disabled:opacity-50", containerClassName)}
      className={cn("disabled:cursor-not-allowed", className)}
      {...props} />
  );
}

function InputOTPGroup({
  className,
  ...props
}) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center", className)}
      {...props} />
  );
}

function InputOTPSlot({
  index,
  className,
  ...props
}) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        "data-[active=true]:border-ring data-[active=true]:ring-ring/50 data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40 aria-invalid:border-destructive data-[active=true]:aria-invalid:border-destructive dark:bg-input/30 border-input relative flex h-9 w-9 items-center justify-center border-y border-r text-sm shadow-xs transition-all outline-none first:rounded-l-md first:border-l last:rounded-r-md data-[active=true]:z-10 data-[active=true]:ring-[3px]",
        className
      )}
      {...props}>
      {char}
      {hasFakeCaret && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator({
  ...props
}) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <MinusIcon />
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
```

## Conteúdo de: `./src/static/src/components/ui/input.jsx`
```jsx
import * as React from "react"

import { cn } from "@/lib/utils"

function Input({
  className,
  type,
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      {...props} />
  );
}

export { Input }
```

## Conteúdo de: `./src/static/src/components/ui/label.jsx`
```jsx
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

function Label({
  className,
  ...props
}) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props} />
  );
}

export { Label }
```

## Conteúdo de: `./src/static/src/components/ui/menubar.jsx`
```jsx
import * as React from "react"
import * as MenubarPrimitive from "@radix-ui/react-menubar"
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Menubar({
  className,
  ...props
}) {
  return (
    <MenubarPrimitive.Root
      data-slot="menubar"
      className={cn(
        "bg-background flex h-9 items-center gap-1 rounded-md border p-1 shadow-xs",
        className
      )}
      {...props} />
  );
}

function MenubarMenu({
  ...props
}) {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />;
}

function MenubarGroup({
  ...props
}) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />;
}

function MenubarPortal({
  ...props
}) {
  return <MenubarPrimitive.Portal data-slot="menubar-portal" {...props} />;
}

function MenubarRadioGroup({
  ...props
}) {
  return (<MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />);
}

function MenubarTrigger({
  className,
  ...props
}) {
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex items-center rounded-sm px-2 py-1 text-sm font-medium outline-hidden select-none",
        className
      )}
      {...props} />
  );
}

function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  ...props
}) {
  return (
    <MenubarPortal>
      <MenubarPrimitive.Content
        data-slot="menubar-content"
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[12rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-md",
          className
        )}
        {...props} />
    </MenubarPortal>
  );
}

function MenubarItem({
  className,
  inset,
  variant = "default",
  ...props
}) {
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props} />
  );
}

function MenubarCheckboxItem({
  className,
  children,
  checked,
  ...props
}) {
  return (
    <MenubarPrimitive.CheckboxItem
      data-slot="menubar-checkbox-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-xs py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      checked={checked}
      {...props}>
      <span
        className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.CheckboxItem>
  );
}

function MenubarRadioItem({
  className,
  children,
  ...props
}) {
  return (
    <MenubarPrimitive.RadioItem
      data-slot="menubar-radio-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground relative flex cursor-default items-center gap-2 rounded-xs py-1.5 pr-2 pl-8 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}>
      <span
        className="pointer-events-none absolute left-2 flex size-3.5 items-center justify-center">
        <MenubarPrimitive.ItemIndicator>
          <CircleIcon className="size-2 fill-current" />
        </MenubarPrimitive.ItemIndicator>
      </span>
      {children}
    </MenubarPrimitive.RadioItem>
  );
}

function MenubarLabel({
  className,
  inset,
  ...props
}) {
  return (
    <MenubarPrimitive.Label
      data-slot="menubar-label"
      data-inset={inset}
      className={cn("px-2 py-1.5 text-sm font-medium data-[inset]:pl-8", className)}
      {...props} />
  );
}

function MenubarSeparator({
  className,
  ...props
}) {
  return (
    <MenubarPrimitive.Separator
      data-slot="menubar-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props} />
  );
}

function MenubarShortcut({
  className,
  ...props
}) {
  return (
    <span
      data-slot="menubar-shortcut"
      className={cn("text-muted-foreground ml-auto text-xs tracking-widest", className)}
      {...props} />
  );
}

function MenubarSub({
  ...props
}) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />;
}

function MenubarSubTrigger({
  className,
  inset,
  children,
  ...props
}) {
  return (
    <MenubarPrimitive.SubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset}
      className={cn(
        "focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[inset]:pl-8",
        className
      )}
      {...props}>
      {children}
      <ChevronRightIcon className="ml-auto h-4 w-4" />
    </MenubarPrimitive.SubTrigger>
  );
}

function MenubarSubContent({
  className,
  ...props
}) {
  return (
    <MenubarPrimitive.SubContent
      data-slot="menubar-sub-content"
      className={cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 min-w-[8rem] origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-lg",
        className
      )}
      {...props} />
  );
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
}
```

## Conteúdo de: `./src/static/src/components/ui/navigation-menu.jsx`
```jsx
import * as React from "react"
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import { cva } from "class-variance-authority"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className
      )}
      {...props}>
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  );
}

function NavigationMenuList({
  className,
  ...props
}) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn("group flex flex-1 list-none items-center justify-center gap-1", className)}
      {...props} />
  );
}

function NavigationMenuItem({
  className,
  ...props
}) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props} />
  );
}

const navigationMenuTriggerStyle = cva(
  "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 outline-none transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1"
)

function NavigationMenuTrigger({
  className,
  children,
  ...props
}) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      {...props}>
      {children}{" "}
      <ChevronDownIcon
        className="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180"
        aria-hidden="true" />
    </NavigationMenuPrimitive.Trigger>
  );
}

function NavigationMenuContent({
  className,
  ...props
}) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 top-0 left-0 w-full p-2 pr-2.5 md:absolute md:w-auto",
        "group-data-[viewport=false]/navigation-menu:bg-popover group-data-[viewport=false]/navigation-menu:text-popover-foreground group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:duration-200 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none",
        className
      )}
      {...props} />
  );
}

function NavigationMenuViewport({
  className,
  ...props
}) {
  return (
    <div
      className={cn("absolute top-full left-0 isolate z-50 flex justify-center")}>
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "origin-top-center bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border shadow md:w-[var(--radix-navigation-menu-viewport-width)]",
          className
        )}
        {...props} />
    </div>
  );
}

function NavigationMenuLink({
  className,
  ...props
}) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-ring/50 [&_svg:not([class*='text-'])]:text-muted-foreground flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none focus-visible:ring-[3px] focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props} />
  );
}

function NavigationMenuIndicator({
  className,
  ...props
}) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        "data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden",
        className
      )}
      {...props}>
      <div
        className="bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md" />
    </NavigationMenuPrimitive.Indicator>
  );
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
}
```

## Conteúdo de: `./src/static/src/components/ui/pagination.jsx`
```jsx
import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button";

function Pagination({
  className,
  ...props
}) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props} />
  );
}

function PaginationContent({
  className,
  ...props
}) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props} />
  );
}

function PaginationItem({
  ...props
}) {
  return <li data-slot="pagination-item" {...props} />;
}

function PaginationLink({
  className,
  isActive,
  size = "icon",
  ...props
}) {
  return (
    <a
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }), className)}
      {...props} />
  );
}

function PaginationPrevious({
  className,
  ...props
}) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}>
      <ChevronLeftIcon />
      <span className="hidden sm:block">Previous</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  ...props
}) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}>
      <span className="hidden sm:block">Next</span>
      <ChevronRightIcon />
    </PaginationLink>
  );
}

function PaginationEllipsis({
  className,
  ...props
}) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}>
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
```

## Conteúdo de: `./src/static/src/components/ui/popover.jsx`
```jsx
"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

function Popover({
  ...props
}) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
  ...props
}) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className
        )}
        {...props} />
    </PopoverPrimitive.Portal>
  );
}

function PopoverAnchor({
  ...props
}) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
```

## Conteúdo de: `./src/static/src/components/ui/progress.jsx`
```jsx
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value,
  ...props
}) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}>
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary h-full w-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }} />
    </ProgressPrimitive.Root>
  );
}

export { Progress }
```

## Conteúdo de: `./src/static/src/components/ui/radio-group.jsx`
```jsx
"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { CircleIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function RadioGroup({
  className,
  ...props
}) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props} />
  );
}

function RadioGroupItem({
  className,
  ...props
}) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}>
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center">
        <CircleIcon
          className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem }
```

## Conteúdo de: `./src/static/src/components/ui/resizable.jsx`
```jsx
import * as React from "react"
import { GripVerticalIcon } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

function ResizablePanelGroup({
  className,
  ...props
}) {
  return (
    <ResizablePrimitive.PanelGroup
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className
      )}
      {...props} />
  );
}

function ResizablePanel({
  ...props
}) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />;
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}) {
  return (
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        "bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0 [&[data-panel-group-direction=vertical]>div]:rotate-90",
        className
      )}
      {...props}>
      {withHandle && (
        <div
          className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
          <GripVerticalIcon className="size-2.5" />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
```

## Conteúdo de: `./src/static/src/components/ui/scroll-area.jsx`
```jsx
"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

function ScrollArea({
  className,
  children,
  ...props
}) {
  return (
    <ScrollAreaPrimitive.Root data-slot="scroll-area" className={cn("relative", className)} {...props}>
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1">
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        className
      )}
      {...props}>
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="bg-border relative flex-1 rounded-full" />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar }
```

## Conteúdo de: `./src/static/src/components/ui/select.jsx`
```jsx
import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Select({
  ...props
}) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({
  ...props
}) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue({
  ...props
}) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}>
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}>
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn("p-1", position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1")}>
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props} />
  );
}

function SelectItem({
  className,
  children,
  ...props
}) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}>
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props} />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn("flex cursor-default items-center justify-center py-1", className)}
      {...props}>
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn("flex cursor-default items-center justify-center py-1", className)}
      {...props}>
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
```

## Conteúdo de: `./src/static/src/components/ui/separator.jsx`
```jsx
"use client"

import * as React from "react"
import * as SeparatorPrimitive from "@radix-ui/react-separator"

import { cn } from "@/lib/utils"

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator-root"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props} />
  );
}

export { Separator }
```

## Conteúdo de: `./src/static/src/components/ui/sheet.jsx`
```jsx
import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Sheet({
  ...props
}) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
  ...props
}) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
  ...props
}) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({
  ...props
}) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props} />
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" &&
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" &&
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          className
        )}
        {...props}>
        {children}
        <SheetPrimitive.Close
          className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({
  className,
  ...props
}) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props} />
  );
}

function SheetFooter({
  className,
  ...props
}) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props} />
  );
}

function SheetTitle({
  className,
  ...props
}) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props} />
  );
}

function SheetDescription({
  className,
  ...props
}) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props} />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
```

## Conteúdo de: `./src/static/src/components/ui/sidebar.jsx`
```jsx
"use client";
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";
import { PanelLeftIcon } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

const SidebarContext = React.createContext(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = React.useCallback((value) => {
    const openState = typeof value === "function" ? value(open) : value
    if (setOpenProp) {
      setOpenProp(openState)
    } else {
      _setOpen(openState)
    }

    // This sets the cookie to keep the sidebar state.
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
  }, [setOpenProp, open])

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
  }, [isMobile, setOpen, setOpenMobile])

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar])

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "expanded" : "collapsed"

  const contextValue = React.useMemo(() => ({
    state,
    open,
    setOpen,
    isMobile,
    openMobile,
    setOpenMobile,
    toggleSidebar,
  }), [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar])

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style
            }
          }
          className={cn(
            "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
            className
          )}
          {...props}>
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
          className
        )}
        {...props}>
        {children}
      </div>
    );
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE
            }
          }
          side={side}>
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className="group peer text-sidebar-foreground hidden md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar">
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
        )} />
      <div
        data-slot="sidebar-container"
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          // Adjust the padding for floating and inset variants.
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className
        )}
        {...props}>
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("size-7", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}>
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

function SidebarRail({
  className,
  ...props
}) {
  const { toggleSidebar } = useSidebar()

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      )}
      {...props} />
  );
}

function SidebarInset({
  className,
  ...props
}) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "bg-background relative flex w-full flex-1 flex-col",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className
      )}
      {...props} />
  );
}

function SidebarInput({
  className,
  ...props
}) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn("bg-background h-8 w-full shadow-none", className)}
      {...props} />
  );
}

function SidebarHeader({
  className,
  ...props
}) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props} />
  );
}

function SidebarFooter({
  className,
  ...props
}) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props} />
  );
}

function SidebarSeparator({
  className,
  ...props
}) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn("bg-sidebar-border mx-2 w-auto", className)}
      {...props} />
  );
}

function SidebarContent({
  className,
  ...props
}) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      )}
      {...props} />
  );
}

function SidebarGroup({
  className,
  ...props
}) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col p-2", className)}
      {...props} />
  );
}

function SidebarGroupLabel({
  className,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        "text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
        className
      )}
      {...props} />
  );
}

function SidebarGroupAction({
  className,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 md:after:hidden",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props} />
  );
}

function SidebarGroupContent({
  className,
  ...props
}) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props} />
  );
}

function SidebarMenu({
  className,
  ...props
}) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props} />
  );
}

function SidebarMenuItem({
  className,
  ...props
}) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props} />
  );
}

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}) {
  const Comp = asChild ? Slot : "button"
  const { isMobile, state } = useSidebar()

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props} />
  )

  if (!tooltip) {
    return button
  }

  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip,
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        {...tooltip} />
    </Tooltip>
  );
}

function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 md:after:hidden",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0",
        className
      )}
      {...props} />
  );
}

function SidebarMenuBadge({
  className,
  ...props
}) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "text-sidebar-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none",
        "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "peer-data-[size=sm]/menu-button:top-1",
        "peer-data-[size=default]/menu-button:top-1.5",
        "peer-data-[size=lg]/menu-button:top-2.5",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props} />
  );
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}) {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  }, [])

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
      {...props}>
      {showIcon && (
        <Skeleton className="size-4 rounded-md" data-sidebar="menu-skeleton-icon" />
      )}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width
          }
        } />
    </div>
  );
}

function SidebarMenuSub({
  className,
  ...props
}) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "border-sidebar-border mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l px-2.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props} />
  );
}

function SidebarMenuSubItem({
  className,
  ...props
}) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props} />
  );
}

function SidebarMenuSubButton({
  asChild = false,
  size = "md",
  isActive = false,
  className,
  ...props
}) {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" && "text-xs",
        size === "md" && "text-sm",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props} />
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
```

## Conteúdo de: `./src/static/src/components/ui/skeleton.jsx`
```jsx
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props} />
  );
}

export { Skeleton }
```

## Conteúdo de: `./src/static/src/components/ui/slider.jsx`
```jsx
"use client"

import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}) {
  const _values = React.useMemo(() =>
    Array.isArray(value)
      ? value
      : Array.isArray(defaultValue)
        ? defaultValue
        : [min, max], [value, defaultValue, min, max])

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className
      )}
      {...props}>
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
        )}>
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
          )} />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className="border-primary bg-background ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50" />
      ))}
    </SliderPrimitive.Root>
  );
}

export { Slider }
```

## Conteúdo de: `./src/static/src/components/ui/sonner.jsx`
```jsx
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner";

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)"
        }
      }
      {...props} />
  );
}

export { Toaster }
```

## Conteúdo de: `./src/static/src/components/ui/switch.jsx`
```jsx
"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}>
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
        )} />
    </SwitchPrimitive.Root>
  );
}

export { Switch }
```

## Conteúdo de: `./src/static/src/components/ui/table.jsx`
```jsx
import * as React from "react"

import { cn } from "@/lib/utils"

function Table({
  className,
  ...props
}) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props} />
    </div>
  );
}

function TableHeader({
  className,
  ...props
}) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props} />
  );
}

function TableBody({
  className,
  ...props
}) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props} />
  );
}

function TableFooter({
  className,
  ...props
}) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("bg-muted/50 border-t font-medium [&>tr]:last:border-b-0", className)}
      {...props} />
  );
}

function TableRow({
  className,
  ...props
}) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
        className
      )}
      {...props} />
  );
}

function TableHead({
  className,
  ...props
}) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props} />
  );
}

function TableCell({
  className,
  ...props
}) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props} />
  );
}

function TableCaption({
  className,
  ...props
}) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props} />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
```

## Conteúdo de: `./src/static/src/components/ui/tabs.jsx`
```jsx
"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

function Tabs({
  className,
  ...props
}) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props} />
  );
}

function TabsList({
  className,
  ...props
}) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
        className
      )}
      {...props} />
  );
}

function TabsTrigger({
  className,
  ...props
}) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props} />
  );
}

function TabsContent({
  className,
  ...props
}) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props} />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
```

## Conteúdo de: `./src/static/src/components/ui/textarea.jsx`
```jsx
import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({
  className,
  ...props
}) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props} />
  );
}

export { Textarea }
```

## Conteúdo de: `./src/static/src/components/ui/toggle-group.jsx`
```jsx
"use client";
import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"

import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"

const ToggleGroupContext = React.createContext({
  size: "default",
  variant: "default",
})

function ToggleGroup({
  className,
  variant,
  size,
  children,
  ...props
}) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      className={cn(
        "group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs",
        className
      )}
      {...props}>
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      className={cn(toggleVariants({
        variant: context.variant || variant,
        size: context.size || size,
      }), "min-w-0 flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l", className)}
      {...props}>
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { ToggleGroup, ToggleGroupItem }
```

## Conteúdo de: `./src/static/src/components/ui/toggle.jsx`
```jsx
import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const toggleVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none transition-[color,box-shadow] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-9 px-2 min-w-9",
        sm: "h-8 px-1.5 min-w-8",
        lg: "h-10 px-2.5 min-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant,
  size,
  ...props
}) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Toggle, toggleVariants }
```

## Conteúdo de: `./src/static/src/components/ui/tooltip.jsx`
```jsx
import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delayDuration = 0,
  ...props
}) {
  return (<TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />);
}

function Tooltip({
  ...props
}) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({
  ...props
}) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
          className
        )}
        {...props}>
        {children}
        <TooltipPrimitive.Arrow
          className="bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
```

# 3. Módulo de Comando de Voz

## Conteúdo de: `./src/static/src/components/voice-command/constants/brazilianSlangDictionary.js`
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

## Conteúdo de: `./src/static/src/components/voice-command/constants/keywords.js`
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

## Conteúdo de: `./src/static/src/components/voice-command/constants/numberMaps.js`
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

## Conteúdo de: `./src/static/src/components/voice-command/constants/patterns.js`
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

## Conteúdo de: `./src/static/src/components/voice-command/core/CommandMapper.js`
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

## Conteúdo de: `./src/static/src/components/voice-command/core/NLPProcessor.js`
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

## Conteúdo de: `./src/static/src/components/voice-command/extractors/AmountExtractor.js`
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

## Conteúdo de: `./src/static/src/components/voice-command/extractors/CategoryExtractor.js`
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

## Conteúdo de: `./src/static/src/components/voice-command/extractors/DateExtractor.js`
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

## Conteúdo de: `./src/static/src/components/voice-command/extractors/DescriptionExtractor.js`
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

## Conteúdo de: `./src/static/src/components/voice-command/extractors/IntentExtractor.js`
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

## Conteúdo de: `./src/static/src/components/voice-command/extractors/RecurringExtractor.js`
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

## Conteúdo de: `./src/static/src/components/voice-command/extractors/StatusExtractor.js`
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

## Conteúdo de: `./src/static/src/components/voice-command/extractors/TransactionTypeExtractor.js`
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

## Conteúdo de: `./src/static/src/components/voice-command/formatters/CurrencyFormatter.js`
```js
export const formatCurrency = (value) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value || 0);
};
```

## Conteúdo de: `./src/static/src/components/voice-command/formatters/DateFormatter.js`
```js
export const formatISO = (date) => date.toISOString().split("T")[0];
export const formatBR = (date) => date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
```

## Conteúdo de: `./src/static/src/components/voice-command/hooks/useSpeechRecognition.js`
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

## Conteúdo de: `./src/static/src/components/voice-command/services/SpeechRecognitionService.js`
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

## Conteúdo de: `./src/static/src/components/voice-command/services/SpeechSynthesisService.js`
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

## Conteúdo de: `./src/static/src/components/voice-command/services/apiClient.js`
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

## Conteúdo de: `./src/static/src/components/voice-command/utils/ConversationManager.js`
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

## Conteúdo de: `./src/static/src/components/voice-command/validators/AmountValidator.js`
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

## Conteúdo de: `./src/static/src/components/voice-command/validators/MissingFieldsIdentifier.js`
```js
export const identifyMissingFields = (analysis) => {
  const required = ["type", "amount", "description"];
  return required.filter(field => !analysis[field]);
};
```

