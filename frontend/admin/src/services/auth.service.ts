import { api } from "./api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const login = (data: LoginPayload) => {
  return api.post<ApiResponse<LoginResponse>>("/auth/login", data);
};
