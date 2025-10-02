export const validateAmount = (amount, context) => {
  if (!amount || amount <= 0) return false;
  
  if ((context.includes("mil") || context.includes("thousand")) && amount < 1000) {
    console.warn("⚠️ Valor suspeito detectado - contexto indica milhares mas valor é baixo");
    return false;
  }
  
  if (amount > 999999999999999) {  // Mais de 999 trilhões
    console.warn("⚠️ Valor muito alto - pode ser erro");
    return false;
  }
  
  return true;
};
