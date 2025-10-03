import { typePatterns } from "../constants/patterns";
import { contextualKeywords } from "../constants/keywords";
import { transactionPatterns } from "../constants/brazilianSlangDictionary";

// ============================================
// EXTRATOR DE TIPO DE TRANSAÇÃO - INTEGRADO
// Usa sistema antigo + novo sistema brasileiro
// ============================================

/**
 * Calcula score usando PADRÕES ANTIGOS (patterns.js)
 */
const calculateScoreFromOldPatterns = (command) => {
  let expenseScore = 0;
  let incomeScore = 0;

  // Sistema antigo - typePatterns
  typePatterns.expense.forEach(pattern => {
    if (pattern.test(command)) expenseScore += 5;
  });

  typePatterns.income.forEach(pattern => {
    if (pattern.test(command)) incomeScore += 5;
  });

  return { expenseScore, incomeScore };
};

/**
 * Calcula score usando NOVO SISTEMA (dicionário brasileiro)
 */
const calculateScoreFromBrazilianSlang = (command) => {
  let expenseScore = 0;
  let incomeScore = 0;
  const cmd = command.toLowerCase();

  // DESPESAS - Novo sistema com pesos
  transactionPatterns.expense.strongVerbs.forEach(verb => {
    if (cmd.includes(verb)) expenseScore += 10;
  });

  transactionPatterns.expense.mediumVerbs.forEach(verb => {
    if (cmd.includes(verb)) expenseScore += 8;
  });

  transactionPatterns.expense.nouns.forEach(noun => {
    if (cmd.includes(noun)) expenseScore += 6;
  });

  transactionPatterns.expense.slangExpressions.forEach(expr => {
    if (cmd.includes(expr)) expenseScore += 5;
  });

  transactionPatterns.expense.paymentMethods.forEach(method => {
    if (cmd.includes(method)) expenseScore += 4;
  });

  // RECEITAS - Novo sistema com pesos
  transactionPatterns.income.strongVerbs.forEach(verb => {
    if (cmd.includes(verb)) incomeScore += 10;
  });

  transactionPatterns.income.mediumVerbs.forEach(verb => {
    if (cmd.includes(verb)) incomeScore += 8;
  });

  transactionPatterns.income.nouns.forEach(noun => {
    if (cmd.includes(noun)) incomeScore += 6;
  });

  transactionPatterns.income.slangExpressions.forEach(expr => {
    if (cmd.includes(expr)) incomeScore += 5;
  });

  transactionPatterns.income.incomeTypes.forEach(type => {
    if (cmd.includes(type)) incomeScore += 4;
  });

  return { expenseScore, incomeScore };
};

/**
 * Adiciona score baseado em contexto de categorias
 */
const addCategoryContextScore = (command, expenseScore, incomeScore) => {
  let newExpenseScore = expenseScore;
  let newIncomeScore = incomeScore;

  for (const [category, keywords] of Object.entries(contextualKeywords)) {
    const matches = keywords.filter(kw => command.includes(kw)).length;
    if (matches > 0) {
      if (["alimentação", "transporte", "saúde", "casa"].includes(category)) {
        newExpenseScore += matches;
      } else if (category === "trabalho") {
        newIncomeScore += matches;
      }
    }
  }

  return { expenseScore: newExpenseScore, incomeScore: newIncomeScore };
};

/**
 * Detecta negações que invertem o sentido
 */
const detectNegation = (command) => {
  const negationPatterns = [
    /não\s+(recebi|ganhei|faturei)/i,
    /não\s+(gastei|paguei|comprei)/i,
    /nem\s+(recebi|ganhei)/i,
    /nem\s+(gastei|paguei)/i
  ];

  for (const pattern of negationPatterns) {
    const match = command.match(pattern);
    if (match) {
      const verb = match[1].toLowerCase();
      if (['recebi', 'ganhei', 'faturei'].includes(verb)) {
        return 'negated_income';
      }
      if (['gastei', 'paguei', 'comprei'].includes(verb)) {
        return 'negated_expense';
      }
    }
  }
  return null;
};

/**
 * FUNÇÃO PRINCIPAL: Extrai tipo de transação
 * 
 * Combina sistema antigo + novo para máxima precisão
 * 
 * @param {string} command - Comando do usuário
 * @returns {string} - 'expense', 'income' ou null
 */
export const extractTransactionType = (command) => {
  const normalizedCommand = command.toLowerCase().trim();

  // 1. Verifica negações primeiro
  const negation = detectNegation(normalizedCommand);
  if (negation === 'negated_income') return 'expense';
  if (negation === 'negated_expense') return 'income';

  // 2. Calcula scores do SISTEMA ANTIGO
  const oldScores = calculateScoreFromOldPatterns(normalizedCommand);
  let expenseScore = oldScores.expenseScore;
  let incomeScore = oldScores.incomeScore;

  // 3. Adiciona scores do NOVO SISTEMA BRASILEIRO
  const newScores = calculateScoreFromBrazilianSlang(normalizedCommand);
  expenseScore += newScores.expenseScore;
  incomeScore += newScores.incomeScore;

  // 4. Adiciona contexto de categorias
  const contextScores = addCategoryContextScore(
    normalizedCommand,
    expenseScore,
    incomeScore
  );
  expenseScore = contextScores.expenseScore;
  incomeScore = contextScores.incomeScore;

  // 5. Decisão baseada em score total
  if (expenseScore > incomeScore && expenseScore >= 5) {
    return "expense";
  }
  if (incomeScore > expenseScore && incomeScore >= 5) {
    return "income";
  }

  // 6. Fallback - palavras-chave diretas
  if (normalizedCommand.includes('recebi') || normalizedCommand.includes('ganhei')) {
    return 'income';
  }
  if (normalizedCommand.includes('gastei') || normalizedCommand.includes('paguei')) {
    return 'expense';
  }

  return null;
};

/**
 * Função auxiliar para debug - mostra todos os scores
 */
export const debugScores = (command) => {
  const cmd = command.toLowerCase().trim();
  const oldScores = calculateScoreFromOldPatterns(cmd);
  const newScores = calculateScoreFromBrazilianSlang(cmd);
  const result = extractTransactionType(cmd);

  return {
    command: cmd,
    oldSystem: oldScores,
    newSystem: newScores,
    totalExpense: oldScores.expenseScore + newScores.expenseScore,
    totalIncome: oldScores.incomeScore + newScores.incomeScore,
    result,
    confidence: Math.abs(
      (oldScores.expenseScore + newScores.expenseScore) - 
      (oldScores.incomeScore + newScores.incomeScore)
    )
  };
};

// Exporta funções auxiliares para testes
export const testHelpers = {
  calculateScoreFromOldPatterns,
  calculateScoreFromBrazilianSlang,
  detectNegation
};