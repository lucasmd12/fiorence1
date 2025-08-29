import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Volume2, Check, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

const VoiceCommand = ({ context }) => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [confirmation, setConfirmation] = useState(null)
  const [error, setError] = useState('')
  const recognitionRef = useRef(null)

  useEffect(() => {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'pt-BR'
      
      recognitionRef.current.onstart = () => {
        setIsListening(true)
        setError('')
      }
      
      recognitionRef.current.onresult = (event) => {
        const speechResult = event.results[0][0].transcript
        setTranscript(speechResult)
        processVoiceCommand(speechResult)
      }
      
      recognitionRef.current.onerror = (event) => {
        setError('Erro no reconhecimento de voz. Tente novamente.')
        setIsListening(false)
      }
      
      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript('')
      setConfirmation(null)
      setError('')
      recognitionRef.current.start()
    } else {
      setError('Reconhecimento de voz não suportado neste navegador')
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  const processVoiceCommand = async (command) => {
    setIsProcessing(true)
    
    try {
      // Simulate intelligent processing
      const processed = await intelligentCommandProcessor(command, context)
      setConfirmation(processed)
    } catch (error) {
      setError('Erro ao processar comando. Tente novamente.')
    } finally {
      setIsProcessing(false)
    }
  }

  const intelligentCommandProcessor = async (command, context) => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const lowerCommand = command.toLowerCase()
    
    // Intent detection
    let intent = 'unknown'
    let entities = {}
    
    // Detect create category + transaction
    if (lowerCommand.includes('criar categoria') && (lowerCommand.includes('saída') || lowerCommand.includes('entrada'))) {
      intent = 'create_category_and_transaction'
      
      // Extract category name (between "criar categoria" and transaction type)
      const categoryMatch = lowerCommand.match(/criar categoria\s+([^,]+?)(?:\s*,|\s+(?:saída|entrada))/i)
      if (categoryMatch) {
        entities.categoryName = categoryMatch[1].trim()
      }
      
      // Extract amount
      const amountMatch = lowerCommand.match(/(\d+(?:\.\d+)?)\s*(?:reais?|r\$)/i)
      if (amountMatch) {
        entities.amount = parseFloat(amountMatch[1])
      }
      
      // Extract type
      entities.type = lowerCommand.includes('saída') ? 'expense' : 'income'
      
      // Extract date
      if (lowerCommand.includes('hoje')) {
        entities.date = new Date().toISOString().split('T')[0]
      }
      
      // Detect context from keywords
      const businessKeywords = ['frota', 'empresa', 'operacional', 'funcionário', 'salário']
      const personalKeywords = ['pessoal', 'meu', 'minha', 'lianderson']
      
      let detectedContext = context // default to current context
      
      for (const keyword of businessKeywords) {
        if (lowerCommand.includes(keyword)) {
          detectedContext = 'business'
          break
        }
      }
      
      for (const keyword of personalKeywords) {
        if (lowerCommand.includes(keyword)) {
          detectedContext = 'personal'
          break
        }
      }
      
      entities.context = detectedContext
    }
    
    // Detect simple transaction
    else if (lowerCommand.includes('saída') || lowerCommand.includes('entrada')) {
      intent = 'create_transaction'
      
      // Extract amount
      const amountMatch = lowerCommand.match(/(\d+(?:\.\d+)?)\s*(?:reais?|r\$)/i)
      if (amountMatch) {
        entities.amount = parseFloat(amountMatch[1])
      }
      
      // Extract type
      entities.type = lowerCommand.includes('saída') ? 'expense' : 'income'
      
      // Extract description (everything before amount or after type)
      let description = lowerCommand
        .replace(/(?:saída|entrada)\s*/i, '')
        .replace(/\d+(?:\.\d+)?\s*(?:reais?|r\$)/i, '')
        .replace(/hoje|ontem|amanhã/i, '')
        .trim()
      
      entities.description = description || 'Lançamento via comando de voz'
      
      // Extract date
      if (lowerCommand.includes('hoje')) {
        entities.date = new Date().toISOString().split('T')[0]
      }
      
      // Detect context
      const businessKeywords = ['frota', 'empresa', 'operacional']
      const personalKeywords = ['pessoal', 'meu', 'minha', 'lianderson']
      
      let detectedContext = context
      
      for (const keyword of businessKeywords) {
        if (lowerCommand.includes(keyword)) {
          detectedContext = 'business'
          break
        }
      }
      
      for (const keyword of personalKeywords) {
        if (lowerCommand.includes(keyword)) {
          detectedContext = 'personal'
          break
        }
      }
      
      entities.context = detectedContext
    }
    
    // Detect recurring transaction
    else if (lowerCommand.includes('dia') && lowerCommand.includes('paguei')) {
      intent = 'create_recurring_with_payment'
      
      // Extract recurring day
      const dayMatch = lowerCommand.match(/dia\s+(\d+)/i)
      if (dayMatch) {
        entities.recurringDay = parseInt(dayMatch[1])
      }
      
      // Extract amount
      const amountMatch = lowerCommand.match(/(\d+(?:\.\d+)?)\s*(?:reais?|r\$)?/i)
      if (amountMatch) {
        entities.amount = parseFloat(amountMatch[1])
      }
      
      // Extract description
      let description = lowerCommand
        .replace(/dia\s+\d+/i, '')
        .replace(/paguei/i, '')
        .replace(/\d+(?:\.\d+)?\s*(?:reais?|r\$)?/i, '')
        .replace(/hj|hoje/i, '')
        .trim()
      
      entities.description = description || 'Pagamento recorrente'
      entities.type = 'expense'
      entities.context = lowerCommand.includes('casa') ? 'personal' : context
      entities.paymentDate = new Date().toISOString().split('T')[0]
    }
    
    return {
      intent,
      entities,
      originalCommand: command,
      confidence: 0.85
    }
  }

  const confirmAction = async () => {
    try {
      setIsProcessing(true)
      
      if (confirmation.intent === 'create_category_and_transaction') {
        // First create category
        const categoryResponse = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: confirmation.entities.categoryName,
            type: confirmation.entities.type,
            context: confirmation.entities.context
          })
        })
        
        let categoryId
        if (categoryResponse.ok) {
          const newCategory = await categoryResponse.json()
          categoryId = newCategory.id
        } else {
          // Category might already exist, try to find it
          const categoriesResponse = await fetch(`/api/categories?context=${confirmation.entities.context}&type=${confirmation.entities.type}`)
          const categories = await categoriesResponse.json()
          const existingCategory = categories.find(cat => 
            cat.name.toLowerCase().includes(confirmation.entities.categoryName.toLowerCase())
          )
          categoryId = existingCategory?.id
        }
        
        if (categoryId) {
          // Create transaction
          await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              description: `${confirmation.entities.categoryName} - Comando de voz`,
              amount: confirmation.entities.amount,
              type: confirmation.entities.type,
              context: confirmation.entities.context,
              category_id: categoryId,
              date: confirmation.entities.date
            })
          })
        }
      }
      
      // Reset state
      setConfirmation(null)
      setTranscript('')
      
      // Show success message
      setError('')
      setTimeout(() => {
        // Could trigger a refresh of the current page data here
      }, 500)
      
    } catch (error) {
      setError('Erro ao executar comando. Tente novamente.')
    } finally {
      setIsProcessing(false)
    }
  }

  const cancelAction = () => {
    setConfirmation(null)
    setTranscript('')
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <div className="relative">
      {/* Voice Button */}
      <Button
        onClick={isListening ? stopListening : startListening}
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

      {/* Transcript Display */}
      {transcript && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-start space-x-2">
            <Volume2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Comando detectado:</p>
              <p className="text-sm text-gray-600 italic">"{transcript}"</p>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Confirmar Ação
                </h3>
              </div>
              
              <div className="space-y-3 mb-6">
                <p className="text-sm text-gray-600">
                  <strong>Comando:</strong> "{confirmation.originalCommand}"
                </p>
                
                {confirmation.intent === 'create_category_and_transaction' && (
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <p className="text-sm font-medium text-gray-900">
                      Criar categoria e lançamento:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li><strong>Nova Categoria:</strong> {confirmation.entities.categoryName}</li>
                      <li><strong>Tipo:</strong> {confirmation.entities.type === 'expense' ? 'Despesa' : 'Receita'}</li>
                      <li><strong>Valor:</strong> {formatCurrency(confirmation.entities.amount)}</li>
                      <li><strong>Data:</strong> {new Date(confirmation.entities.date).toLocaleDateString('pt-BR')}</li>
                      <li><strong>Contexto:</strong> {confirmation.entities.context === 'business' ? 'Empresarial' : 'Pessoal'}</li>
                    </ul>
                  </div>
                )}
                
                {confirmation.intent === 'create_transaction' && (
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <p className="text-sm font-medium text-gray-900">
                      Criar lançamento:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li><strong>Descrição:</strong> {confirmation.entities.description}</li>
                      <li><strong>Tipo:</strong> {confirmation.entities.type === 'expense' ? 'Despesa' : 'Receita'}</li>
                      <li><strong>Valor:</strong> {formatCurrency(confirmation.entities.amount)}</li>
                      <li><strong>Contexto:</strong> {confirmation.entities.context === 'business' ? 'Empresarial' : 'Pessoal'}</li>
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={confirmAction}
                  disabled={isProcessing}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Processando...' : 'Confirmar'}
                </Button>
                <Button
                  onClick={cancelAction}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-red-50 border border-red-200 rounded-lg p-3 z-50">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default VoiceCommand

