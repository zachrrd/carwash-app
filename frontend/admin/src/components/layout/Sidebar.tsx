import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Car,
  Wrench,
  CreditCard,
  History,
  User,
  X,
  LogOut,
} from "lucide-react";

import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
}

const menus = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
    roles: ["ADMIN", "CASHIER"],
  },
  {
    name: "Orders",
    path: "/orders",
    icon: ShoppingCart,
    roles: ["ADMIN", "CASHIER"],
  },
  {
    name: "Customers",
    path: "/customers",
    icon: Users,
    roles: ["ADMIN", "CASHIER"],
  },
  {
    name: "Vehicles",
    path: "/vehicles",
    icon: Car,
    roles: ["ADMIN", "CASHIER"],
  },
  {
    name: "Services",
    path: "/services",
    icon: Wrench,
    roles: ["ADMIN"],
  },
  {
    name: "Staffs",
    path: "/staffs",
    icon: User,
    roles: ["ADMIN"],
  },
  {
    name: "Payments",
    path: "/payments",
    icon: CreditCard,
    roles: ["ADMIN", "CASHIER"],
  },
  {
    name: "History",
    path: "/history",
    icon: History,
    roles: ["ADMIN", "CASHIER"],
  },
];

export default function Sidebar({ open = false, onClose }: SidebarProps) {
  const navigate = useNavigate();

  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const storedUser = localStorage.getItem("user");

  let user: UserData | null = null;

  if (storedUser) {
    try {
      user = JSON.parse(storedUser);
    } catch {
      user = null;
    }
  }

  const userRole = user?.role ?? "";

  const filteredMenus = menus.filter((menu) => menu.roles.includes(userRole));

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setUserMenuOpen(false);
    onClose?.();

    navigate("/login");
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50
        flex w-64 flex-col
        border-r bg-background
        transition-transform duration-300
        lg:static lg:z-auto lg:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            CARWASH
          </h1>

          <p className="text-sm text-muted-foreground">Management App</p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Separator />

      {/* MENU */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {filteredMenus.map((menu) => {
            const Icon = menu.icon;

            return (
              <NavLink
                key={menu.name}
                to={menu.path}
                onClick={onClose}
                className="block"
              >
                {({ isActive }) => (
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Icon className="mr-3 h-4 w-4" />

                    {menu.name}
                  </Button>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <Separator />

      {/* USER */}
      <div className="relative p-4">
        <button
          type="button"
          onClick={() => setUserMenuOpen((prev) => !prev)}
          className="w-full rounded-lg border bg-muted/50 p-3 text-left transition-colors hover:bg-muted"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {user?.name ?? "User"}
              </p>

              <p className="text-xs text-muted-foreground">
                {user?.role ?? "Unknown"}
              </p>
            </div>
          </div>
        </button>

        {/* USER ACTION */}
        {userMenuOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-2 rounded-lg border bg-background p-1 shadow-lg">
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
