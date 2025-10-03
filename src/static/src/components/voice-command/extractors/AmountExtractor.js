import { numbersMap, multipliers } from '../constants/numberMaps';
import { moneySlang } from '../constants/brazilianSlangDictionary';

// ============================================
// AMOUNT EXTRACTOR - VERSÃO COMPLETA
// Original + Sistema Brasileiro de Gírias
// ============================================

// ==========================================
// FUNÇÕES ORIGINAIS (mantidas 100%)
// ==========================================

const extractSpecialCases = (command) => {
  const specialPatterns = [
    { pattern: /meio milhão|meia milhão/i, value: 500000 },
    { pattern: /meio bilhão|meia bilhão/i, value: 500000000 },
    { pattern: /meio trilhão|meia trilhão/i, value: 500000000000 },
    { pattern: /um quarto de milhão/i, value: 250000 },
    { pattern: /três quartos de milhão/i, value: 750000 },
    { pattern: /dois terços de milhão/i, value: 666666.67 }
  ];

  for (const { pattern, value } of specialPatterns) {
    if (pattern.test(command)) {
      return value;
    }
  }
  return null;
};

const normalizeDigitalValue = (valueStr, multiplierStr = null) => {
  valueStr = valueStr.trim();
  let numericValue = 0;

  if (valueStr.includes(',') && valueStr.includes('.')) {
    numericValue = parseFloat(valueStr.replace(/\./g, '').replace(',', '.'));
  } else if (valueStr.includes(',')) {
    const parts = valueStr.split(',');
    if (parts[1].length <= 2) {
      numericValue = parseFloat(valueStr.replace(',', '.'));
    } else {
      numericValue = parseFloat(valueStr.replace(/,/g, ''));
    }
  } else if (valueStr.includes('.')) {
    const parts = valueStr.split('.');
    if (parts.length === 2 && parts[1].length <= 2 && parts[0].length <= 3) {
      numericValue = parseFloat(valueStr);
    } else {
      numericValue = parseFloat(valueStr.replace(/\./g, ''));
    }
  } else {
    numericValue = parseFloat(valueStr);
  }

  if (multiplierStr && multipliers[multiplierStr.toLowerCase()]) {
    const multiplier = multipliers[multiplierStr.toLowerCase()];
    numericValue *= multiplier;
  }
  return isNaN(numericValue) ? null : numericValue;
};

const extractDigitalPatterns = (command) => {
  const digitalPatterns = [
    /(?:r\$\s*)?(\d{1,3}(?:\.\d{3})*,\d{1,2})\s*(?:reais?)?/i,
    /(?:r\$\s*)?(\d+(?:[.,]\d+)?)\s*(mil|milhão|milhões|milhao|milhoes|bilhão|bilhões|bilhao|bilhoes|trilhão|trilhões|trilhao|trilhoes)/i,
    /(?:r\$\s*)?(\d{1,3}(?:\.\d{3})+)(?!\s*vírgula|\s*,)/i,
    /(?:r\$\s*)?(\d+\.\d{3})(?!\d)/i,
    /(?:r\$\s*)?(\d+,\d{1,2})/i,
    /(\d+(?:[.,]\d+)?)\s*(?:reais?|r\$)/i,
    /(?:r\$\s*)?(\d+(?:\.\d{1,2})?)/i
  ];

  for (let i = 0; i < digitalPatterns.length; i++) {
    const pattern = digitalPatterns[i];
    const match = command.match(pattern);
    if (match) {
      let valueStr = match[1];
      const multiplierStr = match[2];
      const normalizedValue = normalizeDigitalValue(valueStr, multiplierStr);
      if (normalizedValue !== null) {
        return normalizedValue;
      }
    }
  }
  return null;
};

const convertWordsToNumber = (text) => {
  if (!text) return null;
  const words = text.toLowerCase().split(/\s+/);
  let total = 0;
  let current = 0;

  for (const word of words) {
    if (numbersMap[word] !== undefined) {
      if (numbersMap[word] === 100) {
        current = current === 0 ? 100 : current * 100;
      } else {
        current += numbersMap[word];
      }
    } else if (multipliers[word]) {
      if (current === 0) current = 1;
      total += current * multipliers[word];
      current = 0;
    }
  }
  return total + current || null;
};

