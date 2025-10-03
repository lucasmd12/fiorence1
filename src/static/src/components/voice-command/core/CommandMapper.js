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
    includeAcknowledgment = true, // MODIFICAÇÃO: Ligado por padrão para criar o diálogo.
    includeTip = false,
    variateQuestions = true,
    lastFieldFilled = null // MODIFICAÇÃO: O VoiceCommand.jsx passará este parâmetro.
  } = options;

  let question = "";

  // PASSO 1: Adiciona o reconhecimento da informação anterior.
  if (includeAcknowledgment && lastFieldFilled && transaction[lastFieldFilled]) {
    const ack = generateAcknowledgment(lastFieldFilled, transaction);
    if (ack) question += ack + " ";
  }

  // PASSO 2 (NOVO): Implanta o "Neurônio da Sugestão Proativa".
  // Se o campo faltante for 'category' e já tivermos uma descrição,
  // preparamos uma frase de sugestão em vez de uma pergunta.
  if (field === 'category' && transaction.description) {
    // O {suggestion} será substituído no VoiceCommand.jsx pela resposta da API.
    question += `Para "${transaction.description}", a categoria é {suggestion}, correto?`;
    return question;
  }

  // PASSO 3: Chama a sua lógica original de geração de perguntas contextuais.
  if (useContextual) {
    question += generateContextualQuestion(field, transaction);
  } else {
    question += generateBasicQuestion(field, variateQuestions);
  }

  // PASSO 4: Adiciona uma dica, se configurado.
  if (includeTip) {
    question += `\n\n${helpfulTips[field] || ""}`;
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
  
  // Categoria (MODIFICAÇÃO: Usa category_name para a confirmação)
  const categoryName = transaction.category_name || (transaction.category ? (transaction.category.name || transaction.category) : null);
  if (categoryName) {
    parts.push(`na categoria **${categoryName}**`);
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
  if (typeof value !== 'number') return "";
  
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
  if (isNaN(dateObj.getTime())) return "";

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Compara apenas dia/mês/ano
  const isSameDay = (d1, d2) => {
    return d1.toDateString() === d2.toDateString();
  };

  if (isSameDay(dateObj, today)) return "hoje";
  if (isSameDay(dateObj, yesterday)) return "ontem";
  if (isSameDay(dateObj, tomorrow)) return "amanhã";

  // Formato DD/MM/YYYY
  return dateObj.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
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
