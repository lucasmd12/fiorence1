// ARQUIVO COMPLETO: extractors/CategoryExtractor.js - FIX CRÍTICO
import { contextualKeywords } from '../constants/keywords';
import { categoryKeywords } from '../constants/brazilianSlangDictionary';

const findBestCategoryOriginal = (command, categories) => {
  let bestCategory = null;
  let bestScore = 0;

  for (const categoryType in contextualKeywords) {
    const keywords = contextualKeywords[categoryType];
    const matchCount = keywords.filter(keyword => 
      command.includes(keyword.toLowerCase())
    ).length;
    
    if (matchCount > bestScore) {
      const category = categories.find(cat => 
        cat.name.toLowerCase().includes(categoryType) ||
        cat.slug?.toLowerCase().includes(categoryType)
      );
      
      if (category) {
        bestCategory = category;
        bestScore = matchCount;
      }
    }
  }
  
  return { category: bestCategory, score: bestScore };
};

const calculateDetailedCategoryScore = (command, categoryData) => {
  const cmd = command.toLowerCase();
  let score = 0;
  const matches = {
    brands: [],
    places: [],
    services: [],
    keywords: [],
    slang: []
  };

  if (categoryData.brands) {
    categoryData.brands.forEach(brand => {
      if (cmd.includes(brand.toLowerCase())) {
        score += 10;
        matches.brands.push(brand);
      }
    });
  }

  if (categoryData.places) {
    categoryData.places.forEach(place => {
      if (cmd.includes(place.toLowerCase())) {
        score += 7;
        matches.places.push(place);
      }
    });
  }

  if (categoryData.services) {
    categoryData.services.forEach(service => {
      if (cmd.includes(service.toLowerCase())) {
        score += 7;
        matches.services.push(service);
      }
    });
  }

  if (categoryData.keywords) {
    categoryData.keywords.forEach(keyword => {
      if (cmd.includes(keyword.toLowerCase())) {
        score += 5;
        matches.keywords.push(keyword);
      }
    });
  }

  if (categoryData.slang) {
    categoryData.slang.forEach(slang => {
      if (cmd.includes(slang.toLowerCase())) {
        score += 3;
        matches.slang.push(slang);
      }
    });
  }

  if (categoryData.priority) {
    score *= (categoryData.priority / 10);
  }

  return { score, matches };
};

const normalizeCategoryName = (categoryName) => {
  const normalizations = {
    'alimentacao': ['alimentação', 'comida', 'alimento'],
    'transporte': ['transporte', 'locomoção'],
    'saude': ['saúde', 'médico'],
    'casa': ['casa', 'moradia', 'residência'],
    'assinaturas': ['assinatura', 'streaming'],
    'lazer': ['lazer', 'entretenimento', 'diversão'],
    'trabalho': ['trabalho', 'renda', 'salário'],
    'educacao': ['educação', 'estudo'],
    'vestuario': ['vestuário', 'roupa'],
    'beleza': ['beleza', 'estética']
  };

  const lower = categoryName.toLowerCase();
  for (const [slug, variants] of Object.entries(normalizations)) {
    if (variants.some(v => lower.includes(v))) {
      return slug;
    }
  }
  return categoryName.toLowerCase();
};

// CORREÇÃO CRÍTICA: Retorna objeto completo com IDs corretos
const findCategoryInDatabase = (categorySlug, categories) => {
  if (!categories || categories.length === 0) return null;

  // 1. Busca exata por slug
  let category = categories.find(cat => 
    cat.slug?.toLowerCase() === categorySlug
  );
  if (category) return createCategoryObject(category);

  // 2. Busca por nome normalizado
  category = categories.find(cat =>
    normalizeCategoryName(cat.name) === categorySlug
  );
  if (category) return createCategoryObject(category);

  // 3. Busca parcial no nome
  category = categories.find(cat =>
    cat.name.toLowerCase().includes(categorySlug)
  );
  if (category) return createCategoryObject(category);

  // 4. Busca parcial no slug
  category = categories.find(cat =>
    cat.slug?.toLowerCase().includes(categorySlug)
  );
  if (category) return createCategoryObject(category);

  return null;
};

