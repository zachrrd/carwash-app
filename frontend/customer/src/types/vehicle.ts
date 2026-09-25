export interface Vehicle {
  id: number;
  plate_number: string;
  brand: string;
  model: string;
  customer_id: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface CreateVehiclePayload {
  plate_number: string;
  brand: string;
  model: string;
}

export interface VehicleResponse {
  success: boolean;
  message: string;
  data: Vehicle;
}

export interface VehiclesResponse {
  success: boolean;
  message: string;
  data: Vehicle[];
}
