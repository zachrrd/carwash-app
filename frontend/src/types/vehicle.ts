export interface Vehicle {
  id: number;
  customer_id: number;
  plate_number: string;
  brand: string;
  model: string;
}

export interface CreateVehicle {
  customer_id: number;
  plate_number: string;
  brand: string;
  model: string;
}
