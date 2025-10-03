// ARQUIVO COMPLETO: VoiceCommand.jsx - TODAS FUNCIONALIDADES
import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Check, X, AlertCircle, Loader, List, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import VoiceNLPProcessor from './voice-command/core/NLPProcessor';
import { useSpeechRecognition } from './voice-command/hooks/useSpeechRecognition';
import { speakText } from './voice-command/services/SpeechSynthesisService';
import { formatCurrency } from './voice-command/formatters/CurrencyFormatter';
import { formatBR } from './voice-command/formatters/DateFormatter';
import { generateQuestion } from './voice-command/core/CommandMapper';
import { addToConversation, resetConversationState } from './voice-command/utils/ConversationManager';

// IMPORTAÇÕES CRUCIAIS - REUTILIZAÇÃO
import { useTransactions, useCategories } from '../hooks/useFinanceData';
import { get, post, put } from '../lib/apiClient';

const VoiceCommand = ({ context, onTransactionAdded }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [currentTransaction, setCurrentTransaction] = useState({});
  const [missingFields, setMissingFields] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isInConversation, setIsInConversation] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [showListModal, setShowListModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  
  const nlpProcessorRef = useRef(null);
  const stateRef = useRef();

  // HOOKS DE DADOS
  const { categories, isLoading: loadingCategories } = useCategories(context);
  const { 
    transactions,
    createTransaction: createTransactionMutation,
    updateTransaction: updateTransactionMutation
  } = useTransactions(context);

  const { isListening, transcript, startListening, stopListening, setError: setSpeechError, setTranscript } = useSpeechRecognition();

  stateRef.current = { context, categories, isInConversation, currentTransaction, missingFields };

  useEffect(() => {
    if (categories.length > 0) {
      nlpProcessorRef.current = new VoiceNLPProcessor(categories);
    }
  }, [categories]);

  // ==========================================
  // PROCESSAMENTO PRINCIPAL
  // ==========================================
  const processVoiceInput = async (input) => {
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
      console.error("Erro no processamento:", error);
      setError('Erro ao processar comando.');
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
    if (!nlpProcessorRef.current) {
      nlpProcessorRef.current = new VoiceNLPProcessor(currentState.categories);
    }

    const processed = nlpProcessorRef.current.processCommand(command, currentState.context);
    addToConversation(setConversation, 'user', command);

    // ROTEAMENTO POR INTENT
    switch (processed.intent) {
      case 'create_category':
        await handleCreateCategory(processed);
        break;
      
      case 'mark_as_paid':
      case 'mark_as_pending':
      case 'update_transaction':
        await handleUpdateStatus(processed);
        break;
      
      case 'search_transaction':
      case 'list_transactions':
        await handleSearchTransactions(processed);
        break;
      
      case 'create_transaction':
      case 'schedule_transaction':
      default:
        handleCreateTransaction(processed);
        break;
    }
  };

  const handleCreateTransaction = (processed) => {
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
    
    if (!nlpProcessorRef.current) {
      nlpProcessorRef.current = new VoiceNLPProcessor(currentState.categories);
    }
      
    const processed = nlpProcessorRef.current.processCommand(response, currentState.context);
    
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
          const clarification = 'Não consegui identificar o valor. Pode repetir?';
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
          const clarification = 'Preciso de uma descrição. Para que foi essa transação?';
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

  // ==========================================
  // CRIAR CATEGORIA
  // ==========================================
  const handleCreateCategory = async (processed) => {
    const categoryName = processed.entities.description || processed.metadata?.categoryName;
    const categoryType = processed.entities.type || 'expense';

    if (!categoryName) {
      const question = "Qual o nome da nova categoria?";
      addToConversation(setConversation, 'assistant', question);
      speakText(question);
      setIsInConversation(true);
      setCurrentTransaction({ intent: 'create_category', type: categoryType });
      setMissingFields(['description']);
      return;
    }

    try {
      setIsProcessing(true);
      const newCategory = await post('/categories', {
        name: categoryName,
        type: categoryType,
        context: context,
        color: '#3B82F6',
        icon: 'folder',
        emoji: '📁'
      });

      setSuccess(`Categoria "${categoryName}" criada com sucesso!`);
      speakText(`Categoria ${categoryName} criada!`);
      resetConversation();
    } catch (err) {
      setError(`Erro ao criar categoria: ${err.message}`);
      speakText('Erro ao criar categoria');
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // ATUALIZAR STATUS
  // ==========================================
  const handleUpdateStatus = async (processed) => {
    const searchTerm = processed.metadata?.transactionReference || processed.entities.description;
    const targetStatus = processed.intent === 'mark_as_paid' ? 'paid' : 'pending';

    if (!searchTerm) {
      const question = "Qual transação você quer atualizar?";
      addToConversation(setConversation, 'assistant', question);
      speakText(question);
      return;
    }

    try {
      setIsProcessing(true);
      
      // Busca transação
      const allTransactions = await get(`/transactions?context=${context}`);
      const found = allTransactions.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (found.length === 0) {
        const msg = `Não encontrei nenhuma transação com "${searchTerm}"`;
        addToConversation(setConversation, 'assistant', msg);
        speakText(msg);
        setIsProcessing(false);
        return;
      }

      if (found.length === 1) {
        // Atualiza direto
        const transaction = found[0];
        await put(`/transactions/${transaction.id || transaction._id}`, {
          ...transaction,
          status: targetStatus
        });

        const statusText = targetStatus === 'paid' ? 'paga' : 'pendente';
        const msg = `Transação "${transaction.description}" marcada como ${statusText}!`;
        setSuccess(msg);
        speakText(msg);
        
        if (onTransactionAdded) onTransactionAdded();
        resetConversation();
      } else {
        // Múltiplos resultados - mostra modal
        setSearchResults(found.map(t => ({ ...t, targetStatus })));
        setShowListModal(true);
        const msg = `Encontrei ${found.length} transações. Selecione uma:`;
        addToConversation(setConversation, 'assistant', msg);
        speakText(msg);
      }
    } catch (err) {
      setError(`Erro: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // BUSCAR TRANSAÇÕES
  // ==========================================
  const handleSearchTransactions = async (processed) => {
    try {
      setIsProcessing(true);
      
      const filters = {
        context: context
      };

      // Detecta tipo de busca
      const cmd = processed.originalCommand.toLowerCase();
      if (cmd.includes('pendente') || cmd.includes('dívida') || cmd.includes('divida')) {
        filters.status = 'pending';
        filters.type = 'expense';
      } else if (cmd.includes('receita') || cmd.includes('receber')) {
        filters.type = 'income';
      }

      const results = await get(`/transactions?${new URLSearchParams(filters)}`);
      
      if (results.length === 0) {
        const msg = "Não encontrei transações com esses critérios.";
        addToConversation(setConversation, 'assistant', msg);
        speakText(msg);
        setIsProcessing(false);
        return;
      }

      // Ordena por data
      const sorted = results.sort((a, b) => new Date(a.date) - new Date(b.date));
      
      setSearchResults(sorted);
      setShowListModal(true);

      // Responde em voz
      const count = sorted.length;
      const typeText = filters.status === 'pending' ? 'pendentes' : 'encontradas';
      const msg = `${count} transação${count > 1 ? 'ões' : ''} ${typeText}. Vou mostrar a lista.`;
      addToConversation(setConversation, 'assistant', msg);
      speakText(msg);

    } catch (err) {
      setError(`Erro: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // CONFIRMAR TRANSAÇÃO
  // ==========================================
  const confirmAction = async () => {
    if (!confirmation.entities.category_id) {
      setError('Por favor, selecione uma categoria.');
      speakText('Selecione uma categoria.');
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

      await post('/transactions', transactionData);

      setSuccess('Transação criada com sucesso!');
      speakText('Transação criada!');
      resetConversation();
      
      if (onTransactionAdded) onTransactionAdded();
    } catch (err) {
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
    setShowListModal(false);
    setSearchResults([]);
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

  const handleStatusUpdate = async (transaction, newStatus) => {
    try {
      await put(`/transactions/${transaction.id || transaction._id}`, {
        ...transaction,
        status: newStatus
      });
      
      const statusText = newStatus === 'paid' ? 'paga' : 'pendente';
      setSuccess(`"${transaction.description}" marcada como ${statusText}!`);
      
      if (onTransactionAdded) onTransactionAdded();
      setShowListModal(false);
      resetConversation();
    } catch (err) {
      setError(`Erro: ${err.message}`);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={isListening ? stopListening : handleStartListening}
        disabled={isProcessing || loadingCategories}
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

      {/* CONVERSAÇÃO */}
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

      {/* MODAL DE CONFIRMAÇÃO */}
      {confirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Confirmar Transação</h3>
              </div>
              
              <div className="space-y-3 mb-6">
                <p className="text-sm text-gray-600">
                  <strong>Comando:</strong> "{confirmation.originalCommand}"
                </p>
                
                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li><strong>Descrição:</strong> {confirmation.entities.description}</li>
                    <li><strong>Tipo:</strong> {confirmation.entities.type === 'expense' ? 'Despesa' : 'Receita'}</li>
                    <li><strong>Valor:</strong> {formatCurrency(confirmation.entities.amount)}</li>
                    <li><strong>Data:</strong> {formatBR(new Date(confirmation.entities.date))}</li>
                    <li><strong>Status:</strong> {confirmation.entities.status === 'paid' ? 'Pago' : 'Pendente'}</li>
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
                      {categories
                        .filter(cat => cat.type === confirmation.entities.type)
                        .map(cat => (
                          <option key={cat._id || cat.id} value={cat._id || cat.id}>
                            {cat.emoji} {cat.name}
                          </option>
                        ))
                      }
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
                  {isProcessing ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                  Confirmar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE LISTAGEM */}
      {showListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <List className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Transações Encontradas ({searchResults.length})
                  </h3>
                </div>
                <button onClick={() => setShowListModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {searchResults.map((transaction, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center">
                            <DollarSign className="w-3 h-3 mr-1" />
                            {formatCurrency(transaction.amount)}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatBR(new Date(transaction.date))}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            transaction.status === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {transaction.status === 'paid' ? 'Pago' : 'Pendente'}
                          </span>
                        </div>
                      </div>
                      
                      {transaction.targetStatus && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusUpdate(transaction, transaction.targetStatus)}
                          className="ml-4"
                        >
                          Marcar como {transaction.targetStatus === 'paid' ? 'Pago' : 'Pendente'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={() => setShowListModal(false)}>
                  Fechar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MENSAGENS */}
      {transcript && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-blue-50 border border-blue-200 rounded-lg p-3 z-40">
          <div className="flex items-start space-x-2">
            <Volume2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900">Comando:</p>
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

export default VoiceCommand;