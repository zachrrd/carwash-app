import { api } from "@/services/api";

export const getInvoiceById = (id: number) => {
  return api.get(`/invoices/${id}`);
};
