// ============================================
// PATTERNS.JS - VERSÃO INTEGRADA
// Mantém padrões antigos + adiciona brasileiros
// ============================================

// 🎯 PADRÕES DE INTENÇÃO (mantidos do original)
export const intentPatterns = {
  schedule_transaction: [
    /agendar|agende|programar|todo (dia|mês|ano)|mensal|semanal|anual|recorrente/i,
    /repetir|automático|fixo|sempre/i
  ],
  create_transaction: [
    /pagar|paguei|despesa|gasto|receita|receber|recebi|entrada|saída/i
  ]
};

// 💰 PADRÕES DE TIPO DE TRANSAÇÃO (expandidos)
export const typePatterns = {
  expense: [
    // Padrões originais (mantidos)
    /despesa|gasto|pagar|paguei|saída|débito|conta|boleto/i,
    /comprar|comprei|gastei|perdi/i,
    
    // ⭐ NOVOS: Gírias brasileiras de despesa
    /torrei|queimei|deixei|fritei|varei|derreti|estourei/i,
    /levei (um )?tombo|levou (uma )?paulada|tomei (uma )?facada/i,
    /deu (um )?preju|foi (um )?rombo|arrombou o bolso|sangrou|pesou no bolso/i,
    /no crédito|no débito|via pix|transferi|doc|ted/i,
    /foi salgado|foi caro|custou caro/i
  ],
  
  income: [
    // Padrões originais (mantidos)
    /receita|entrada|receber|recebi|crédito|ganho|salário/i,
    /vender|vendi|lucro|rendimento/i,
    
    // ⭐ NOVOS: Gírias brasileiras de receita
    /faturei|embolsei|lucrei|arrecadei|resgatei|saquei/i,
    /caiu|pingou|creditaram|entrou (na conta)?/i,
    /fiz (uma )?grana|levantei (uma )?bolada|garimpei/i,
    /cachê|freelance|freela|bico|comissão|bônus/i,
    /décimo terceiro|13º|férias|vale|adiantamento/i
  ]
};

// 📊 PADRÕES DE STATUS (expandidos)
export const statusPatterns = {
  paid: [
    // Padrões originais (mantidos)
    /paguei|pago|quitei|quitado|já paguei|paga|recebi|recebido/i,
    
    // ⭐ NOVOS: Expressões brasileiras de "pago"
    /resolvi|acertei|liquidei|saldei|finalizei|fechei/i,
    /zerei|matei (a conta)?|já era|tá pago|está pago/i,
    /já foi|resolvido|encerrei/i
  ],
  
  pending: [
    // Padrões originais (mantidos)
    /vou pagar|preciso pagar|devo|pendente|em aberto/i,
    
    // ⭐ NOVOS: Expressões brasileiras de "pendente"
    /tenho que pagar|falta pagar|ainda não paguei|esqueci de pagar/i,
    /tô devendo|tá devendo|está devendo|na agulha/i,
    /a pagar|pra pagar|para pagar|não pago/i,
    /vence (hoje|amanhã|essa semana)?|vencido|atrasado/i
  ]
};

// 🎨 PADRÕES DE CATEGORIA (para compatibilidade)
export const categoryPatterns = {
  alimentacao: [
    /comida|almoço|jantar|café|lanche|restaurante|padaria|mercado|supermercado/i,
    /ifood|rappi|delivery|pizza|hambúrguer|rango|bóia|larica/i,
    /mcdonalds|bk|burger king|habib|subway/i
  ],
  
  transporte: [
    /uber|99|taxi|ônibus|metrô|combustível|gasolina|álcool/i,
    /posto|estacionamento|pedágio|mecânico|corridinha|busão|gasosa/i,
    /buser|blablacar|corrida|viagem|abasteci/i
  ],
  
  saude: [
    /médico|farmácia|remédio|medicamento|hospital|consulta/i,
    /plano de saúde|dentista|exame|laboratório|convênio/i,
    /drogasil|pacheco|unimed|amil/i
  ],
  
  casa: [
    /aluguel|luz|energia|água|internet|telefone|celular|condomínio|iptu/i,
    /móveis|decoração|limpeza|a luz|a água|a net/i,
    /enel|light|sabesp|vivo|claro|tim|oi/i
  ],
  
  assinaturas: [
    /netflix|spotify|amazon prime|disney|hbo|youtube premium/i,
    /streaming|assinatura|mensalidade|plano|renovação/i,
    /apple tv|globoplay|paramount/i
  ],
  
  lazer: [
    /cinema|filme|ingresso|teatro|show|festa|balada|passeio|viagem/i,
    /hotel|airbnb|parque|rolê|role|cineminha|bailão/i
  ],
  
  trabalho: [
    /salário|freelance|freela|bico|projeto|serviço|consultoria/i,
    /honorário|cachê|comissão|bônus|vale|trampo/i
  ],
  
  educacao: [
    /escola|faculdade|curso|mensalidade|matrícula|livros|apostila/i,
    /cursinho|idiomas|inglês|professor|aula/i
  ],
  
  vestuario: [
    /roupa|calça|camisa|camiseta|vestido|sapato|tênis/i,
    /zara|renner|c&a|nike|adidas|look|fit/i
  ],
  
  beleza: [
    /salão|cabeleireiro|barbeiro|manicure|depilação|maquiagem/i,
    /cabelo|unha|make|spa|massagem/i
  ]
};

// 🔢 PADRÕES DE VALORES (para detecção)
export const amountPatterns = {
  digital: [
    /r\$\s*\d+(?:[.,]\d+)?/i,
    /\d+(?:[.,]\d+)?\s*(?:reais?|mil|milhão|milhões|k)/i
  ],
  
  slang: [
    /\d+\s*(?:pau|paus|conto|contos|pila|pilas|mango|mangos|prata)/i,
    /(?:um|uma|dois|duas|três|meio|meia)\s*(?:milão|barão|k)/i,
    /(?:uma onça|um peixe|um toco|cinquentão|vintão)/i
  ],
  
  written: [
    /(?:um|dois|três|quatro|cinco|dez|vinte|trinta|cinquenta|cem|mil)\s+(?:reais?|mil)?/i
  ]
};

// 📅 PADRÕES DE DATA (mantidos para compatibilidade)
export const datePatterns = {
  relative: [
    /hoje|agora|ontem|amanhã|depois de amanhã|anteontem/i,
    /essa semana|semana passada|próxima semana|semana que vem/i,
    /esse mês|mês passado|próximo mês|mês que vem/i
  ],
  
  absolute: [
    /\d{1,2}\/\d{1,2}\/\d{2,4}/,
    /\d{1,2} de (janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)/i,
    /dia \d{1,2}/i
  ]
};

// 🔄 PADRÕES DE RECORRÊNCIA (mantidos)
export const recurringPatterns = {
  frequency: [
    /todo (dia|dia útil|semana|mês|ano)/i,
    /diário|semanal|mensal|anual|bimestral|trimestral|semestral/i,
    /a cada \d+ (dia|semana|mês|ano)s?/i
  ],
  
  duration: [
    /por \d+ (mês|meses|ano|anos)/i,
    /durante \d+ (mês|meses|ano|anos)/i,
    /até (quando|o dia)/i
  ]
};

export default {
  intentPatterns,
  typePatterns,
  statusPatterns,
  categoryPatterns,
  amountPatterns,
  datePatterns,
  recurringPatterns
};