export interface OrderItem {
  id: number;
  service_id: number;
  qty: number;
  subtotal: number;

  services?: {
    id: number;
    name: string;
    price: number;
  };
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
  service_status: string | null;
  payment_status: string | null;
  customer_id: number;
  vehicle_id: number;
  staff_id: number | null;
  check_in_time: string | null;

  customers?: {
    id: number;
    name: string;
    phone: string | null;
  };

  vehicles?: {
    id: number;
    plate_number: string;
    brand: string;
    model: string;
  };

  staffs?: {
    id: number;
    name: string;
  } | null;

  order_items?: OrderItem[];

  invoices?: Invoice[];
}

export interface CreateOrder {
  customer_id: number;
  vehicle_id: number;
  staff_id: number | null;
  service_status: string;
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
  service_status: string;
  check_in_time: string | null;

  items: {
    service_id: number;
    qty: number;
  }[];
}