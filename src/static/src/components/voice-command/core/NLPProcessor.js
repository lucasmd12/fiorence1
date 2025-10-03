// ARQUIVO COMPLETO: core/NLPProcessor.js - TODAS FUNCIONALIDADES
import { extractAmount } from "../extractors/AmountExtractor";
import { findBestCategory } from "../extractors/CategoryExtractor";
import { extractDate } from "../extractors/DateExtractor";
import { extractDescription } from "../extractors/DescriptionExtractor";
import { extractIntent } from "../extractors/IntentExtractor";
import { extractRecurring } from "../extractors/RecurringExtractor";
import { extractStatus } from "../extractors/StatusExtractor";
import { extractTransactionType } from "../extractors/TransactionTypeExtractor";
import { identifyMissingFields } from "../validators/MissingFieldsIdentifier";
import { formatISO } from "../formatters/DateFormatter";

class VoiceNLPProcessor {
  constructor(categories = []) {
    this.categories = categories;
    this.conversationHistory = [];
    this.userPatterns = {};
    this.contextStack = [];
  }

  processCommand(command, context) {
    const normalizedCommand = this.normalizeCommand(command);
    this.addToHistory(command, normalizedCommand);
    
    // EXTRAÇÃO COMPLETA
    const intentData = extractIntent(normalizedCommand);
    const analysis = {
      originalCommand: command,
      normalizedCommand,
      intent: intentData.intent,
      type: extractTransactionType(normalizedCommand),
      amount: extractAmount(normalizedCommand),
      description: extractDescription(normalizedCommand),
      date: extractDate(normalizedCommand),
      status: extractStatus(normalizedCommand),
      category: this.extractCategoryWithID(normalizedCommand),
      recurring: extractRecurring(normalizedCommand),
      confidence: 0,
      metadata: intentData.metadata || {},
      slangDetected: this.detectSlangUsage(normalizedCommand),
      contextEnhanced: false,
      userPatternMatch: this.matchUserPattern(normalizedCommand)
    };

    const enhancedAnalysis = this.enhanceWithContext(analysis, context);
    enhancedAnalysis.confidence = this.calculateConfidence(enhancedAnalysis);
    
    const transaction = this.buildTransactionObject(enhancedAnalysis, context);
    this.learnUserPattern(enhancedAnalysis);

    return transaction;
  }

  // CORREÇÃO CRÍTICA: Extrai categoria com ID correto
  extractCategoryWithID(command) {
    const categoryResult = findBestCategory(command, this.categories);
    
    if (!categoryResult) {
      // Busca categoria "Outros" como fallback
      const fallback = this.categories.find(cat => 
        cat.name.toLowerCase() === 'outros' || 
        cat.slug?.toLowerCase() === 'outros'
      );
      return fallback || null;
    }

    // Garante que retorna com ID correto
    return {
      id: categoryResult._id || categoryResult.id,
      name: categoryResult.name,
      slug: categoryResult.slug,
      type: categoryResult.type,
      emoji: categoryResult.emoji
    };
  }

  normalizeCommand(command) {
    let normalized = command.toLowerCase().trim();
    normalized = normalized.replace(/([^\d]),/g, '$1 ');
    normalized = normalized.replace(/,([^\d])/g, ' $1');
    normalized = normalized.replace(/[.!?;]/g, ' ');
    normalized = normalized.replace(/\s+/g, ' ');
    normalized = this.expandContractions(normalized);
    normalized = this.fixCommonVoiceErrors(normalized);
    return normalized.trim();
  }

  expandContractions(text) {
    const contractions = {
      'tô': 'estou', 'tá': 'está', 'cê': 'você', 'pra': 'para',
      'pro': 'para o', 'vc': 'você', 'vlw': 'valeu', 'blz': 'beleza'
    };
    let expanded = text;
    for (const [contraction, full] of Object.entries(contractions)) {
      const regex = new RegExp(`\\b${contraction}\\b`, 'gi');
      expanded = expanded.replace(regex, full);
    }
    return expanded;
  }

  fixCommonVoiceErrors(text) {
    const corrections = {
      'cincuenta': 'cinquenta', 'sescenta': 'sessenta', 'pão': 'pau',
      'cinto': 'conto', 'ifi': 'ifood', 'notflix': 'netflix'
    };
    let fixed = text;
    for (const [error, correction] of Object.entries(corrections)) {
      const regex = new RegExp(`\\b${error}\\b`, 'gi');
      fixed = fixed.replace(regex, correction);
    }
    return fixed;
  }

  detectSlangUsage(command) {
    const detected = { money: [], transaction: [], category: [], status: [] };
    const cmd = command.toLowerCase();

    const moneySlang = ['pau', 'conto', 'pila', 'mango', 'prata', 'milão', 'k', 'barão'];
    detected.money = moneySlang.filter(slang => cmd.includes(slang));

    const transactionSlang = ['torrei', 'queimei', 'fritei', 'pingou', 'caiu', 'garimpei'];
    detected.transaction = transactionSlang.filter(slang => cmd.includes(slang));

    const categorySlang = ['rango', 'bóia', 'larica', 'corridinha', 'busão', 'rolê'];
    detected.category = categorySlang.filter(slang => cmd.includes(slang));

    const statusSlang = ['zerei', 'matei', 'já era', 'tô devendo', 'na agulha'];
    detected.status = statusSlang.filter(slang => cmd.includes(slang));

    return detected;
  }

