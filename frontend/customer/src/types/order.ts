import type { Vehicle } from "./vehicle";

export type OrderServiceStatus =
  | "WAITING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED" | "FAILED";

export type PaymentMethod = "CASH" | "TRANSFER" | "QRIS";

export interface ServiceSummary {
  id: number;
  name: string;
  price: string | number;
  duration: number;
  image_url?: string | null;
}

export interface OrderItem {
  id: number;
  order_id: number;
  service_id: number;
  qty: number | null;
  subtotal: string | number;
  services: ServiceSummary;
}

export interface Invoice {
  id: number;
  invoice_no: string;
  order_id: number;
  total_amount: string | number;
  issued_at: string | null;
}

export interface Payment {
  id: number;
  order_id: number;
  amount_received: string | number;
  change_amount: string | number | null;
  payment_method: PaymentMethod;
  payment_date: string | null;
}

export interface CustomerInfo {
  id: number;
  name: string;
  phone: string | null;
}

export interface Order {
  id: number;
  order_date: string | null;
  created_at: string;
  service_status: OrderServiceStatus | null;
  payment_status: PaymentStatus | null;
  customer_id: number;
  vehicle_id: number;
  staff_id: number | null;
  check_in_time: string | null;

  customers?: CustomerInfo;
  vehicles: Vehicle;
  order_items: OrderItem[];
  invoices?: Invoice[];
  payments?: Payment[];
}

export interface CreateOrderItemInput {
  service_id: number;
  qty: number;
}

export interface CreateOrderPayload {
  vehicle_id: number;
  items: CreateOrderItemInput[];
  check_in_time?: string | null;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data: Order;
}

export interface OrdersResponse {
  success: boolean;
  message: string;
  data: Order[];
}
