import { useState } from 'react'
import { TrendingUp, TrendingDown, Calendar, X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

const QuickActions = ({ context, onTransactionAdded }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [actionType, setActionType] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [categories, setCategories] = useState([])

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category_id: '',
    date: new Date().toISOString().split('T')[0],
    type: '',
    context: context,
    recurring: false,
    recurring_frequency: 'monthly',
    recurring_day: new Date().getDate()
  })

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      category_id: '',
      date: new Date().toISOString().split('T')[0],
      type: '',
      context: context,
      recurring: false,
      recurring_frequency: 'monthly',
      recurring_day: new Date().getDate()
    })
    setError('')
    setSuccess('')
  }

  const openDialog = async (type) => {
    setActionType(type)
    const transactionType = type === 'recurring' ? 'expense' : type;
    setFormData(prev => ({ ...prev, type: transactionType, category_id: '' }))
    setIsDialogOpen(true)
    
    await loadCategories(transactionType)
  }

  const loadCategories = async (type) => {
    if (!type) return;
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`/api/categories?context=${context}&type=${type}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        console.error('Erro ao carregar categorias:', response.status)
        setCategories([])
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
      setCategories([])
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.type) {
        setError('O tipo (receita ou despesa) é obrigatório.');
        setLoading(false);
        return;
    }

    try {
      const token = localStorage.getItem('authToken')
      
      if (!formData.description.trim()) {
        setError('Descrição é obrigatória')
        setLoading(false)
        return
      }
      
      if (!formData.amount || parseFloat(formData.amount) <= 0) {
        setError('Valor deve ser maior que zero')
        setLoading(false)
        return
      }

      if (!formData.category_id) {
        setError('Selecione uma categoria')
        setLoading(false)
        return
      }

      const transactionData = {
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        category_id: String(formData.category_id),
        date: formData.date,
        type: formData.type,
        context: formData.context
      }

      if (actionType === 'recurring') {
        transactionData.is_recurring = true
        transactionData.recurring_frequency = formData.recurring_frequency
        transactionData.recurring_day = parseInt(formData.recurring_day)
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
        const result = await response.json()
        setSuccess(getSuccessMessage())
        
        if (onTransactionAdded) {
          onTransactionAdded()
        }
        
        setTimeout(() => {
          setIsDialogOpen(false)
          setSuccess('')
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

  const getSuccessMessage = () => {
    switch (actionType) {
      case 'income':
        return 'Receita registrada com sucesso!'
      case 'expense':
        return 'Despesa registrada com sucesso!'
      case 'recurring':
        return 'Transação recorrente configurada com sucesso!'
      default:
        return 'Transação criada com sucesso!'
    }
  }

  const getDialogTitle = () => {
    switch (actionType) {
      case 'income':
        return 'Nova Receita'
      case 'expense':
        return 'Nova Despesa'
      case 'recurring':
        return 'Agendar Recorrente'
      default:
        return 'Nova Transação'
    }
  }

  const getDialogDescription = () => {
    switch (actionType) {
      case 'income':
        return 'Registre uma nova entrada de dinheiro'
      case 'expense':
        return 'Registre uma nova saída de dinheiro'
      case 'recurring':
        return 'Configure uma transação que se repete automaticamente'
      default:
        return 'Registre uma nova transação'
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Dialog open={isDialogOpen && actionType === 'income'} onOpenChange={(open) => {
          if (!open) {
            setIsDialogOpen(false)
            resetForm()
          }
        }}>
          <DialogTrigger asChild>
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
          </DialogTrigger>
        </Dialog>

        <Dialog open={isDialogOpen && actionType === 'expense'} onOpenChange={(open) => {
          if (!open) {
            setIsDialogOpen(false)
            resetForm()
          }
        }}>
          <DialogTrigger asChild>
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
          </DialogTrigger>
        </Dialog>

        <Dialog open={isDialogOpen && actionType === 'recurring'} onOpenChange={(open) => {
          if (!open) {
            setIsDialogOpen(false)
            resetForm()
          }
        }}>
          <DialogTrigger asChild>
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
          </DialogTrigger>
        </Dialog>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsDialogOpen(false)
          resetForm()
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
            <DialogDescription>{getDialogDescription()}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, category_id: value }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id || category.id} value={String(category._id || category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                required
              />
            </div>

            {actionType === 'recurring' && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900">Configurações de Recorrência</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recurring_frequency">Frequência</Label>
                    <Select
                      value={formData.recurring_frequency}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, recurring_frequency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="yearly">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recurring_day">
                      {formData.recurring_frequency === 'monthly' ? 'Dia do Mês' : 'Dia'}
                    </Label>
                    <Input
                      id="recurring_day"
                      name="recurring_day"
                      type="number"
                      min="1"
                      max={formData.recurring_frequency === 'monthly' ? '31' : '365'}
                      value={formData.recurring_day}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            )}

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
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default QuickActions
