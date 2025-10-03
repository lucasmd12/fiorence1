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
