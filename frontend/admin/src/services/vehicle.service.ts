import { api } from "./api";
import type {
  CreateVehicle,
  UpdateVehicle,
  GetVehiclesResponse,
} from "@/types/vehicle";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getVehicles = (page = 1, limit = 10) => {
  return api.get<ApiResponse<GetVehiclesResponse>>("/vehicles", {
    params: {
      page,
      limit,
    },
  });
};

export const getVehicleById = (id: number) => {
  return api.get(`/vehicles/${id}`);
};

export const createVehicle = (data: CreateVehicle) => {
  return api.post("/vehicles", data);
};

export const updateVehicle = (id: number, data: UpdateVehicle) => {
  return api.put(`/vehicles/${id}`, data);
};

export const deleteVehicle = (id: number) => {
  return api.delete(`/vehicles/${id}`);
};

export const getDeletedVehicles = () => {
  return api.get("/vehicles/trash/list");
};

export const restoreVehicle = (id: number) => {
  return api.patch(`/vehicles/${id}/restore`);
};