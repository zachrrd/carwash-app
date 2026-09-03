import api from "@/services/api";
import type {
  Service,
  ServicesResponse,
  ServiceResponse,
} from "@/types/service";

export interface GetServicesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ACTIVE" | "INACTIVE";
}

export const getServices = async (
  params?: GetServicesParams,
): Promise<{
  services: Service[];
  pagination: ServicesResponse["data"]["pagination"];
}> => {
  const response = await api.get<ServicesResponse>("/services/public", {
    params: {
      page: params?.page ?? 1,
      limit: params?.limit ?? 100,
      ...(params?.search && { search: params.search }),
      ...(params?.status && { status: params.status }),
    },
  });

  return response.data.data;
};

export const getServiceById = async (id: number): Promise<Service> => {
  const response = await api.get<ServiceResponse>(`/services/public/${id}`);

  return response.data.data;
};
