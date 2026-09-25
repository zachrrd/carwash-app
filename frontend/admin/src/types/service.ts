export type ActiveStatus = "ACTIVE" | "INACTIVE";

export interface Service {
  id: number;
  name: string;
  duration: number;
  price: number | string;
  status: ActiveStatus | null;
  image_url: string | null;
  image_id: string | null;
}

export interface CreateService {
  name: string;
  duration: number;
  price: number;
  status: ActiveStatus;
}

export type UpdateService = Partial<CreateService>;

export interface ServicePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetServicesResponse {
  services: Service[];
  pagination: ServicePagination;
}
