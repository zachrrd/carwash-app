import { api } from "./api";
import type { CreateVehicle } from "@/types/vehicle";

export const getVehicles = async (
  page: number = 1,
  limit: number = 10,
) => {
  return api.get("/vehicles", {
    params: {
      page,
      limit,
    },
  });
};

export const createVehicle = (data: CreateVehicle) => {
  return api.post("/vehicles", data);
};

export const deleteVehicle = (id: number) => {
  return api.delete(`/vehicles/${id}`);
};

export const updateVehicle = (id: number, data: CreateVehicle) => {
  return api.put(`/vehicles/${id}`, data);
};