const parseComplexWordsToNumber = (match) => {
  let total = 0;
  for (let i = 1; i < match.length; i += 2) {
    const numberPart = match[i];
    const multiplierPart = match[i + 1];
    if (!numberPart) continue;
    const baseNumber = convertWordsToNumber(numberPart);
    if (!baseNumber) continue;
    if (multiplierPart) {
      const multiplier = multipliers[multiplierPart.toLowerCase()];
      if (multiplier) {
        total += baseNumber * multiplier;
      }
    } else {
      total += baseNumber;
    }
  }
  return total > 0 ? total : null;
};

const extractAmountFromWords = (command) => {
  const wordPatterns = [
    /(\w+(?:\s+\w+)*?)\s+(trilhões?|trilhoes?)\s*(?:e\s+(\w+(?:\s+\w+)*?)\s+(bilhões?|bilhoes?))?\s*(?:e\s+(\w+(?:\s+\w+)*?)\s+(milhões?|milhoes?))?\s*(?:e\s+(\w+(?:\s+\w+)*?)\s+mil)?\s*(?:e\s+(\w+(?:\s+\w+)*?))?/i,
    /(\w+(?:\s+\w+)*?)\s+(bilhões?|bilhoes?)\s*(?:e\s+(\w+(?:\s+\w+)*?)\s+(milhões?|milhoes?))?\s*(?:e\s+(\w+(?:\s+\w+)*?)\s+mil)?\s*(?:e\s+(\w+(?:\s+\w+)*?))?/i,
    /(\w+(?:\s+\w+)*?)\s+(milhões?|milhoes?)\s*(?:e\s+(\w+(?:\s+\w+)*?)\s+mil)?\s*(?:e\s+(\w+(?:\s+\w+)*?))?/i,
    /(\w+(?:\s+\w+)*?)\s+mil\s*(?:e\s+(\w+(?:\s+\w+)*?))?/i,
    /^(\w+(?:\s+\w+)*?)$/i
  ];

  for (const pattern of wordPatterns) {
    const match = command.match(pattern);
    if (match) {
      const value = parseComplexWordsToNumber(match);
      if (value !== null && value > 0) {
        return value;
      }
    }
  }
  return null;
};

// ==========================================
// NOVAS FUNÇÕES - SISTEMA BRASILEIRO
// ==========================================

/**
 * ⭐ NOVO: Extrai valores de notas específicas
 * Ex: "uma onça" = R$ 50, "um peixe" = R$ 100, "um toco" = R$ 100
 */
const extractSpecificNotes = (command) => {
  const cmd = command.toLowerCase();
  
  for (const [slang, value] of Object.entries(moneySlang.specificNotes)) {
    if (cmd.includes(slang)) {
      // Verifica se tem quantidade antes (ex: "duas onças")
      const quantityPattern = new RegExp(`(\\w+)\\s+${slang.replace(/[()]/g, '\\$&')}`, 'i');
      const match = cmd.match(quantityPattern);
      
      if (match) {
        const quantity = convertWordsToNumber(match[1]) || 1;
        return value * quantity;
      }
      return value;
    }
  }
  return null;
};

/**
 * ⭐ NOVO: Extrai gírias brasileiras de dinheiro
 * Ex: "cinquenta pau", "dez conto", "vinte pila", "cem mangos"
 */
const extractBrazilianSlang = (command) => {
  const cmd = command.toLowerCase();
  
  // Padrão 1: [número] + [gíria básica]
  // Ex: "50 pau", "dez conto", "vinte pila"
  const basicSlangPattern = /(\d+|um|uma|dois|duas|três|quatro|cinco|seis|sete|oito|nove|dez|vinte|trinta|quarenta|cinquenta|sessenta|setenta|oitenta|noventa|cem|duzentos|trezentos|quatrocentos|quinhentos)\s*(pau|paus|conto|contos|pila|pilas|mango|mangos|prata|pratas|grana|dindin)/gi;
  
  let match = cmd.match(basicSlangPattern);
  if (match) {
    const parts = match[0].split(/\s+/);
    const numberPart = parts[0];
    const slangPart = parts[1];
    
    // Converte o número (pode ser palavra ou dígito)
    let value = parseFloat(numberPart);
    if (isNaN(value)) {
      value = convertWordsToNumber(numberPart);
    }
    
    // Aplica o multiplicador da gíria (geralmente 1)
    if (value && moneySlang.basicUnits[slangPart]) {
      return value * moneySlang.basicUnits[slangPart];
    }
  }
  
  // Padrão 2: [número] + [multiplicador grande]
  // Ex: "dois milão" = 2000, "cinco k" = 5000, "um barão" = 1000
  const bigMultiplierPattern = /(\d+|um|uma|dois|duas|três|quatro|cinco|seis|sete|oito|nove|dez|meio|meia)\s*(milão|k|barão|barões)/gi;
  
  match = cmd.match(bigMultiplierPattern);
  if (match) {
    const parts = match[0].split(/\s+/);
    const quantity = parts[0];
    const multiplier = parts[1];
    
    let value = parseFloat(quantity);
    if (isNaN(value)) {
      value = convertWordsToNumber(quantity) || 1;
    }
    
    if (moneySlang.bigMultipliers[multiplier]) {
      return value * moneySlang.bigMultipliers[multiplier];
    }
  }
  
  // Padrão 3: Apenas o multiplicador (implica "um")
  // Ex: "um milão", "dois k"
  const implicitPattern = /(milão|barão|barões)\b/gi;
  match = cmd.match(implicitPattern);
  if (match) {
    const multiplier = match[0].toLowerCase();
    if (moneySlang.bigMultipliers[multiplier]) {
      // Verifica se tem número antes
      const numberBefore = cmd.match(new RegExp(`(\\d+|\\w+)\\s+${multiplier}`, 'i'));
      if (!numberBefore) {
        return moneySlang.bigMultipliers[multiplier]; // Retorna 1x o multiplicador
      }
    }
  }
  
  return null;
};

