import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  // Belum login
  if (!token || !userData) {
    return <Navigate to="/login" replace />;
  }

  let user: AuthUser;

  try {
    user = JSON.parse(userData);
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return <Navigate to="/login" replace />;
  }

  if (!user.role) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return <Navigate to="/403" replace />;
  }

  if (!allowedRoles) {
    return <Outlet />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
