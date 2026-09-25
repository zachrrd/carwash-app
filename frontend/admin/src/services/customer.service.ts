import { api } from "./api";
import type {
  CreateCustomer,
  GetCustomersResponse,
  Customer,
  CreateCustomerAccount,
} from "@/types/customer";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getCustomers = async (
  page: number = 1,
  limit: number = 10,
) => {
  return api.get<ApiResponse<GetCustomersResponse>>("/customers", {
    params: {
      page,
      limit,
    },
  });
};

export const getDeletedCustomers = async () => {
  return api.get<ApiResponse<Customer[]>>("/customers/trash/list");
};

export const createCustomer = (data: CreateCustomer) => {
  return api.post("/customers", data);
};

export const updateCustomer = (id: number, data: CreateCustomer) => {
  return api.put(`/customers/${id}`, data);
};

export const deleteCustomer = (id: number) => {
  return api.delete(`/customers/${id}`);
};

export const restoreCustomer = (id: number) => {
  return api.patch(`/customers/${id}/restore`);
};

export const createCustomerAccount = (
  id: number,
  data: CreateCustomerAccount,
) => {
  return api.post(`/customers/${id}/account`, data);
};