// NOVA FUNÇÃO: Cria objeto padronizado com ID correto
const createCategoryObject = (category) => {
  if (!category) return null;
  
  return {
    id: category._id || category.id,
    _id: category._id || category.id,
    name: category.name,
    slug: category.slug,
    type: category.type,
    emoji: category.emoji || '📁',
    color: category.color,
    icon: category.icon
  };
};

const calculateBrazilianScore = (command, categories) => {
  const normalizedCommand = command.toLowerCase().trim();
  const categoryScores = {};
  const categoryDetails = {};

  for (const [categorySlug, categoryData] of Object.entries(categoryKeywords)) {
    const result = calculateDetailedCategoryScore(normalizedCommand, categoryData);
    if (result.score > 0) {
      categoryScores[categorySlug] = result.score;
      categoryDetails[categorySlug] = result.matches;
    }
  }

  const sortedCategories = Object.entries(categoryScores)
    .sort((a, b) => b[1] - a[1]);

  for (const [categorySlug, score] of sortedCategories) {
    const category = findCategoryInDatabase(categorySlug, categories);
    if (category) {
      return {
        category,
        score,
        matches: categoryDetails[categorySlug],
        method: 'brazilian_system'
      };
    }
  }

  return null;
};

// FUNÇÃO PRINCIPAL CORRIGIDA: Retorna objeto completo
export const findBestCategory = (command, categories) => {
  if (!command || !categories || categories.length === 0) {
    return null;
  }

  const normalizedCommand = command.toLowerCase().trim();

  // 1. Tenta sistema brasileiro
  const brazilianResult = calculateBrazilianScore(normalizedCommand, categories);
  
  // 2. Tenta sistema original
  const originalResult = findBestCategoryOriginal(normalizedCommand, categories);

  // Se apenas brasileiro encontrou
  if (brazilianResult && !originalResult.category) {
    return brazilianResult.category;
  }

  // Se apenas original encontrou
  if (!brazilianResult && originalResult.category) {
    return createCategoryObject(originalResult.category);
  }
  
  // Se nenhum encontrou - busca categoria "Outros"
  if (!brazilianResult && !originalResult.category) {
    const fallback = categories.find(cat => 
      cat.name.toLowerCase() === 'outros' ||
      cat.slug?.toLowerCase() === 'outros' ||
      cat.name.toLowerCase() === 'other'
    );
    return fallback ? createCategoryObject(fallback) : null;
  }

  // Se ambos encontraram, compara scores
  const brazilianNormalizedScore = brazilianResult.score / 10;
  const originalScore = originalResult.score;

  if (brazilianNormalizedScore > originalScore) {
    return brazilianResult.category;
  } else if (brazilianNormalizedScore < originalScore) {
    return createCategoryObject(originalResult.category);
  } else {
    return brazilianResult.category;
  }
};

export const debugCategoryScores = (command, categories) => {
  const cmd = command.toLowerCase().trim();
  
  const brazilianScores = {};
  for (const [categorySlug, categoryData] of Object.entries(categoryKeywords)) {
    const result = calculateDetailedCategoryScore(cmd, categoryData);
    brazilianScores[categorySlug] = {
      score: result.score,
      matches: result.matches,
      priority: categoryData.priority
    };
  }

  const originalResult = findBestCategoryOriginal(cmd, categories);
  const finalResult = findBestCategory(cmd, categories);

  return {
    command: cmd,
    brazilianSystem: Object.fromEntries(
      Object.entries(brazilianScores)
        .sort((a, b) => b[1].score - a[1].score)
        .slice(0, 5)
    ),
    originalSystem: {
      category: originalResult.category?.name,
      score: originalResult.score
    },
    finalResult: {
      id: finalResult?.id || finalResult?._id,
      category: finalResult?.name,
      slug: finalResult?.slug
    }
  };
};

export const learnNewAssociation = (keyword, categorySlug) => {
  console.log(`[LEARNING] Nova associação: "${keyword}" -> ${categorySlug}`);
  return {
    keyword,
    categorySlug,
    timestamp: new Date().toISOString()
  };
};

export const testHelpers = {
  findBestCategoryOriginal,
  calculateDetailedCategoryScore,
  normalizeCategoryName,
  findCategoryInDatabase,
  calculateBrazilianScore,
  createCategoryObject
};