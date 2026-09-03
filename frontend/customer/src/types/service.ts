export type ServiceStatus = "ACTIVE" | "INACTIVE";

export interface Service {
  id: number;
  name: string;
  duration: number;
  price: string;
  status: ServiceStatus;
  image_url: string | null;
  image_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ServicesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ServicesResponse {
  success: boolean;
  message: string;
  data: {
    services: Service[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ServiceResponse {
  success: boolean;
  message: string;
  data: Service;
}
