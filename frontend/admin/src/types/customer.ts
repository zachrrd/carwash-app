export interface CustomerUser {
  name: string;
  email: string;
}

export interface Customer {
  id: number;
  name: string;
  phone: string | null;
  user_id: number | null;
  user: CustomerUser | null;
}

export interface CreateCustomer {
  name: string;
  phone: string;
}

export interface CreateCustomerAccount {
  email: string;
  password: string;
}

export interface CustomerPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetCustomersResponse {
  customers: Customer[];
  pagination: CustomerPagination;
}