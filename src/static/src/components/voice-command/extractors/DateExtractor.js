export const extractDate = (command) => {
  const today = new Date();
  
  if (/hoje|agora/i.test(command)) {
    return today;
  }
  
  if (/ontem/i.test(command)) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  }
  
  if (/amanhã|amanha/i.test(command)) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }
  
  return today;
};
