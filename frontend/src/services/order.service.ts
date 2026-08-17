import { api } from "./api";
import type { CreateOrder } from "@/types/order";

export const getOrders = async (page = 1, limit = 10) => {
  return api.get("/orders", {
    params: {
      page,
      limit,
    },
  });
};

export const getOrderById = async (id: number) => {
  return api.get(`/orders/${id}`);
};

export const createOrder = (data: CreateOrder) => {
  return api.post("/orders", data);
};

export const updateOrder = (id: number, data: CreateOrder) => {
  return api.put(`/orders/${id}`, data);
};

export const deleteOrder = (id: number) => {
  return api.delete(`/orders/${id}`);
};