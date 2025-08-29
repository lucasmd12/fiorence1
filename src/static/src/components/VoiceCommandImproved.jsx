import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Volume2, Check, X, AlertCircle, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const VoiceCommandImproved = ({ context }) => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [conversation, setConversation] = useState([])
  const [currentTransaction, setCurrentTransaction] = useState({})
  const [missingFields, setMissingFields] = useState([])
  const [categories, setCategories] = useState([])
  const [error, setError] = useState('')
  const [isInConversation, setIsInConversation] = useState(false)
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
        processVoiceInput(speechResult)
      }
      
      recognitionRef.current.onerror = (event) => {
        setError('Erro no reconhecimento de voz. Tente novamente.')
        setIsListening(false)
      }
      
      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    loadCategories()
  }, [context])

  const loadCategories = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`/api/categories?context=${context}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    }
  }

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript('')
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

  const processVoiceInput = async (input) => {
    setIsProcessing(true)
    
    try {
      if (isInConversation) {
        // Processar resposta para campo faltante
        await handleMissingFieldResponse(input)
      } else {
        // Processar comando inicial
        await processInitialCommand(input)
      }
    } catch (error) {
      setError('Erro ao processar comando. Tente novamente.')
    } finally {
      setIsProcessing(false)
    }
  }

  const processInitialCommand = async (command) => {
    const extracted = await extractTransactionData(command)
    
    addToConversation('user', command)
    
    // Verificar campos obrigatórios
    const required = ['type', 'amount', 'description', 'date']
    const missing = required.filter(field => !extracted[field])
    
    if (missing.length > 0) {
      setCurrentTransaction(extracted)
      setMissingFields(missing)
      setIsInConversation(true)
      
      const nextField = missing[0]
      const question = generateQuestion(nextField)
      addToConversation('assistant', question)
      speakText(question)
    } else {
      // Todos os campos estão presentes, confirmar transação
      setCurrentTransaction(extracted)
      const confirmationMessage = generateConfirmationMessage(extracted)
      addToConversation('assistant', confirmationMessage)
      speakText(confirmationMessage)
    }
  }

  const handleMissingFieldResponse = async (response) => {
    const currentField = missingFields[0]
    const updatedTransaction = { ...currentTransaction }
    
    // Processar resposta baseada no campo atual
    switch (currentField) {
      case 'type':
        const type = extractTransactionType(response)
        if (type) {
          updatedTransaction.type = type
          addToConversation('user', response)
          addToConversation('assistant', `Entendi, é uma ${type === 'income' ? 'receita' : 'despesa'}.`)
        } else {
          addToConversation('user', response)
          const clarification = 'Não entendi. É uma entrada (receita) ou saída (despesa)?'
          addToConversation('assistant', clarification)
          speakText(clarification)
          return
        }
        break
        
      case 'amount':
        const amount = extractAmount(response)
        if (amount) {
          updatedTransaction.amount = amount
          addToConversation('user', response)
          addToConversation('assistant', `Valor registrado: R$ ${amount.toFixed(2)}`)
        } else {
          addToConversation('user', response)
          const clarification = 'Não consegui identificar o valor. Pode repetir o valor em reais?'
          addToConversation('assistant', clarification)
          speakText(clarification)
          return
        }
        break
        
      case 'description':
        if (response.trim().length > 2) {
          updatedTransaction.description = response.trim()
          addToConversation('user', response)
          addToConversation('assistant', `Descrição: ${response.trim()}`)
        } else {
          addToConversation('user', response)
          const clarification = 'Preciso de uma descrição mais detalhada. Para que foi essa transação?'
          addToConversation('assistant', clarification)
          speakText(clarification)
          return
        }
        break
        
      case 'date':
        const date = extractDate(response)
        if (date) {
          updatedTransaction.date = date
          addToConversation('user', response)
          addToConversation('assistant', `Data: ${new Date(date).toLocaleDateString('pt-BR')}`)
        } else {
          addToConversation('user', response)
          const clarification = 'Não entendi a data. É para hoje, ontem, ou uma data específica?'
          addToConversation('assistant', clarification)
          speakText(clarification)
          return
        }
        break
        
      case 'category_id':
        const category = findCategoryByName(response)
        if (category) {
          updatedTransaction.category_id = category.id
          addToConversation('user', response)
          addToConversation('assistant', `Categoria: ${category.name}`)
        } else {
          addToConversation('user', response)
          const availableCategories = categories
            .filter(cat => cat.type === updatedTransaction.type)
            .map(cat => cat.name)
            .slice(0, 5)
            .join(', ')
          const clarification = `Categoria não encontrada. Categorias disponíveis: ${availableCategories}`
          addToConversation('assistant', clarification)
          speakText(clarification)
          return
        }
        break
    }
    
    setCurrentTransaction(updatedTransaction)
    
    // Remover campo processado da lista de faltantes
    const remainingMissing = missingFields.slice(1)
    setMissingFields(remainingMissing)
    
    if (remainingMissing.length > 0) {
      // Ainda há campos faltantes
      const nextField = remainingMissing[0]
      const question = generateQuestion(nextField, updatedTransaction)
      addToConversation('assistant', question)
      speakText(question)
    } else {
      // Todos os campos coletados, confirmar transação
      setIsInConversation(false)
      const confirmationMessage = generateConfirmationMessage(updatedTransaction)
      addToConversation('assistant', confirmationMessage)
      speakText(confirmationMessage)
    }
  }

  const extractTransactionData = async (command) => {
    const lowerCommand = command.toLowerCase()
    const extracted = {
      context: context
    }
    
    // Extrair tipo (receita/despesa)
    if (lowerCommand.includes('receita') || lowerCommand.includes('entrada') || lowerCommand.includes('receb')) {
      extracted.type = 'income'
    } else if (lowerCommand.includes('despesa') || lowerCommand.includes('saída') || lowerCommand.includes('gast') || lowerCommand.includes('pag')) {
      extracted.type = 'expense'
    }
    
    // Extrair valor
    const amount = extractAmount(command)
    if (amount) extracted.amount = amount
    
    // Extrair data
    const date = extractDate(command)
    if (date) extracted.date = date
    
    // Extrair descrição (remover palavras-chave)
    let description = command
      .replace(/receita|despesa|entrada|saída|gast|pag|receb/gi, '')
      .replace(/\d+(?:\.\d+)?\s*(?:reais?|r\$)/gi, '')
      .replace(/hoje|ontem|amanhã/gi, '')
      .trim()
    
    if (description.length > 3) {
      extracted.description = description
    }
    
    // Tentar encontrar categoria baseada na descrição
    if (extracted.description && extracted.type) {
      const category = findCategoryByDescription(extracted.description, extracted.type)
      if (category) {
        extracted.category_id = category.id
      }
    }
    
    return extracted
  }

  const extractTransactionType = (text) => {
    const lowerText = text.toLowerCase()
    if (lowerText.includes('receita') || lowerText.includes('entrada') || lowerText.includes('receb')) {
      return 'income'
    } else if (lowerText.includes('despesa') || lowerText.includes('saída') || lowerText.includes('gast') || lowerText.includes('pag')) {
      return 'expense'
    }
    return null
  }

  const extractAmount = (text) => {
    const amountMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(?:reais?|r\$)?/i)
    if (amountMatch) {
      return parseFloat(amountMatch[1].replace(',', '.'))
    }
    return null
  }

  const extractDate = (text) => {
    const lowerText = text.toLowerCase()
    const today = new Date()
    
    if (lowerText.includes('hoje')) {
      return today.toISOString().split('T')[0]
    } else if (lowerText.includes('ontem')) {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      return yesterday.toISOString().split('T')[0]
    } else if (lowerText.includes('amanhã')) {
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      return tomorrow.toISOString().split('T')[0]
    }
    
    // Tentar extrair data específica (dd/mm ou dd/mm/yyyy)
    const dateMatch = text.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{4}))?/)
    if (dateMatch) {
      const day = parseInt(dateMatch[1])
      const month = parseInt(dateMatch[2]) - 1 // JavaScript months are 0-based
      const year = dateMatch[3] ? parseInt(dateMatch[3]) : today.getFullYear()
      
      const date = new Date(year, month, day)
      return date.toISOString().split('T')[0]
    }
    
    return null
  }

  const findCategoryByName = (name) => {
    const lowerName = name.toLowerCase()
    return categories.find(cat => 
      cat.name.toLowerCase().includes(lowerName) || 
      lowerName.includes(cat.name.toLowerCase())
    )
  }

  const findCategoryByDescription = (description, type) => {
    const lowerDesc = description.toLowerCase()
    const typeCategories = categories.filter(cat => cat.type === type)
    
    // Palavras-chave para categorias comuns
    const categoryKeywords = {
      'alimentação': ['comida', 'almoço', 'jantar', 'lanche', 'restaurante', 'padaria', 'mercado', 'supermercado'],
      'transporte': ['uber', 'taxi', 'ônibus', 'combustível', 'gasolina', 'posto'],
      'saúde': ['médico', 'farmácia', 'remédio', 'hospital', 'consulta'],
      'educação': ['escola', 'curso', 'livro', 'material'],
      'lazer': ['cinema', 'show', 'festa', 'viagem'],
      'casa': ['aluguel', 'luz', 'água', 'internet', 'telefone'],
      'trabalho': ['salário', 'freelance', 'projeto', 'serviço']
    }
    
    for (const [categoryType, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerDesc.includes(keyword))) {
        const category = typeCategories.find(cat => 
          cat.name.toLowerCase().includes(categoryType)
        )
        if (category) return category
      }
    }
    
    return null
  }

  const generateQuestion = (field, transaction = {}) => {
    switch (field) {
      case 'type':
        return 'É uma entrada (receita) ou saída (despesa)?'
      case 'amount':
        return 'Qual o valor da transação?'
      case 'description':
        return 'Pode me dar mais detalhes sobre essa transação?'
      case 'date':
        return 'Para que data é essa transação? É para hoje?'
      case 'category_id':
        const typeCategories = categories.filter(cat => cat.type === transaction.type)
        const categoryNames = typeCategories.slice(0, 5).map(cat => cat.name).join(', ')
        return `Em qual categoria? Algumas opções: ${categoryNames}`
      default:
        return 'Preciso de mais informações.'
    }
  }

  const generateConfirmationMessage = (transaction) => {
    const typeText = transaction.type === 'income' ? 'receita' : 'despesa'
    const category = categories.find(cat => cat.id === transaction.category_id)
    const categoryName = category ? category.name : 'Sem categoria'
    
    return `Confirmar ${typeText} de R$ ${transaction.amount?.toFixed(2)} para ${categoryName} em ${new Date(transaction.date).toLocaleDateString('pt-BR')}. Descrição: ${transaction.description}`
  }

  const addToConversation = (sender, message) => {
    setConversation(prev => [...prev, { sender, message, timestamp: new Date() }])
  }

  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'pt-BR'
      utterance.rate = 0.9
      speechSynthesis.speak(utterance)
    }
  }

  const confirmTransaction = async () => {
    try {
      setIsProcessing(true)
      const token = localStorage.getItem('authToken')
      
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(currentTransaction)
      })

      if (response.ok) {
        addToConversation('assistant', 'Transação criada com sucesso!')
        speakText('Transação criada com sucesso!')
        resetConversation()
      } else {
        const error = await response.json()
        addToConversation('assistant', `Erro ao criar transação: ${error.error}`)
        speakText('Erro ao criar transação')
      }
    } catch (error) {
      addToConversation('assistant', 'Erro de conexão. Tente novamente.')
      speakText('Erro de conexão')
    } finally {
      setIsProcessing(false)
    }
  }

  const cancelTransaction = () => {
    resetConversation()
    addToConversation('assistant', 'Transação cancelada.')
    speakText('Transação cancelada')
  }

  const resetConversation = () => {
    setConversation([])
    setCurrentTransaction({})
    setMissingFields([])
    setIsInConversation(false)
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

      {/* Conversation Display */}
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

          {/* Action Buttons */}
          {!isInConversation && Object.keys(currentTransaction).length > 0 && (
            <div className="flex space-x-2 mt-4 pt-3 border-t">
              <Button
                onClick={confirmTransaction}
                disabled={isProcessing}
                className="flex-1 bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <Check className="w-4 h-4 mr-2" />
                {isProcessing ? 'Salvando...' : 'Confirmar'}
              </Button>
              <Button
                onClick={cancelTransaction}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Current Transcript */}
      {transcript && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-blue-50 border border-blue-200 rounded-lg p-3 z-40">
          <div className="flex items-start space-x-2">
            <Volume2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Você disse:</p>
              <p className="text-sm text-blue-700 italic">"{transcript}"</p>
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

export default VoiceCommandImproved

