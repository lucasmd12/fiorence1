import { statusPatterns } from '../constants/patterns';
import { paymentStatus } from '../constants/brazilianSlangDictionary';

// ============================================
// EXTRATOR DE STATUS - INTEGRADO
// Usa sistema antigo + novo sistema brasileiro
// ============================================

/**
 * Calcula score usando PADRÕES ANTIGOS (patterns.js)
 */
const calculateScoreFromOldPatterns = (command) => {
  let paidScore = 0;
  let pendingScore = 0;

  // Sistema antigo - statusPatterns
  if (Array.isArray(statusPatterns.paid)) {
    statusPatterns.paid.forEach(pattern => {
      if (pattern.test(command)) paidScore += 5;
    });
  } else if (statusPatterns.paid && statusPatterns.paid.test(command)) {
    paidScore += 5;
  }

  if (Array.isArray(statusPatterns.pending)) {
    statusPatterns.pending.forEach(pattern => {
      if (pattern.test(command)) pendingScore += 5;
    });
  } else if (statusPatterns.pending && statusPatterns.pending.test(command)) {
    pendingScore += 5;
  }

  return { paidScore, pendingScore };
};

/**
 * Calcula score usando NOVO SISTEMA (dicionário brasileiro)
 */
const calculateScoreFromBrazilianSlang = (command) => {
  const cmd = command.toLowerCase();
  let paidScore = 0;
  let pendingScore = 0;

  // PAGO - Novo sistema com pesos
  paymentStatus.paid.verbs.forEach(verb => {
    if (cmd.includes(verb)) paidScore += 10;
  });

  paymentStatus.paid.expressions.forEach(expr => {
    if (cmd.includes(expr)) paidScore += 8;
  });

  // PENDENTE - Novo sistema com pesos
  paymentStatus.pending.verbs.forEach(verb => {
    if (cmd.includes(verb)) pendingScore += 10;
  });

  paymentStatus.pending.expressions.forEach(expr => {
    if (cmd.includes(expr)) pendingScore += 8;
  });

  return { paidScore, pendingScore };
};

/**
 * Detecta indicadores temporais que afetam o status
 */
const detectTemporalIndicators = (command) => {
  const cmd = command.toLowerCase();

  // Indicadores de futuro = pendente
  const futureIndicators = [
    'vou pagar', 'vou quitar', 'tenho que pagar', 'preciso pagar',
    'devo pagar', 'falta pagar', 'amanhã', 'semana que vem',
    'mês que vem', 'depois', 'ainda não', 'até'
  ];

  for (const indicator of futureIndicators) {
    if (cmd.includes(indicator)) {
      return 'pending';
    }
  }

  // Indicadores de passado = pago
  const pastIndicators = [
    'já paguei', 'já quitei', 'acabei de pagar', 'paguei ontem',
    'paguei hoje', 'paguei essa', 'paguei esse', 'já era', 'já foi'
  ];

  for (const indicator of pastIndicators) {
    if (cmd.includes(indicator)) {
      return 'paid';
    }
  }

  return null;
};

/**
 * Detecta contexto de criação vs. pagamento
 */
const detectCreationContext = (command) => {
  const cmd = command.toLowerCase();

  // Palavras que indicam nova transação
  const creationKeywords = [
    'registrar', 'registrei', 'anotar', 'anotei', 'lançar', 'lancei',
    'adicionar', 'adicionei', 'criar', 'criei', 'comprei', 'gastei',
    'foi', 'custou', 'saiu'
  ];

  for (const keyword of creationKeywords) {
    if (cmd.includes(keyword)) {
      // Se tem confirmação de pagamento, é pago
      const hasPaidConfirmation = 
        cmd.includes('já paguei') || 
        cmd.includes('pago') ||
        cmd.includes('quitei') ||
        cmd.includes('já foi') ||
        cmd.includes('já era');
      
      return hasPaidConfirmation ? 'paid' : 'pending';
    }
  }

  return null;
};

/**
 * FUNÇÃO PRINCIPAL: Extrai status de pagamento
 * 
 * Combina sistema antigo + novo para máxima precisão
 * 
 * @param {string} command - Comando do usuário
 * @returns {string} - 'paid' ou 'pending'
 */
export const extractStatus = (command) => {
  if (!command) return 'paid'; // Default

  const normalizedCommand = command.toLowerCase().trim();

  // 1. Verifica indicadores temporais (mais específico)
  const temporal = detectTemporalIndicators(normalizedCommand);
  if (temporal) {
    return temporal;
  }

  // 2. Verifica contexto de criação
  const creation = detectCreationContext(normalizedCommand);
  if (creation) {
    return creation;
  }

  // 3. Calcula scores do SISTEMA ANTIGO
  const oldScores = calculateScoreFromOldPatterns(normalizedCommand);
  let paidScore = oldScores.paidScore;
  let pendingScore = oldScores.pendingScore;

  // 4. Adiciona scores do NOVO SISTEMA BRASILEIRO
  const newScores = calculateScoreFromBrazilianSlang(normalizedCommand);
  paidScore += newScores.paidScore;
  pendingScore += newScores.pendingScore;

  // 5. Se ambos scores são zero, usa regra padrão
  if (paidScore === 0 && pendingScore === 0) {
    if (normalizedCommand.includes('pagar') && !normalizedCommand.includes('paguei')) {
      return 'pending';
    }
    if (normalizedCommand.includes('gastei') || 
        normalizedCommand.includes('comprei') ||
        normalizedCommand.includes('paguei')) {
      return 'paid';
    }
    return 'paid'; // Default
  }

  // 6. Decisão por score total
  if (paidScore > pendingScore) {
    return 'paid';
  }
  if (pendingScore > paidScore) {
    return 'pending';
  }

  // 7. Empate: usa contexto do verbo
  if (normalizedCommand.match(/\b(paguei|quitei|resolvi)\b/)) {
    return 'paid';
  }
  if (normalizedCommand.match(/\b(pagar|quitar|resolver)\b/)) {
    return 'pending';
  }

  return 'paid'; // Default
};

/**
 * Função auxiliar para debug - mostra todos os scores
 */
export const debugStatusScores = (command) => {
  const cmd = command.toLowerCase().trim();
  const oldScores = calculateScoreFromOldPatterns(cmd);
  const newScores = calculateScoreFromBrazilianSlang(cmd);
  const temporal = detectTemporalIndicators(cmd);
  const creation = detectCreationContext(cmd);
  const result = extractStatus(cmd);

  return {
    command: cmd,
    oldSystem: oldScores,
    newSystem: newScores,
    totalPaid: oldScores.paidScore + newScores.paidScore,
    totalPending: oldScores.pendingScore + newScores.pendingScore,
    temporal,
    creation,
    result,
    confidence: Math.abs(
      (oldScores.paidScore + newScores.paidScore) - 
      (oldScores.pendingScore + newScores.pendingScore)
    )
  };
};

// Exporta funções auxiliares para testes
export const testHelpers = {
  calculateScoreFromOldPatterns,
  calculateScoreFromBrazilianSlang,
  detectTemporalIndicators,
  detectCreationContext
};