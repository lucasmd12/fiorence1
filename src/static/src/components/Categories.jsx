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
