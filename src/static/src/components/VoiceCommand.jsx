// ARQUIVO COMPLETO: VoiceCommand.jsx - VERSÃO DE INTEGRIDADE TOTAL
import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Check, X, AlertCircle, Loader, List, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import VoiceNLPProcessor from './voice-command/core/NLPProcessor';
import { useSpeechRecognition } from './voice-command/hooks/useSpeechRecognition';
import { speakText } from './voice-command/services/SpeechSynthesisService';
import { formatCurrency } from './voice-command/formatters/CurrencyFormatter';
import { formatBR } from './voice-command/formatters/DateFormatter';
// CIRURGIA 1: Importando o objeto completo do CommandMapper
import CommandMapper from './voice-command/core/CommandMapper';
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
  // CIRURGIA 2: Novo estado para rastrear o último campo preenchido (memória de curto prazo)
  const [lastFieldFilled, setLastFieldFilled] = useState(null);
  
  const nlpProcessorRef = useRef(null);
  const stateRef = useRef();

  // HOOKS DE DADOS
  const { categories, isLoading: loadingCategories, refetch: refetchCategories } = useCategories(context);
  const { 
    createTransaction: createTransactionMutation,
    updateTransaction: updateTransactionMutation
  } = useTransactions(context);

  const { isListening, transcript, startListening, stopListening, setError: setSpeechError, setTranscript } = useSpeechRecognition();

  stateRef.current = { context, categories, isInConversation, currentTransaction, missingFields, lastFieldFilled };

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
      speakText('Desculpe, ocorreu um erro.');
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
        // CIRURGIA 3: A função agora é assíncrona para aguardar a sugestão da API
        await handleCreateTransaction(processed);
        break;
    }
  };

  // CIRURGIA 4: Lógica de criação de transação agora chama a sugestão de categoria
  const handleCreateTransaction = async (processed) => {
    if (processed.missing_fields.length > 0) {
      setCurrentTransaction(processed.entities);
      setMissingFields(processed.missing_fields);
      setIsInConversation(true);
      
      const nextField = processed.missing_fields[0];
      // Usa o CommandMapper para gerar a primeira pergunta (sem contexto ainda)
      const question = CommandMapper.generateQuestion(nextField);
      addToConversation(setConversation, 'assistant', question);
      speakText(question);
    } else {
      // Se tudo foi preenchido de uma vez, vai direto para a sugestão
      await suggestCategoryAndConfirm(processed);
    }
  };

  // CIRURGIA 5: Lógica de diálogo completamente refeita para ser contextual
  const handleMissingFieldResponse = async (response) => {
    const currentState = stateRef.current;
    const currentField = currentState.missingFields[0];
    let updatedTransaction = { ...currentState.currentTransaction };
    
    if (!nlpProcessorRef.current) {
      nlpProcessorRef.current = new VoiceNLPProcessor(currentState.categories);
    }
      
    const processed = nlpProcessorRef.current.processCommand(response, currentState.context);
    addToConversation(setConversation, 'user', response);

    // Tenta preencher o campo atual com a nova informação
    let fieldWasFilled = false;
    if (processed.entities[currentField]) {
      updatedTransaction[currentField] = processed.entities[currentField];
      fieldWasFilled = true;
    }

    if (!fieldWasFilled) {
      // Se não conseguiu preencher, repete a pergunta de forma mais simples
      const clarification = `Desculpe, não entendi. ${CommandMapper.questionBank[currentField][0]}`;
      addToConversation(setConversation, 'assistant', clarification);
      speakText(clarification);
      return;
    }
    
    setCurrentTransaction(updatedTransaction);
    setLastFieldFilled(currentField); // Guarda qual campo foi preenchido
    const remainingMissing = currentState.missingFields.slice(1);
    setMissingFields(remainingMissing);
    
    if (remainingMissing.length > 0) {
      const nextField = remainingMissing[0];
      // Usa o CommandMapper para gerar a próxima pergunta contextual
      const question = CommandMapper.generateQuestion(nextField, updatedTransaction, { includeAcknowledgment: true });
      addToConversation(setConversation, 'assistant', question);
      speakText(question);
    } else {
      // Todos os campos foram preenchidos, hora de sugerir a categoria
      setIsInConversation(false);
      const finalProcessed = {
        intent: 'create_transaction',
        entities: updatedTransaction,
        originalCommand: "Conversa de múltiplos passos",
        confidence: 0.95
      };
      await suggestCategoryAndConfirm(finalProcessed);
    }
  };

  // CIRURGIA 6: Nova função para orquestrar a sugestão e confirmação
  const suggestCategoryAndConfirm = async (processedTransaction) => {
    setIsProcessing(true);
    try {
      const suggestionResponse = await post('/documents/suggest-category', {
        description: processedTransaction.entities.description,
        type: processedTransaction.entities.type,
        context: context,
      });

      let finalTransaction = { ...processedTransaction };

      if (suggestionResponse.success) {
        if (suggestionResponse.suggestion_type === 'existing') {
          finalTransaction.entities.category_id = suggestionResponse.category.id;
          finalTransaction.entities.category_name = suggestionResponse.category.name;
        } else { // 'new'
          finalTransaction.entities.category_id = 'create_new'; // Flag para criar
          finalTransaction.entities.new_category_details = suggestionResponse.category;
          finalTransaction.entities.category_name = suggestionResponse.category.name;
        }
      }
      
      setConfirmation(finalTransaction);
      const confirmationMessage = CommandMapper.generateConfirmationMessage(finalTransaction.entities);
      addToConversation(setConversation, 'assistant', confirmationMessage);
      speakText(confirmationMessage);

    } catch (error) {
      console.error("Erro ao sugerir categoria:", error);
      setError("Não consegui sugerir uma categoria, por favor escolha manualmente.");
      setConfirmation(processedTransaction); // Mostra confirmação sem a sugestão
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // FUNÇÕES DE AÇÃO (CRIAR, ATUALIZAR, BUSCAR) - Lógica original mantida
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
      await post('/categories', {
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
      refetchCategories();
    } catch (err) {
      setError(`Erro ao criar categoria: ${err.message}`);
      speakText('Erro ao criar categoria');
    } finally {
      setIsProcessing(false);
    }
  };

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
      const allTransactions = await get(`/transactions?context=${context}`);
      const found = allTransactions.filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase()));

      if (found.length === 0) {
        const msg = `Não encontrei nenhuma transação com "${searchTerm}"`;
        addToConversation(setConversation, 'assistant', msg);
        speakText(msg);
        setIsProcessing(false);
        return;
      }

      if (found.length === 1) {
        const transaction = found[0];
        updateTransactionMutation.mutate({ id: transaction.id || transaction._id, data: { status: targetStatus } });
        const statusText = targetStatus === 'paid' ? 'paga' : 'pendente';
        const msg = `Transação "${transaction.description}" marcada como ${statusText}!`;
        setSuccess(msg);
        speakText(msg);
        resetConversation();
      } else {
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

  const handleSearchTransactions = async (processed) => {
    try {
      setIsProcessing(true);
      const filters = { context: context };
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
      const sorted = results.sort((a, b) => new Date(a.date) - new Date(b.date));
      setSearchResults(sorted);
      setShowListModal(true);
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

  // CIRURGIA 7: Lógica de confirmação agora lida com criação de categoria
  const confirmAction = async () => {
    let categoryId = confirmation.entities.category_id;

    if (!categoryId) {
      setError('Por favor, selecione uma categoria.');
      speakText('Selecione uma categoria.');
      return;
    }

    setIsProcessing(true);
    try {
      // Se a categoria precisa ser criada
      if (categoryId === 'create_new' && confirmation.entities.new_category_details) {
        const newCategoryData = {
          ...confirmation.entities.new_category_details,
          context: context,
        };
        const newCategory = await post('/categories', newCategoryData);
        categoryId = newCategory.id; // Pega o ID da categoria recém-criada
        refetchCategories(); // Atualiza a lista de categorias no cache
      }
      
      const transactionData = {
        ...confirmation.entities,
        category_id: categoryId, // Usa o ID correto (existente ou novo)
      };
      
      // Remove campos auxiliares antes de enviar
      delete transactionData.new_category_details;
      delete transactionData.category_name;

      createTransactionMutation.mutate(transactionData, {
        onSuccess: () => {
          const successMsg = CommandMapper.generateSuccessMessage(transactionData);
          setSuccess(successMsg);
          speakText(successMsg);
          resetConversation();
          if (onTransactionAdded) onTransactionAdded();
        },
        onError: (err) => {
          setError(err.message || 'Erro ao criar transação');
          speakText('Erro ao criar transação');
        }
      });

    } catch (err) {
      setError(err.message || 'Erro no processo de confirmação');
      speakText('Desculpe, algo deu errado ao confirmar.');
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
    setLastFieldFilled(null);
  };

  // CIRURGIA 8: Handler para o select do modal de confirmação
  const handleConfirmationCategoryChange = (value) => {
    if (!value) return;
    setConfirmation(prev => {
      const newEntities = { ...prev.entities, category_id: value };
      if (value !== 'create_new') {
        const selectedCategory = categories.find(c => (c.id || c._id) === value);
        newEntities.category_name = selectedCategory?.name;
        delete newEntities.new_category_details;
      } else {
        newEntities.category_name = prev.entities.new_category_details.name;
      }
      return { ...prev, entities: newEntities };
    });
  };

  const handleStatusUpdate = async (transaction, newStatus) => {
    try {
      updateTransactionMutation.mutate({ id: transaction.id || transaction._id, data: { status: newStatus } });
      const statusText = newStatus === 'paid' ? 'paga' : 'pendente';
      setSuccess(`"${transaction.description}" marcada como ${statusText}!`);
      setShowListModal(false);
      resetConversation();
    } catch (err) {
      setError(`Erro: ${err.message}`);
    }
  };

  // ==========================================
  // RENDERIZAÇÃO (JSX) - Lógica original mantida com aprimoramentos
  // ==========================================
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
        {isListening ? <MicOff className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
        {isListening ? 'Ouvindo...' : 'Comando de Voz'}
      </Button>

      {conversation.length > 0 && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 max-h-96 overflow-y-auto">
          <div className="space-y-3">
            {conversation.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                  <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CIRURGIA 9: Modal de confirmação aprimorado para usar o novo Select e a lógica de sugestão */}
      {confirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-full"><AlertCircle className="w-5 h-5 text-blue-600" /></div>
                <h3 className="text-lg font-semibold text-gray-900">Confirmar Transação</h3>
              </div>
              <div className="space-y-3 mb-6">
                <p className="text-sm text-gray-600"><strong>Comando:</strong> "{confirmation.originalCommand}"</p>
                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li><strong>Descrição:</strong> {confirmation.entities.description}</li>
                    <li><strong>Tipo:</strong> {confirmation.entities.type === 'expense' ? 'Despesa' : 'Receita'}</li>
                    <li><strong>Valor:</strong> {formatCurrency(confirmation.entities.amount)}</li>
                    <li><strong>Data:</strong> {formatBR(new Date(confirmation.entities.date))}</li>
                    <li><strong>Status:</strong> {confirmation.entities.status === 'paid' ? 'Pago' : 'Pendente'}</li>
                  </ul>
                  <div className="pt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                    <Select
                      value={confirmation.entities.category_id || ''}
                      onValueChange={handleConfirmationCategoryChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione uma categoria..." />
                      </SelectTrigger>
                      <SelectContent>
                        {confirmation.entities.category_id === 'create_new' && (
                          <SelectItem value="create_new">
                            ✨ Criar: "{confirmation.entities.new_category_details.name}"
                          </SelectItem>
                        )}
                        {categories
                          .filter(cat => cat.type === confirmation.entities.type)
                          .map(cat => (
                            <SelectItem key={cat.id || cat._id} value={cat.id || cat._id}>
                              {cat.emoji} {cat.name}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={cancelAction} disabled={isProcessing}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={confirmAction} disabled={isProcessing || !confirmation.entities.category_id}>
                  {isProcessing ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                  Confirmar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <List className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Transações Encontradas ({searchResults.length})</h3>
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
                          <span className="flex items-center"><DollarSign className="w-3 h-3 mr-1" />{formatCurrency(transaction.amount)}</span>
                          <span className="flex items-center"><Clock className="w-3 h-3 mr-1" />{formatBR(new Date(transaction.date))}</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${transaction.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>{transaction.status === 'paid' ? 'Pago' : 'Pendente'}</span>
                        </div>
                      </div>
                      {transaction.targetStatus && (
                        <Button size="sm" onClick={() => handleStatusUpdate(transaction, transaction.targetStatus)} className="ml-4">
                          Marcar como {transaction.targetStatus === 'paid' ? 'Pago' : 'Pendente'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={() => setShowListModal(false)}>Fechar</Button>
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
