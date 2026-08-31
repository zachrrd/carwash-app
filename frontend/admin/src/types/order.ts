export type OrderStatus =
  | "WAITING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentStatus = "UNPAID" | "PAID";

export interface OrderItem {
  id: number;
  service_id: number;
  qty: number;
  subtotal: number | string;

  services?: {
    id: number;
    name: string;
    price: number | string;
  } | null;
}

export interface Invoice {
  id: number;
  invoice_no: string;
  order_id: number;
  total_amount: number | string;
  issued_at: string | null;
}

export interface Order {
  id: number;
  order_date: string | null;
  created_at: string | null;

  service_status: OrderStatus | null;
  payment_status: PaymentStatus | null;

  customer_id: number;
  vehicle_id: number;
  staff_id: number | null;

  check_in_time: string | null;

  customers?: {
    id: number;
    name: string;
    phone: string | null;
  } | null;

  vehicles?: {
    id: number;
    plate_number: string;
    brand: string;
    model: string;
  } | null;

  staffs?: {
    id: number;
    name: string;
  } | null;

  order_items?: OrderItem[];

  invoices?: Invoice[];

  payments?: unknown[];
}

export interface CreateOrder {
  customer_id: number;
  vehicle_id: number;
  staff_id: number | null;
  check_in_time: string | null;

  items: {
    service_id: number;
    qty: number;
  }[];
}

export interface UpdateOrder {
  customer_id: number;
  vehicle_id: number;
  staff_id: number | null;
  check_in_time: string | null;

  items: {
    service_id: number;
    qty: number;
  }[];
}

export interface UpdateOrderStatus {
  service_status: OrderStatus;
}

export interface OrderPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetOrdersResponse {
  orders: Order[];
  pagination: OrderPagination;
}