/**
 * ⭐ NOVO: Extrai frações + valores
 * Ex: "meio pau" = 0.50, "meia pila" = 0.50
 */
const extractFractionalAmounts = (command) => {
  const cmd = command.toLowerCase();
  
  const fractionalPattern = /(meio|meia|um quarto|três quartos|dois terços)\s+(pau|conto|pila|mango|prata|grana)/i;
  const match = cmd.match(fractionalPattern);
  
  if (match) {
    const fraction = match[1];
    const unit = match[2];
    
    if (moneySlang.fractions[fraction] && moneySlang.basicUnits[unit]) {
      return moneySlang.fractions[fraction] * moneySlang.basicUnits[unit];
    }
  }
  
  return null;
};

// ==========================================
// FUNÇÃO PRINCIPAL EXPANDIDA
// ==========================================

/**
 * FUNÇÃO PRINCIPAL: Extrai valores do comando
 * 
 * Ordem de prioridade (do mais específico ao mais genérico):
 * 1. Casos especiais (meio milhão, etc) - ORIGINAL
 * 2. Notas específicas (onça, peixe, toco) - NOVO
 * 3. Gírias brasileiras (pau, conto, pila, mango, milão, k) - NOVO
 * 4. Frações (meio pau, meia pila) - NOVO
 * 5. Valores digitais (R$ 100, 50,00) - ORIGINAL
 * 6. Valores por extenso (cinquenta reais) - ORIGINAL
 */
export const extractAmount = (command) => {
  // Normaliza o comando
  const normalizedCommand = command.toLowerCase().trim();
  
  // 1. Casos especiais (ORIGINAL)
  const specialCases = extractSpecialCases(normalizedCommand);
  if (specialCases !== null) {
    return specialCases;
  }

  // 2. ⭐ NOVO: Notas específicas (onça, peixe, toco)
  const noteValue = extractSpecificNotes(normalizedCommand);
  if (noteValue !== null) {
    return noteValue;
  }

  // 3. ⭐ NOVO: Gírias brasileiras (pau, conto, pila, mango, milão, k)
  const slangValue = extractBrazilianSlang(normalizedCommand);
  if (slangValue !== null) {
    return slangValue;
  }

  // 4. ⭐ NOVO: Frações (meio pau, meia pila)
  const fractionalValue = extractFractionalAmounts(normalizedCommand);
  if (fractionalValue !== null) {
    return fractionalValue;
  }

  // 5. Valores digitais (ORIGINAL)
  const digitalValue = extractDigitalPatterns(normalizedCommand);
  if (digitalValue !== null) {
    return digitalValue;
  }

  // 6. Valores por extenso (ORIGINAL)
  const extendedValue = extractAmountFromWords(normalizedCommand);
  if (extendedValue !== null) {
    return extendedValue;
  }
  
  return null;
};

// ==========================================
// EXPORTAÇÕES PARA TESTES E DEBUG
// ==========================================

export const testHelpers = {
  // Funções originais
  extractSpecialCases,
  normalizeDigitalValue,
  extractDigitalPatterns,
  convertWordsToNumber,
  extractAmountFromWords,
  
  // Novas funções brasileiras
  extractSpecificNotes,
  extractBrazilianSlang,
  extractFractionalAmounts
};