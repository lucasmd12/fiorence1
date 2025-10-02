// ARQUIVO COMPLETO: extractors/IntentExtractor.js - TODAS INTENÇÕES
import { intentPatterns } from "../constants/patterns";

const advancedIntentPatterns = {
  create_transaction: [
    /pagar|paguei|despesa|gasto|receita|receber|recebi|entrada|saída/i,
    /gastei|comprei|torrei|queimei|fritei|caiu|pingou/i
  ],
  
  schedule_transaction: [
    /agendar|agende|programar|todo (dia|mês|ano)|mensal|semanal|anual|recorrente/i,
    /repetir|automático|fixo|sempre/i
  ],
  
  create_category: [
    /criar (uma |a )?categoria/i,
    /nova categoria/i,
    /adicionar (uma |a )?categoria/i,
    /cadastrar (uma |a )?categoria/i,
    /registrar (uma |a )?categoria/i,
    /fazer (uma |a )?categoria/i,
    /quero (uma |a )?categoria/i
  ],
  
  update_transaction: [
    /atualizar (a |o )?transaç[ãa]o/i,
    /atualizar (a |o )?lan[çc]amento/i,
    /mudar (a |o )?transaç[ãa]o/i,
    /modificar (a |o )?transaç[ãa]o/i,
    /alterar (a |o )?transaç[ãa]o/i,
    /editar (a |o )?transaç[ãa]o/i,
    /corrigir (a |o )?transaç[ãa]o/i
  ],
  
  mark_as_paid: [
    /marcar como pag(o|a)/i,
    /adicionar status pag(o|a)/i,
    /definir como pag(o|a)/i,
    /foi pag(o|a)/i,
    /já paguei/i,
    /paguei (essa|isso|a|o)/i,
    /quitei/i,
    /zerei/i,
    /matei (a conta)?/i
  ],
  
  mark_as_pending: [
    /marcar como pendente/i,
    /adicionar status pendente/i,
    /ainda n[ãa]o (paguei|foi pago)/i,
    /n[ãa]o paguei/i,
    /fica pendente/i,
    /deixar pendente/i
  ],
  
  delete_transaction: [
    /excluir (a |o )?transaç[ãa]o/i,
    /deletar (a |o )?transaç[ãa]o/i,
    /remover (a |o )?transaç[ãa]o/i,
    /apagar (a |o )?transaç[ãa]o/i,
    /cancelar (a |o )?lan[çc]amento/i
  ],
  
  search_transaction: [
    /buscar (a |o )?transaç[ãa]o/i,
    /procurar (a |o )?transaç[ãa]o/i,
    /encontrar (a |o )?transaç[ãa]o/i,
    /onde (est[áa]|fica) (a |o )?transaç[ãa]o/i,
    /mostrar (a |o )?transaç[ãa]o/i
  ],

  list_transactions: [
    /quais (minhas|as|são as)/i,
    /mostrar (minhas|as)/i,
    /listar (minhas|as)/i,
    /ver (minhas|as)/i,
    /próximas? (dívidas?|contas?|despesas?|receitas?|pagamentos?)/i,
    /pendentes?/i,
    /a pagar/i,
    /para (pagar|receber)/i
  ]
};

const detectUpdateSubIntent = (command) => {
  const cmd = command.toLowerCase();
  
  if (/status|situaç[ãa]o/.test(cmd)) {
    if (/pag(o|a)/.test(cmd)) {
      return { subIntent: 'update_status', value: 'paid' };
    }
    if (/pendente|em aberto/.test(cmd)) {
      return { subIntent: 'update_status', value: 'pending' };
    }
    return { subIntent: 'update_status', value: null };
  }
  
  if (/valor|quantia|pre[çc]o/.test(cmd)) {
    return { subIntent: 'update_amount', value: null };
  }
  
  if (/data|dia|vencimento/.test(cmd)) {
    return { subIntent: 'update_date', value: null };
  }
  
  if (/categoria/.test(cmd)) {
    return { subIntent: 'update_category', value: null };
  }
  
  if (/descri[çc][ãa]o|nome|t[íi]tulo/.test(cmd)) {
    return { subIntent: 'update_description', value: null };
  }
  
  return null;
};

