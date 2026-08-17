import { api } from "./api";
import type { CreateStaff } from "@/types/staff";

export const getStaffs = (
  page: number = 1,
  limit: number = 10,
) => {
  return api.get("/staffs", {
    params: {
      page,
      limit,
    },
  });
};

export const createStaff = (data: CreateStaff) => {
  return api.post("/staffs", data);
};

export const deleteStaff = (id: number) => {
  return api.delete(`/staffs/${id}`);
};

export const updateStaff = (id: number, data: CreateStaff) => {
  return api.put(`/staffs/${id}`, data);
};
