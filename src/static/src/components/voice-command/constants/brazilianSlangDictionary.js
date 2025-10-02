// ============================================
// DICIONÁRIO BRASILEIRO DE GÍRIAS FINANCEIRAS
// ============================================

// 💰 GÍRIAS DE DINHEIRO (para AmountExtractor)
export const moneySlang = {
  // Unidades básicas (equivalem a R$ 1,00)
  basicUnits: {
    'conto': 1,
    'contos': 1,
    'pau': 1,
    'paus': 1,
    'pila': 1,
    'pilas': 1,
    'mango': 1,
    'mangos': 1,
    'prata': 1,
    'pratas': 1,
    'grana': 1,
    'real': 1,
    'reais': 1,
    'dinheiro': 1,
    'dindin': 1
  },

  // Multiplicadores grandes
  bigMultipliers: {
    'milão': 1000,
    'milhão': 1000000,
    'milhões': 1000000,
    'bilhão': 1000000000,
    'bilhões': 1000000000,
    'barão': 1000, // "um barão" = R$ 1.000
    'barões': 1000,
    'k': 1000,
    'mil': 1000
  },

  // Valores específicos (notas do Real)
  specificNotes: {
    'uma nota': 100,
    'um toco': 100,
    'uma onça': 50, // Nota de R$ 50 (tem uma onça-pintada)
    'um peixe': 100, // Nota de R$ 100 (tem uma garoupa)
    'uma arara': 10, // Nota de R$ 10 (tem uma arara)
    'um beija-flor': 1, // Moeda de R$ 1
    'cinquentão': 50,
    'cinquenta': 50,
    'vintão': 20,
    'dez paus': 10,
    'cinco paus': 5
  },

  // Frações e parciais
  fractions: {
    'meio': 0.5,
    'metade': 0.5,
    'meia': 0.5,
    'um quarto': 0.25,
    'três quartos': 0.75,
    'dois terços': 0.666
  }
};

// 🎯 PADRÕES DE TRANSAÇÃO (para TransactionTypeExtractor)
export const transactionPatterns = {
  expense: {
    // Peso 10 - Indicadores fortíssimos de despesa
    strongVerbs: [
      'gastei', 'torrei', 'queimei', 'paguei', 'comprei', 'adquiri',
      'contratei', 'assinei', 'renovei', 'deixei', 'dei', 'mandei'
    ],

    // Peso 8 - Verbos médios
    mediumVerbs: [
      'foi', 'custou', 'saiu', 'ficou', 'deu', 'passei', 'fiz',
      'usei', 'investi', 'apliquei', 'coloquei'
    ],

    // Peso 6 - Substantivos que indicam despesa
    nouns: [
      'despesa', 'gasto', 'compra', 'pagamento', 'conta', 'boleto',
      'fatura', 'parcela', 'prestação', 'mensalidade', 'anuidade'
    ],

    // Peso 5 - Expressões coloquiais
    slangExpressions: [
      'levei um tombo', 'tomei uma facada', 'levou uma paulada',
      'deu um preju', 'foi um rombo', 'arrombou o bolso',
      'sangrou', 'foi salgado', 'pesou no bolso', 'estourei',
      'varei', 'fritei', 'derreti', 'evaporou'
    ],

    // Peso 4 - Métodos de pagamento
    paymentMethods: [
      'no crédito', 'no débito', 'no pix', 'via pix', 'transferi',
      'doc', 'ted', 'boleto', 'dinheiro', 'espécie', 'parcelado',
      'à vista', 'cartão', 'no cartão'
    ],

    // Peso 3 - Contextos de despesa
    contexts: [
      'em', 'no', 'na', 'pra', 'para', 'com', 'de', 'do', 'da'
    ]
  },

  income: {
    // Peso 10 - Indicadores fortíssimos de receita
    strongVerbs: [
      'recebi', 'ganhei', 'faturei', 'embolsei', 'lucrei', 'arrecadei',
      'resgatei', 'saquei', 'entrou', 'caiu', 'pingou', 'creditaram'
    ],

    // Peso 8 - Verbos médios
    mediumVerbs: [
      'levantei', 'fiz', 'tirei', 'consegui', 'obtive', 'juntei',
      'acumulei', 'somei'
    ],

    // Peso 6 - Substantivos de receita
    nouns: [
      'receita', 'ganho', 'lucro', 'renda', 'entrada', 'crédito',
      'rendimento', 'proventos', 'honorários', 'cachê'
    ],

    // Peso 5 - Expressões coloquiais
    slangExpressions: [
      'fiz uma grana', 'fiz um dinheiro', 'levantei uma bolada',
      'garimpei', 'caiu uma graninha', 'entrou uma bufunfa',
      'veio um troco', 'rendeu', 'deu lucro', 'fiz caixa'
    ],

    // Peso 4 - Tipos de receita
    incomeTypes: [
      'salário', 'cachê', 'freelance', 'bico', 'freela', 'projeto',
      'venda', 'comissão', 'bônus', 'adiantamento', 'vale',
      'décimo terceiro', '13º', 'férias', 'dividendos', 'juros'
    ],

    // Peso 3 - Métodos de recebimento
    receivingMethods: [
      'via pix', 'por pix', 'transferência', 'depósito', 'ted', 'doc',
      'na conta', 'em espécie', 'dinheiro'
    ]
  }
};

