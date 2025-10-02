export const identifyMissingFields = (analysis) => {
  const required = ["type", "amount", "description"];
  return required.filter(field => !analysis[field]);
};