  enhanceWithContext(analysis, context) {
    const enhanced = { ...analysis };

    if (!enhanced.type && this.contextStack.length > 0) {
      const lastContext = this.contextStack[this.contextStack.length - 1];
      if (lastContext.type) {
        enhanced.type = lastContext.type;
        enhanced.contextEnhanced = true;
      }
    }

    if (!enhanced.category && enhanced.description) {
      const categoryResult = findBestCategory(enhanced.description, this.categories);
      if (categoryResult) {
        enhanced.category = this.extractCategoryWithID(enhanced.description);
        enhanced.contextEnhanced = true;
      }
    }

    if (enhanced.amount && !enhanced.type) {
      if (analysis.normalizedCommand.match(/gastei|paguei|comprei|torrei/i)) {
        enhanced.type = 'expense';
        enhanced.contextEnhanced = true;
      } else if (analysis.normalizedCommand.match(/recebi|ganhei|faturei/i)) {
        enhanced.type = 'income';
        enhanced.contextEnhanced = true;
      }
    }

    this.updateContextStack(enhanced);
    return enhanced;
  }

  updateContextStack(analysis) {
    const context = {
      timestamp: new Date(),
      type: analysis.type,
      category: analysis.category?.slug,
      amount: analysis.amount
    };
    this.contextStack.push(context);
    if (this.contextStack.length > 5) {
      this.contextStack.shift();
    }
  }

  learnUserPattern(analysis) {
    if (analysis.confidence > 0.7) {
      const pattern = {
        command: analysis.normalizedCommand,
        type: analysis.type,
        category: analysis.category?.slug,
        timestamp: new Date()
      };
      const hash = this.hashCommand(analysis.normalizedCommand);
      if (!this.userPatterns[hash]) {
        this.userPatterns[hash] = [];
      }
      this.userPatterns[hash].push(pattern);
      if (this.userPatterns[hash].length > 10) {
        this.userPatterns[hash].shift();
      }
    }
  }

  matchUserPattern(command) {
    const hash = this.hashCommand(command);
    const patterns = this.userPatterns[hash];
    if (!patterns || patterns.length === 0) return null;
    return patterns[patterns.length - 1];
  }

  hashCommand(command) {
    const structure = command
      .replace(/\d+/g, 'NUM')
      .replace(/\b(pau|conto|pila|mango|k|milão|barão)\b/g, 'MONEY')
      .replace(/\b(reais?|r\$)\b/g, 'CURRENCY');
    return structure;
  }

  addToHistory(original, normalized) {
    this.conversationHistory.push({
      original,
      normalized,
      timestamp: new Date()
    });
    if (this.conversationHistory.length > 20) {
      this.conversationHistory.shift();
    }
  }

  calculateConfidence(analysis) {
    let confidence = 0;
    const baseWeights = {
      intent: 0.05, type: 0.20, amount: 0.30,
      description: 0.15, date: 0.10, category: 0.15, status: 0.05
    };
    
    if (analysis.intent) confidence += baseWeights.intent;
    if (analysis.type) confidence += baseWeights.type;
    if (analysis.amount) confidence += baseWeights.amount;
    if (analysis.description) confidence += baseWeights.description;
    if (analysis.date) confidence += baseWeights.date;
    if (analysis.category) confidence += baseWeights.category;
    if (analysis.status) confidence += baseWeights.status;

    const totalSlang = Object.values(analysis.slangDetected).reduce((acc, arr) => acc + arr.length, 0);
    if (totalSlang > 0) confidence += 0.05;
    if (analysis.contextEnhanced) confidence += 0.05;
    if (analysis.userPatternMatch) confidence += 0.10;

    return Math.min(confidence, 1.0);
  }

  buildTransactionObject(analysis, context) {
    // CORREÇÃO CRÍTICA: Usa ID correto da categoria
    const categoryId = analysis.category 
      ? String(analysis.category.id || analysis.category._id)
      : null;

    return {
      intent: analysis.intent,
      entities: {
        context: context,
        type: analysis.type,
        amount: analysis.amount,
        description: analysis.description,
        date: analysis.date ? formatISO(analysis.date) : formatISO(new Date()),
        due_date: analysis.date ? formatISO(analysis.date) : formatISO(new Date()),
        status: analysis.status,
        category_id: categoryId,
        category_name: analysis.category?.name || null,
        is_recurring: analysis.recurring?.is_recurring || false,
        recurring_day: analysis.recurring?.recurring_day || null
      },
      originalCommand: analysis.originalCommand,
      confidence: analysis.confidence,
      missing_fields: identifyMissingFields(analysis),
      metadata: {
        slangUsed: analysis.slangDetected,
        contextEnhanced: analysis.contextEnhanced,
        userPatternMatched: !!analysis.userPatternMatch,
        processingTimestamp: new Date().toISOString(),
        categoryName: analysis.metadata?.categoryName,
        transactionReference: analysis.metadata?.transactionReference
      }
    };
  }

  reset() {
    this.conversationHistory = [];
    this.userPatterns = {};
    this.contextStack = [];
  }

  exportLearnedPatterns() {
    return {
      patterns: this.userPatterns,
      exportedAt: new Date().toISOString()
    };
  }

  importLearnedPatterns(data) {
    if (data && data.patterns) {
      this.userPatterns = data.patterns;
    }
  }
}

export default VoiceNLPProcessor;