export interface VehicleCustomer {
id: number;
name: string;
phone: string | null;
}

export interface Vehicle {
id: number;
customer_id: number;
plate_number: string;
brand: string;
model: string;
deleted_at?: string | null;
customers?: VehicleCustomer | null;
}

export interface VehiclePayload {
customer_id: number;
plate_number: string;
brand: string;
model: string;
}

export type CreateVehicle = VehiclePayload;
export type UpdateVehicle = VehiclePayload;

export interface VehiclePagination {
page: number;
limit: number;
total: number;
totalPages: number;
}

export interface GetVehiclesResponse {
vehicles: Vehicle[];
pagination: VehiclePagination;
}

export interface ApiResponse<T> {
success: boolean;
message: string;
data: T;
}
