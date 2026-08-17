import { api } from "./api";
import type { CreateService } from "@/types/service";

export const getService = async (page = 1, limit = 10) => {
  return api.get("/services", {
    params: {
      page,
      limit,
    },
  });
};

export const createService = (data: CreateService) => {
  return api.post("/services", data);
};

export const deleteService = (id: number) => {
  return api.delete(`/services/${id}`);
};

export const updateService = (id: number, data: CreateService) => {
  return api.put(`/services/${id}`, data);
};
