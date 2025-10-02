export const formatISO = (date) => date.toISOString().split("T")[0];
export const formatBR = (date) => date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
