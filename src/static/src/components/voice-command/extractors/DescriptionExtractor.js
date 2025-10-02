// ARQUIVO COMPLETO: extractors/DescriptionExtractor.js - TODAS FUNCIONALIDADES
const removeCommandKeywords = (text) => {
  return text
    .replace(/\b(receita|despesa|entrada|sa[íi]da|gast(o|ei|ar)|pag(ar|uei|o)|receb(i|er))\b/gi, "")
    .replace(/\b(torrei|queimei|fritei|varei|derreti|estourei|pingou|caiu|garimpei|faturei)\b/gi, "")
    .replace(/\b(agendar|agende|mensal|semanal|anual|recorrente|repetir|autom[áa]tico|fixo|sempre)\b/gi, "")
    .replace(/\b(todo\s+dia\s+\d{1,2}|sempre\s+no\s+dia\s+\d{1,2})\b/gi, "")
    .replace(/\b(dia\s+\d{1,2}\s+de\s+\w+)\b/gi, "")
    .replace(/\b(hoje|ontem|amanh[ãa]|depois\s+de\s+amanh[ãa]|anteontem)\b/gi, "")
    .replace(/\b\d+(?:[.,]\d+)?\s*(?:reais?|r\$|pau|paus|conto|contos|pila|pilas|mango|mangos|prata|mil[ãa]o|k|bar[ãa]o)\b/gi, "")
    .replace(/\b(?:r\$\s*)?\d{1,3}(?:\.\d{3})*(?:,\d{2})?\b/gi, "")
    .replace(/\b(\d+(?:[.,]\d+)?)\s*(mil|milh[ãa]o|milh[õo]es|bilh[ãa]o|bilh[õo]es|trilh[ãa]o|trilh[õo]es)\b/gi, "")
    .replace(/\b(uma\s+on[çc]a|um\s+peixe|um\s+toco|cinquent[ãa]o|vint[ãa]o)\b/gi, "")
    .replace(/\b(pago|pendente|em\s+aberto|quitado|zerei|matei)\b/gi, "")
    .replace(/\bna\s+categoria\s+[\w\s]+\b/gi, "")
    .replace(/\bcategoria\s+(de\s+)?[\w]+\b/gi, "")
    .replace(/\b(atualizar|modificar|alterar|editar|mudar|corrigir)\b/gi, "")
    .replace(/\b(marcar\s+como|adicionar\s+status|definir\s+como)\b/gi, "")
    .replace(/\b(transaç[ãa]o|lan[çc]amento)\b/gi, "")
    .replace(/\b(quais|mostrar|listar|ver|buscar|procurar)\b/gi, "")
    .replace(/\b(minhas|as|são|próximas?|pendentes?)\b/gi, "")
    .replace(/\b(criar|nova|adicionar|cadastrar|registrar)\b/gi, "")
    .replace(/\b(de|do|da|em|no|na|com|para|pra|pro)\s*$/gi, "")
    .replace(/\s+/g, " ")
    .trim();
};

const extractMentionedCategory = (text) => {
  const cmd = text.toLowerCase();
  
  const patterns = [
    /\b(?:em|no|na|com|de|do|da)\s+([a-záàâãéèêíïóôõöúçñ]+)/i,
    /\bcategoria\s+(?:de\s+)?([a-záàâãéèêíïóôõöúçñ]+)/i,
    /\b(?:para|pra)\s+([a-záàâãéèêíïóôõöúçñ]+)/i
  ];
  
  for (const pattern of patterns) {
    const match = cmd.match(pattern);
    if (match && match[1] && match[1].length > 2) {
      const category = match[1].trim();
      return category.charAt(0).toUpperCase() + category.slice(1);
    }
  }
  
  return null;
};

const isTooGeneric = (description) => {
  if (!description || description.length < 3) return true;
  
  const genericWords = [
    'isso', 'isso ai', 'aquilo', 'la', 'coisas', 'coisa',
    'negocio', 'negócio', 'bagulho', 'trem', 'treco'
  ];
  
  return genericWords.some(word => 
    description.toLowerCase().trim() === word
  );
};

const enhanceDescription = (description, context = {}) => {
  if (!description) return null;
  
  let enhanced = description;
  
  if (context.mentionedCategory && !enhanced.toLowerCase().includes(context.mentionedCategory.toLowerCase())) {
    enhanced = `${context.mentionedCategory} - ${enhanced}`;
  }
  
  const brands = ['ifood', 'uber', '99', 'netflix', 'spotify'];
  brands.forEach(brand => {
    const regex = new RegExp(`\\b${brand}\\b`, 'gi');
    enhanced = enhanced.replace(regex, brand.charAt(0).toUpperCase() + brand.slice(1));
  });
  
  return enhanced;
};

