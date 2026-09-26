import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import api from "@/services/api";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  customer?: {
    id: number;
    phone: string | null;
  } | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
  }) => Promise<void>;
  updateUser: (updatedUser: User) => void;
  refreshUser: () => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getInitialToken = (): string | null => {
  return localStorage.getItem("token");
};

const getInitialUser = (): User | null => {
  const stored = localStorage.getItem("user");

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as User;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(getInitialUser);
  const [token, setToken] = useState<string | null>(getInitialToken);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      const storedToken = localStorage.getItem("token");

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");

        const currentUser = response.data.data;

        if (currentUser.role !== "CUSTOMER") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          setToken(null);
          setUser(null);
          return;
        }

        localStorage.setItem("user", JSON.stringify(currentUser));

        setToken(storedToken);
        setUser(currentUser);
      } catch (error) {
        console.error("AUTH SESSION ERROR:", error);

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void validateSession();
  }, []);

  const refreshUser = async () => {
    try {
      const response = await api.get("/auth/me");
      const currentUser = response.data.data;

      if (currentUser && currentUser.role === "CUSTOMER") {
        localStorage.setItem("user", JSON.stringify(currentUser));
        setUser(currentUser);
      }
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/customer/login", {
      email,
      password,
    });

    const {
      token: newToken,
      user: rawUser,
      customer: rawCustomer,
    } = response.data.data;

    if (rawUser.role !== "CUSTOMER") {
      throw new Error("This account is not registered as a customer.");
    }

    const newUser: User = {
      ...rawUser,
      customer:
        rawUser.customer ??
        (rawCustomer ? { id: rawCustomer.id, phone: rawCustomer.phone } : null),
    };

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);

    // If customer phone is still missing, fetch /auth/me in background
    if (!newUser.customer?.phone) {
      void refreshUser();
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
  }) => {
    const response = await api.post("/auth/register", data);

    const {
      token: newToken,
      user: rawUser,
      customer: rawCustomer,
    } = response.data.data;

    if (rawUser.role !== "CUSTOMER") {
      throw new Error("Registration is only available for customers.");
    }

    const newUser: User = {
      ...rawUser,
      customer:
        rawUser.customer ??
        (rawCustomer ? { id: rawCustomer.id, phone: rawCustomer.phone } : null),
    };

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);
  };

  const updateUser = (updatedUser: User) => {
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        updateUser,
        refreshUser,
        logout,
        isAuthenticated: !!token && user?.role === "CUSTOMER",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
