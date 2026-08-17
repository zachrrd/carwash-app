export interface Customer {
  id: number;
  name: string;
  phone: string | null;
}
export interface CreateCustomer {
  name: string;
  phone: string;
}
