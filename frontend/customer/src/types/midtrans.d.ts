interface MidtransResult {
  order_id?: string;
  transaction_status?: string;
  transaction_id?: string;
  gross_amount?: string;
  payment_type?: string;
  status_code?: string;
  [key: string]: unknown;
}

interface MidtransSnapOptions {
  onSuccess?: (result: MidtransResult) => void | Promise<void>;
  onPending?: (result: MidtransResult) => void | Promise<void>;
  onError?: (result: MidtransResult) => void | Promise<void>;
  onClose?: () => void | Promise<void>;
}

interface MidtransSnap {
  pay: (token: string, options?: MidtransSnapOptions) => void;
}

interface Window {
  snap?: MidtransSnap;
}