const extractTransactionReference = (command) => {
  const cmd = command.toLowerCase();
  
  const patterns = [
    /(?:a |o )?(?:despesa|lan[çc]amento|transaç[ãa]o|gasto|receita)\s+(?:de|do|da|com|no|na)\s+([^,.\n]+)/i,
    /(?:transaç[ãa]o|lan[çc]amento|despesa|receita)\s+de\s+(\d+(?:[.,]\d+)?)\s*(?:reais?|r\$)?/i,
    /gastei\s+\d+(?:[.,]\d+)?\s*(?:reais?|pau|conto)?\s+(?:em|no|na|com|de|do|da)\s+([^,.\n]+)/i,
    /(?:para|pra)\s+(?:a |o )?([^,.\n]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = cmd.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return null;
};

const calculateIntentConfidence = (command, intent) => {
  const cmd = command.toLowerCase();
  let confidence = 0.5;
  
  const strongKeywords = {
    create_category: ['criar', 'nova', 'cadastrar'],
    update_transaction: ['atualizar', 'modificar', 'alterar'],
    mark_as_paid: ['marcar', 'paguei', 'quitei'],
    delete_transaction: ['excluir', 'deletar', 'remover'],
    list_transactions: ['quais', 'mostrar', 'listar', 'próximas', 'pendentes']
  };
  
  const keywords = strongKeywords[intent];
  if (keywords) {
    const matches = keywords.filter(kw => cmd.includes(kw)).length;
    confidence += (matches * 0.15);
  }
  
  const reference = extractTransactionReference(cmd);
  if (reference && ['update_transaction', 'mark_as_paid', 'delete_transaction'].includes(intent)) {
    confidence += 0.2;
  }
  
  return Math.min(confidence, 1.0);
};

export const extractIntent = (command) => {
  const cmd = command.toLowerCase().trim();
  
  // Prioridade 1: list_transactions (busca e listagem)
  if (advancedIntentPatterns.list_transactions.some(pattern => pattern.test(cmd))) {
    return {
      intent: 'list_transactions',
      confidence: calculateIntentConfidence(cmd, 'list_transactions'),
      metadata: {}
    };
  }

  // Prioridade 2: create_category
  if (advancedIntentPatterns.create_category.some(pattern => pattern.test(cmd))) {
    return {
      intent: 'create_category',
      confidence: calculateIntentConfidence(cmd, 'create_category'),
      metadata: {
        categoryName: extractCategoryName(cmd)
      }
    };
  }

  // Prioridade 3: mark_as_paid (mais específico que update)
  if (advancedIntentPatterns.mark_as_paid.some(pattern => pattern.test(cmd))) {
    return {
      intent: 'mark_as_paid',
      confidence: calculateIntentConfidence(cmd, 'mark_as_paid'),
      metadata: {
        transactionReference: extractTransactionReference(cmd)
      }
    };
  }

  // Prioridade 4: mark_as_pending
  if (advancedIntentPatterns.mark_as_pending.some(pattern => pattern.test(cmd))) {
    return {
      intent: 'mark_as_pending',
      confidence: calculateIntentConfidence(cmd, 'mark_as_pending'),
      metadata: {
        transactionReference: extractTransactionReference(cmd)
      }
    };
  }

  // Prioridade 5: update_transaction (genérico)
  if (advancedIntentPatterns.update_transaction.some(pattern => pattern.test(cmd))) {
    return {
      intent: 'update_transaction',
      confidence: calculateIntentConfidence(cmd, 'update_transaction'),
      metadata: {
        transactionReference: extractTransactionReference(cmd),
        subIntent: detectUpdateSubIntent(cmd)
      }
    };
  }

  // Prioridade 6: delete_transaction
  if (advancedIntentPatterns.delete_transaction.some(pattern => pattern.test(cmd))) {
    return {
      intent: 'delete_transaction',
      confidence: calculateIntentConfidence(cmd, 'delete_transaction'),
      metadata: {
        transactionReference: extractTransactionReference(cmd)
      }
    };
  }

  // Prioridade 7: search_transaction
  if (advancedIntentPatterns.search_transaction.some(pattern => pattern.test(cmd))) {
    return {
      intent: 'search_transaction',
      confidence: calculateIntentConfidence(cmd, 'search_transaction'),
      metadata: {
        transactionReference: extractTransactionReference(cmd)
      }
    };
  }

  // Prioridade 8: schedule_transaction
  for (const [intent, patterns] of Object.entries(intentPatterns)) {
    if (patterns.some(pattern => pattern.test(cmd))) {
      return {
        intent,
        confidence: 0.7,
        metadata: {}
      };
    }
  }
  
  // Default: create_transaction
  return {
    intent: "create_transaction",
    confidence: 0.5,
    metadata: {}
  };
};

export const isCategoryCommand = (command) => {
  const cmd = command.toLowerCase();
  return /\b(categoria|categorias)\b/.test(cmd);
};

export const extractCategoryName = (command) => {
  const cmd = command.toLowerCase();
  
  const patterns = [
    /criar\s+(?:uma\s+)?categoria\s+(?:de\s+|chamada\s+)?([^\s,\.]+)/i,
    /nova\s+categoria\s+(?:de\s+|chamada\s+)?([^\s,\.]+)/i,
    /categoria\s+(?:de\s+)?([^\s,\.]+)/i,
    /adicionar\s+categoria\s+([^\s,\.]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = cmd.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim();
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
  }
  
  return null;
};

export const extractCategoryType = (command) => {
  const cmd = command.toLowerCase();
  
  if (/despesa|gasto|pagar|custo|sa[íi]da/.test(cmd)) {
    return 'expense';
  }
  
  if (/receita|ganho|receber|renda|entrada/.test(cmd)) {
    return 'income';
  }
  
  return 'expense';
};

export const intentHelpers = {
  detectUpdateSubIntent,
  extractTransactionReference,
  calculateIntentConfidence,
  isCategoryCommand,
  extractCategoryName,
  extractCategoryType
};