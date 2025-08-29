import { useState, useEffect } from 'react'
import { Calendar, Clock, Edit, Trash2, Play, Pause, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'

const RecurringManager = ({ context }) => {
  const [recurringTransactions, setRecurringTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [previewSchedule, setPreviewSchedule] = useState([])
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    loadRecurringTransactions()
  }, [context])

  const loadRecurringTransactions = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('authToken')
      const response = await fetch(`/api/recurring/transactions?context=${context}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setRecurringTransactions(data)
      } else {
        setError('Erro ao carregar transações recorrentes')
      }
    } catch (error) {
      console.error('Erro ao carregar transações recorrentes:', error)
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const toggleTransaction = async (transactionId) => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`/api/recurring/transactions/${transactionId}/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await loadRecurringTransactions()
      } else {
        setError('Erro ao alterar status da transação')
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      setError('Erro de conexão')
    }
  }

  const deleteTransaction = async (transactionId) => {
    if (!confirm('Tem certeza que deseja excluir esta transação recorrente?')) {
      return
    }

    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`/api/recurring/transactions/${transactionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await loadRecurringTransactions()
      } else {
        setError('Erro ao excluir transação')
      }
    } catch (error) {
      console.error('Erro ao excluir:', error)
      setError('Erro de conexão')
    }
  }

  const previewScheduleForTransaction = async (transaction) => {
    try {
      const response = await fetch('/api/recurring/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recurring_frequency: transaction.recurring_frequency,
          recurring_day: transaction.recurring_day,
          months_ahead: 6
        })
      })

      if (response.ok) {
        const data = await response.json()
        setPreviewSchedule(data.schedule)
        setSelectedTransaction(transaction)
        setShowPreview(true)
      }
    } catch (error) {
      console.error('Erro ao gerar preview:', error)
    }
  }

  const processRecurringTransactions = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/recurring/process', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        alert(`${data.processed_count} transação(ões) processada(s) com sucesso!`)
        await loadRecurringTransactions()
      }
    } catch (error) {
      console.error('Erro ao processar transações:', error)
      setError('Erro ao processar transações')
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatFrequency = (frequency) => {
    const frequencies = {
      weekly: 'Semanal',
      monthly: 'Mensal',
      yearly: 'Anual'
    }
    return frequencies[frequency] || frequency
  }

  const formatNextOccurrence = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

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
    )
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
            <Card key={transaction.id} className="hover:shadow-md transition-shadow">
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
                      onClick={() => toggleTransaction(transaction.id)}
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
                      onClick={() => deleteTransaction(transaction.id)}
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
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Cronograma de Recorrência</DialogTitle>
            <DialogDescription>
              {selectedTransaction && (
                <>
                  {selectedTransaction.description} - {formatFrequency(selectedTransaction.recurring_frequency)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

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
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default RecurringManager

