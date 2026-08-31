import { api } from "./api";
import type { CreateStaff, UpdateStaff, GetStaffsResponse } from "@/types/staff";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getStaffs = (page: number = 1, limit: number = 10) => {
  return api.get<ApiResponse<GetStaffsResponse>>("/staffs", {
    params: { page, limit },
  });
};

export const getStaffById = (id: number) => {
  return api.get(`/staffs/${id}`);
};

export const createStaff = (data: CreateStaff) => {
  return api.post("/staffs", data);
};

export const updateStaff = (id: number, data: UpdateStaff) => {
  return api.put(`/staffs/${id}`, data);
};

export const deleteStaff = (id: number) => {
  return api.delete(`/staffs/${id}`);
};

export const restoreStaff = (id: number) => {
  return api.patch(`/staffs/${id}/restore`);
};

export const getDeletedStaffs = () => {
  return api.get("/staffs/trash/list");
};
