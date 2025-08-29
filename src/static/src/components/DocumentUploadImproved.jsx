import { useState, useRef } from 'react'
import { Upload, FileText, Image, Table, Check, X, Eye, Download, AlertCircle, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

const DocumentUploadImproved = ({ context, onTransactionsExtracted }) => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractedTransactions, setExtractedTransactions] = useState([])
  const [processingResult, setProcessingResult] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [categories, setCategories] = useState([])
  const fileInputRef = useRef(null)

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

  const processDocument = async () => {
    if (!selectedFile) {
      setError('Selecione um arquivo primeiro')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('context', context)
      formData.append('auto_save', 'false')

      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/documents/process', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        setExtractedTransactions(result.transactions)
        setProcessingResult(result.summary)
        setSuccess(`${result.transactions.length} transação(ões) encontrada(s)`)
        
        if (result.transactions.length > 0) {
          setShowPreview(true)
        }
      } else {
        setError(result.error || 'Erro ao processar documento')
      }
    } catch (error) {
      console.error('Erro ao processar documento:', error)
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setIsProcessing(false)
    }
  }

  const saveTransactions = async () => {
    try {
      setIsProcessing(true)
      const token = localStorage.getItem('authToken')
      
      const response = await fetch('/api/documents/save-transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          transactions: extractedTransactions
        })
      })

      const result = await response.json()

      if (result.success) {
        setSuccess(`${result.saved_count} transação(ões) salva(s) com sucesso!`)
        setShowPreview(false)
        setExtractedTransactions([])
        setSelectedFile(null)
        
        if (onTransactionsExtracted) {
          onTransactionsExtracted()
        }
      } else {
        setError('Erro ao salvar transações')
      }
    } catch (error) {
      setError('Erro de conexão')
    } finally {
      setIsProcessing(false)
    }
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
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
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
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
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

                    <div className="flex items-end space-x-2">
                      <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'}>
                        {transaction.category || 'Auto'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeTransaction(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
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
  )
}

export default DocumentUploadImproved

