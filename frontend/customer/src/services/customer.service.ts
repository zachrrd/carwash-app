import api from "@/services/api";

export interface UpdateMyProfileData {
  name: string;
  email: string;
  phone: string;
}

export interface UpdatedProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  customer: {
    id: number;
    phone: string | null;
    user_id: number | null;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const updateMyProfile = async (
  data: UpdateMyProfileData,
): Promise<UpdatedProfile> => {
  const response = await api.put<ApiResponse<UpdatedProfile>>(
    "/customers/me",
    data,
  );

  return response.data.data;
};