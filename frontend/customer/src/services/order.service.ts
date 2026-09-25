import api from "./api";
import type {
  Order,
  CreateOrderPayload,
  OrderResponse,
  OrdersResponse,
} from "@/types/order";

export const getMyOrders = async (): Promise<Order[]> => {
  const response = await api.get<OrdersResponse>("/orders/customer/my-orders");
  return response.data.data;
};

export const getOrderById = async (id: number): Promise<Order> => {
  const response = await api.get<OrderResponse>(`/orders/${id}`);
  return response.data.data;
};

export const createOrder = async (
  payload: CreateOrderPayload,
): Promise<Order> => {
  const response = await api.post<OrderResponse>("/orders/customer", payload);
  return response.data.data;
};

export const cancelOrder = async (id: number): Promise<Order> => {
  const response = await api.patch<OrderResponse>(
    `/orders/customer/${id}/cancel`,
  );
  return response.data.data;
};
