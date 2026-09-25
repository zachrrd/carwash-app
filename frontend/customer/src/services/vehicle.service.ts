import api from "@/services/api";
import type {
  Vehicle,
  CreateVehiclePayload,
  VehiclesResponse,
  VehicleResponse,
} from "@/types/vehicle";

export const getMyVehicles = async (): Promise<Vehicle[]> => {
  const response = await api.get<VehiclesResponse>("/vehicles/my");
  return response.data.data;
};

export const createMyVehicle = async (
  payload: CreateVehiclePayload,
): Promise<Vehicle> => {
  const response = await api.post<VehicleResponse>("/vehicles/my", payload);
  return response.data.data;
};

export const deleteMyVehicle = async (id: number): Promise<void> => {
  await api.delete(`/vehicles/my/${id}`);
};
