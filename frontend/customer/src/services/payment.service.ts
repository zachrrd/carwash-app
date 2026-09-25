import api from "@/services/api";

export interface MidtransPaymentResponse {
  orderId: number;
  midtransOrderId?: string;
  grossAmount: number;
  token: string;
  redirectUrl: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const createMidtransPayment = async (
  orderId: number,
): Promise<MidtransPaymentResponse> => {
  const response = await api.post<ApiResponse<MidtransPaymentResponse>>(
    `/payments/midtrans/${orderId}`,
  );

  return response.data.data;
};

export const verifyMidtransPayment = async (
  orderId: number,
  midtransOrderId?: string,
): Promise<MidtransPaymentResponse> => {
  const response = await api.post<ApiResponse<MidtransPaymentResponse>>(
    `/payments/midtrans/${orderId}/verify`,
    {
      midtrans_order_id: midtransOrderId,
    },
  );

  return response.data.data;
};
