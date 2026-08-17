import { api } from "./api";
import type { CreateCustomer } from "@/types/customer";

export const getCustomers = async (
  page: number = 1,
  limit: number = 10,
) => {
  return api.get("/customers", {
    params: {
      page,
      limit,
    },
  });
};

export const createCustomer = (data: CreateCustomer) => {
  return api.post("/customers", data);
};

export const deleteCustomer = (id: number) => {
  return api.delete(`/customers/${id}`);
};

export const updateCustomer = (id: number, data: CreateCustomer) => {
  return api.put(`/customers/${id}`, data);
};