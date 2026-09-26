import api from "./api";

import type {
  Order,
  CreateOrderPayload,
  OrderResponse,
  OrdersResponse,
} from "@/types/order";

export interface ActiveOrder {
  id: number;
  service_status: Order["service_status"];
  payment_status: Order["payment_status"];
  check_in_time: string | null;
  created_at: string;
  vehicles: {
    id: number;
    plate_number: string;
    brand: string;
    model: string;
  } | null;
}

interface ActiveOrderResponse {
  data: ActiveOrder | null;
  message: string;
}

export const getMyOrders = async (): Promise<Order[]> => {
  const response = await api.get<OrdersResponse>(
    "/orders/customer/my-orders",
  );

  return response.data.data;
};

export const getActiveOrder = async (): Promise<ActiveOrder | null> => {
  const response = await api.get<ActiveOrderResponse>(
    "/orders/customer/active",
  );

  return response.data.data;
};

export const getOrderById = async (id: number): Promise<Order> => {
  const response = await api.get<OrderResponse>(`/orders/${id}`);

  return response.data.data;
};

export const createOrder = async (
  payload: CreateOrderPayload,
): Promise<Order> => {
  const response = await api.post<OrderResponse>(
    "/orders/customer",
    payload,
  );

  return response.data.data;
};

export const cancelOrder = async (id: number): Promise<Order> => {
  const response = await api.patch<OrderResponse>(
    `/orders/customer/${id}/cancel`,
  );

  return response.data.data;
};