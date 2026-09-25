import { api } from "./api";

import type {
  CreateService,
  UpdateService,
  GetServicesResponse,
  Service,
} from "@/types/service";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const getServices = (page = 1, limit = 10) => {
  return api.get<ApiResponse<GetServicesResponse>>("/services", {
    params: {
      page,
      limit,
    },
  });
};

export const getService = getServices;

export const getServiceById = (id: number) => {
  return api.get<ApiResponse<Service>>(`/services/${id}`);
};

export const createService = (data: CreateService, imageFile?: File) => {
  const formData = new FormData();

  formData.append("name", data.name);
  formData.append("duration", String(data.duration));
  formData.append("price", String(data.price));
  formData.append("status", data.status);

  if (imageFile) {
    formData.append("image", imageFile);
  }

  return api.post<ApiResponse<Service>>("/services", formData);
};

export const updateService = (
  id: number,
  data: UpdateService,
  imageFile?: File,
) => {
  const formData = new FormData();

  if (data.name !== undefined) {
    formData.append("name", data.name);
  }

  if (data.duration !== undefined) {
    formData.append("duration", String(data.duration));
  }

  if (data.price !== undefined) {
    formData.append("price", String(data.price));
  }

  if (data.status !== undefined) {
    formData.append("status", data.status);
  }

  if (imageFile) {
    formData.append("image", imageFile);
  }

  return api.put<ApiResponse<Service>>(`/services/${id}`, formData);
};

export const deleteService = (id: number) => {
  return api.delete<ApiResponse<null>>(`/services/${id}`);
};

export const restoreService = (id: number) => {
  return api.patch<ApiResponse<Service>>(`/services/${id}/restore`);
};

export const getDeletedServices = () => {
  return api.get<ApiResponse<Service[]>>("/services/trash/list");
};
