import { api } from "./api";

import type {
  CreateOrder,
  UpdateOrder,
  UpdateOrderStatus,
  GetOrdersResponse,
  Order,
} from "@/types/order";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getOrders = (page = 1, limit = 10) => {
  return api.get<ApiResponse<GetOrdersResponse>>("/orders", {
    params: { page, limit },
  });
};

export const getOrderById = (id: number) => {
  return api.get<ApiResponse<Order>>(`/orders/${id}`);
};

export const createOrder = (data: CreateOrder) => {
  return api.post<ApiResponse<Order>>("/orders", data);
};

export const updateOrder = (id: number, data: UpdateOrder) => {
  return api.put<ApiResponse<Order>>(`/orders/${id}`, data);
};

export const updateOrderStatus = (id: number, data: UpdateOrderStatus) => {
  return api.patch(`/orders/${id}/status`, data);
};

export const cancelOrder = (id: number) => {
  return api.patch<ApiResponse<Order>>(`/orders/${id}/cancel`);
};

export const completeOrder = (id: number) => {
  return api.patch<ApiResponse<Order>>(`/orders/${id}/complete`);
};
export const deleteOrder = (id: number) => {
  return api.delete<ApiResponse<null>>(`/orders/${id}`);
};