// 🏷️ CATEGORIAS EXPANDIDAS (para CategoryExtractor)
export const categoryKeywords = {
  alimentacao: {
    priority: 10, // Quanto maior, mais peso
    
    brands: [
      'ifood', 'rappi', 'uber eats', 'zé delivery', 'james delivery',
      'mcdonalds', 'bk', 'burger king', "bob's", 'subway', 'dominos',
      'pizza hut', 'spoleto', 'gendai', 'china in box', 'outback',
      'giraffas', 'habib', 'burguer king'
    ],
    
    places: [
      'restaurante', 'padaria', 'mercado', 'supermercado', 'açougue',
      'feira', 'quitanda', 'hortifruti', 'sacolão', 'empório',
      'lanchonete', 'boteco', 'bar', 'pizzaria', 'sorveteria',
      'cafeteria', 'café', 'confeitaria', 'doceria'
    ],
    
    keywords: [
      'comida', 'almoço', 'almoçar', 'jantar', 'janta', 'jantei',
      'café da manhã', 'cafezinho', 'lanche', 'lanchinho', 'merenda',
      'pizza', 'hambúrguer', 'burger', 'x-burger', 'xis', 'sanduíche',
      'salgado', 'pastel', 'coxinha', 'esfirra', 'açaí', 'sorvete'
    ],
    
    slang: [
      'rango', 'rangu', 'bóia', 'larica', 'come', 'comê', 'papou',
      'mandei ver', 'petiscou', 'beliscou'
    ]
  },

  transporte: {
    priority: 9,
    
    brands: [
      'uber', '99', '99 pop', 'cabify', 'lady driver', 'buser',
      'blablacar', 'waze carpool', 'shell', 'petrobras', 'ipiranga',
      'ale', 'br'
    ],
    
    services: [
      'taxi', 'táxi', 'ônibus', 'busão', 'metrô', 'metro', 'trem',
      'brt', 'vlt', 'bilhete único', 'uber', 'aplicativo',
      'estacionamento', 'pedágio', 'lavagem', 'mecânico'
    ],
    
    keywords: [
      'combustível', 'gasolina', 'gasosa', 'etanol', 'álcool', 'diesel',
      'gás', 'gnv', 'abasteci', 'abastecer', 'enchi o tanque',
      'corrida', 'viagem', 'deslocamento', 'frete', 'mudança'
    ],
    
    slang: [
      'corridinha', 'uber', 'busão', 'metrô', 'gasosa', 'álcool',
      'abastecida', 'tanque cheio'
    ]
  },

  saude: {
    priority: 10,
    
    places: [
      'hospital', 'clínica', 'consultório', 'posto de saúde', 'upa',
      'pronto socorro', 'ps', 'farmácia', 'drogaria', 'laboratório',
      'dentista', 'oftalmologista', 'dermatologista'
    ],
    
    keywords: [
      'médico', 'doutor', 'consulta', 'exame', 'raio-x', 'ultrassom',
      'tomografia', 'ressonância', 'cirurgia', 'procedimento',
      'remédio', 'medicamento', 'vacina', 'injeção', 'tratamento',
      'terapia', 'sessão', 'fisioterapia', 'psicólogo', 'terapeuta'
    ],
    
    brands: [
      'unimed', 'amil', 'bradesco saúde', 'sulamerica', 'notredame',
      'hapvida', 'samp', 'golden cross', 'drogasil', 'pacheco',
      'droga raia', 'pague menos', 'panvel', 'extrafarma', 'venancio'
    ],
    
    slang: [
      'plano de saúde', 'convênio', 'médico particular'
    ]
  },

  casa: {
    priority: 8,
    
    keywords: [
      'aluguel', 'locação', 'luz', 'energia', 'elétrica', 'conta de luz',
      'água', 'esgoto', 'saneamento', 'conta de água', 'internet',
      'net', 'wi-fi', 'wifi', 'banda larga', 'telefone', 'celular',
      'linha', 'condomínio', 'taxa condominial', 'iptu', 'imposto',
      'gás', 'botijão', 'móveis', 'eletrodoméstico', 'reforma',
      'manutenção', 'conserto', 'pintura', 'encanador', 'eletricista'
    ],
    
    brands: [
      'enel', 'light', 'cemig', 'celpe', 'copel', 'sabesp', 'cedae',
      'caesb', 'sanepar', 'vivo', 'claro', 'tim', 'oi', 'net',
      'sky', 'directv', 'ultragaz', 'liquigás', 'copagaz'
    ],
    
    slang: [
      'a luz', 'a água', 'a net', 'o condomínio'
    ]
  },

  assinaturas: {
    priority: 7,
    
    brands: [
      'netflix', 'amazon prime', 'prime video', 'disney plus', 'disney+',
      'hbo max', 'paramount plus', 'paramount+', 'apple tv', 'globoplay',
      'spotify', 'deezer', 'youtube premium', 'youtube music',
      'amazon music', 'apple music', 'tidal', 'google one',
      'icloud', 'dropbox', 'onedrive', 'adobe', 'canva', 'notion',
      'evernote', 'microsoft 365', 'office 365', 'ps plus', 'xbox live'
    ],
    
    keywords: [
      'streaming', 'assinatura', 'mensalidade', 'plano', 'pacote',
      'serviço', 'aplicativo', 'app', 'renovação', 'premium',
      'plus', 'pro', 'anual', 'mensal'
    ],
    
    slang: [
      'meu netflix', 'meu spotify', 'a netflix', 'o spotify'
    ]
  },

  lazer: {
    priority: 6,
    
    keywords: [
      'cinema', 'filme', 'ingresso', 'teatro', 'show', 'festa',
      'balada', 'show', 'festival', 'evento', 'parque', 'diversão',
      'passeio', 'viagem', 'turismo', 'hotel', 'pousada', 'airbnb',
      'hospedagem', 'parque', 'zoológico', 'museu', 'exposição'
    ],
    
    slang: [
      'rolê', 'role', 'saída', 'cineminha', 'bailão', 'festinha'
    ]
  },

  trabalho: {
    priority: 9,
    
    keywords: [
      'salário', 'salario', 'ordenado', 'vencimento', 'pagamento',
      'freelance', 'freela', 'bico', 'projeto', 'serviço', 'job',
      'trabalho', 'consulta', 'consultoria', 'honorário', 'honorarios',
      'cachê', 'cache', 'comissão', 'comissao', 'bônus', 'bonus',
      'gratificação', 'vale', 'adiantamento', 'décimo terceiro',
      '13º', 'férias', 'participação nos lucros', 'plr'
    ],
    
    slang: [
      'trampo', 'grana do trampo', 'pagamento', 'salário do mês'
    ]
  },

  educacao: {
    priority: 7,
    
    keywords: [
      'escola', 'colégio', 'faculdade', 'universidade', 'curso',
      'mensalidade escolar', 'matrícula', 'material escolar',
      'livros', 'apostila', 'uniforme', 'transporte escolar',
      'aula particular', 'professor', 'reforço', 'cursinho',
      'pré-vestibular', 'idiomas', 'inglês', 'espanhol'
    ],
    
    brands: [
      'kumon', 'wizard', 'ccaa', 'cultura inglesa', 'fisk',
      'skill', 'udemy', 'coursera', 'alura', 'rocketseat'
    ]
  },

  vestuario: {
    priority: 5,
    
    keywords: [
      'roupa', 'calça', 'camisa', 'camiseta', 'blusa', 'vestido',
      'short', 'bermuda', 'sapato', 'tênis', 'sandália', 'chinelo',
      'bota', 'meia', 'cueca', 'calcinha', 'sutiã', 'lingerie',
      'jaqueta', 'casaco', 'moletom', 'blusa', 'polo'
    ],
    
    brands: [
      'zara', 'renner', 'c&a', 'riachuelo', 'marisa', 'pernambucanas',
      'lojas americanas', 'magazine luiza', 'nike', 'adidas',
      'puma', 'farm', 'shoulder', 'reserva', 'aramis'
    ],
    
    slang: [
      'look', 'fit', 'outfit', 'peça', 'trampo'
    ]
  },

  beleza: {
    priority: 5,
    
    keywords: [
      'salão', 'cabeleireiro', 'barbeiro', 'manicure', 'pedicure',
      'depilação', 'sobrancelha', 'massagem', 'spa', 'estética',
      'maquiagem', 'perfume', 'cosmético', 'shampoo', 'condicionador',
      'creme', 'hidratante', 'protetor solar'
    ],
    
    slang: [
      'cabelo', 'unha', 'pelos', 'make'
    ]
  }
};

// 📊 STATUS DE PAGAMENTO (para StatusExtractor)
export const paymentStatus = {
  paid: {
    verbs: [
      'paguei', 'quitei', 'resolvi', 'acertei', 'liquidei', 'saldei',
      'finalizei', 'fechei', 'zerei', 'matei', 'encerrei'
    ],
    
    expressions: [
      'já pago', 'já foi', 'tá pago', 'está pago', 'pago',
      'já era', 'resolvido', 'quitado', 'liquidado', 'zerado',
      'fechado', 'finalizado'
    ]
  },
  
  pending: {
    verbs: [
      'preciso pagar', 'tenho que pagar', 'devo', 'falta pagar',
      'ainda não paguei', 'esqueci de pagar', 'vence', 'tô devendo'
    ],
    
    expressions: [
      'pendente', 'em aberto', 'a pagar', 'pra pagar', 'para pagar',
      'não pago', 'ainda não', 'tá devendo', 'está devendo',
      'na agulha', 'atrasado', 'vencido', 'vence hoje', 'vence amanhã'
    ]
  }
};

export default {
  moneySlang,
  transactionPatterns,
  categoryKeywords,
  paymentStatus
};