import { get, post } from "../../../lib/apiClient";

export const fetchCategories = async (context) => {
  const data = await get(`/categories?context=${context}`);
  return data;
};

export const createTransaction = async (transactionData) => {
  await post("/transactions", transactionData);
};
