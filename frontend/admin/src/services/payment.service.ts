import { api } from "./api";
import type { PaymentMethod } from "@/types/payment";

export const getPayments = (
  page: number = 1,
  limit: number = 10,
) => {
  return api.get("/payments", {
    params: {
      page,
      limit,
    },
  });
};

export const getPaymentByOrder = (orderId: number) => {
  return api.get(`/payments/order/${orderId}`);
};

export interface RevenuePeriod {
  revenue: number;
  count: number;
  monthName?: string;
  year?: number;
}

export interface MonthlyBreakdownItem {
  month: string;
  monthIndex: number;
  revenue: number;
  count: number;
}

export interface PaymentMethodBreakdownItem {
  method: string;
  revenue: number;
  count: number;
}

export interface RevenueSummaryData {
  today: RevenuePeriod;
  month: RevenuePeriod;
  year: RevenuePeriod;
  allTime: RevenuePeriod;
  monthlyBreakdown: MonthlyBreakdownItem[];
  paymentMethodBreakdown: PaymentMethodBreakdownItem[];
}

export const getRevenueSummary = () => {
  return api.get<{
    success: boolean;
    data: RevenueSummaryData;
    message: string;
  }>("/payments/revenue-summary");
};

export const createPayment = (data: {
  order_id: number;
  amount_received: number;
  payment_method: PaymentMethod;
}) => {
  return api.post("/payments", data);
};