export const extractDescription = (command, options = {}) => {
  const {
    includeCategory = false,
    enhance = true
  } = options;
  
  let description = removeCommandKeywords(command);
  const mentionedCategory = extractMentionedCategory(command);
  
  if (isTooGeneric(description)) {
    if (mentionedCategory) {
      description = mentionedCategory;
    } else {
      return null;
    }
  }
  
  if (enhance) {
    description = enhanceDescription(description, { mentionedCategory });
  }
  
  if (description && description.length > 0) {
    description = description.charAt(0).toUpperCase() + description.slice(1);
  }
  
  return description || null;
};

export const extractTransactionSearchTerm = (command) => {
  const cmd = command.toLowerCase();
  
  const cleaned = cmd
    .replace(/\b(atualizar|modificar|alterar|editar|mudar|corrigir|marcar|adicionar|definir|excluir|deletar|remover)\b/gi, "")
    .replace(/\b(como|status|transaç[ãa]o|lan[çc]amento|despesa|receita)\b/gi, "")
    .replace(/\b(pag(o|a)|pendente)\b/gi, "")
    .replace(/\b(quais|mostrar|listar|buscar|ver|próximas?)\b/gi, "")
    .replace(/\b(minhas|as|são)\b/gi, "")
    .replace(/\b(dívidas?|contas?|despesas?|receitas?|pagamentos?)\b/gi, "")
    .trim();
  
  const patterns = [
    /(?:para|pra)\s+(?:a\s+|o\s+)?(.+)/i,
    /\bde\s+(.+)/i,
    /\b(?:da|do)\s+(.+)/i,
    /(.+)/i
  ];
  
  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match && match[1] && match[1].trim().length > 2) {
      return match[1].trim();
    }
  }
  
  return null;
};

export const extractCategoryFromDescription = (command) => {
  return extractMentionedCategory(command);
};

export const extractCategoryNameForCreation = (command) => {
  const cmd = command.toLowerCase();
  
  const patterns = [
    /criar\s+(?:uma\s+)?categoria\s+(?:de\s+|chamada\s+|para\s+)?([^\s,\.]+(?:\s+[^\s,\.]+)?)/i,
    /nova\s+categoria\s+(?:de\s+|chamada\s+|para\s+)?([^\s,\.]+(?:\s+[^\s,\.]+)?)/i,
    /categoria\s+(?:de\s+|chamada\s+)?([^\s,\.]+(?:\s+[^\s,\.]+)?)/i,
    /adicionar\s+categoria\s+([^\s,\.]+(?:\s+[^\s,\.]+)?)/i,
    /cadastrar\s+categoria\s+([^\s,\.]+(?:\s+[^\s,\.]+)?)/i
  ];
  
  for (const pattern of patterns) {
    const match = cmd.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim()
        .replace(/\b(de|do|da|em|no|na|com|para|pra|pro)\b/gi, '')
        .trim();
      
      if (name.length > 2) {
        return name.charAt(0).toUpperCase() + name.slice(1);
      }
    }
  }
  
  return null;
};

export const extractListCriteria = (command) => {
  const cmd = command.toLowerCase();
  const criteria = {
    type: null,
    status: null,
    period: null,
    sortBy: 'date'
  };
  
  if (/pendentes?|a pagar|dívidas?|contas?/.test(cmd)) {
    criteria.status = 'pending';
    criteria.type = 'expense';
  }
  
  if (/receitas?|receber|a receber/.test(cmd)) {
    criteria.type = 'income';
  }
  
  if (/despesas?|gastos?/.test(cmd) && !criteria.status) {
    criteria.type = 'expense';
  }
  
  if (/próximas?/.test(cmd)) {
    criteria.period = 'future';
    criteria.sortBy = 'date';
  }
  
  if (/passadas?|anteriores?/.test(cmd)) {
    criteria.period = 'past';
    criteria.sortBy = 'date';
  }
  
  if (/este mês|esse mês|mês atual/.test(cmd)) {
    criteria.period = 'current_month';
  }
  
  return criteria;
};

export const descriptionHelpers = {
  removeCommandKeywords,
  extractMentionedCategory,
  isTooGeneric,
  enhanceDescription,
  extractTransactionSearchTerm,
  extractCategoryNameForCreation,
  extractListCriteria
};