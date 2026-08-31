export type StaffStatus = "ACTIVE" | "INACTIVE";

export interface Staff {
  id: number;
  name: string;
  phone: string | null;
  status: StaffStatus | null;
}

export interface CreateStaff {
  name: string;
  phone: string;
  status: StaffStatus | null;
}

export type UpdateStaff = CreateStaff;

export interface StaffPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetStaffsResponse {
  staffs: Staff[];
  pagination: StaffPagination;
}