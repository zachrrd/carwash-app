export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}
