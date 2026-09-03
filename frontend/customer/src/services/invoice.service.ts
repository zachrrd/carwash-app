import api from "@/services/api";

export interface InvoiceService {
  id: number;
  name: string;
  price: number;
}

export interface InvoiceItem {
  id: number;
  qty: number;
  subtotal: number;
  services: InvoiceService;
}

export interface InvoiceCustomer {
  id: number;
  name: string;
}

export interface InvoiceVehicle {
  id: number;
  plate_number: string;
  brand?: string | null;
  model?: string | null;
}

export interface InvoiceStaff {
  id: number;
  name: string;
}

export interface InvoicePayment {
  id: number;
  amount_received: number;
  change_amount: number;
  payment_method: string;
  payment_date: string | null;
}

export interface InvoiceOrder {
  id: number;
  order_date: string | null;
  service_status: string | null;
  payment_status: string | null;
  check_in_time: string | null;
  customers: InvoiceCustomer;
  vehicles: InvoiceVehicle;
  staffs: InvoiceStaff | null;
  order_items: InvoiceItem[];
  payments: InvoicePayment[];
}

export interface Invoice {
  id: number;
  invoice_no: string;
  order_id: number;
  total_amount: number;
  issued_at: string | null;
  orders: InvoiceOrder;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getInvoiceById = async (invoiceId: number): Promise<Invoice> => {
  const response = await api.get<ApiResponse<Invoice>>(
    `/invoices/${invoiceId}`,
  );

  return response.data.data;
};

export const downloadInvoicePdf = async (invoiceId: number): Promise<Blob> => {
  const response = await api.get<Blob>(`/invoices/${invoiceId}/pdf`, {
    responseType: "blob",
  });

  return response.data;
};
