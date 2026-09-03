import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Car,
  ChevronDown,
  ClipboardList,
  Clock3,
  Droplets,
  Home,
  LogOut,
  Menu,
  User,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  {
    label: "Home",
    to: "/home",
    icon: Home,
  },
  {
    label: "Services",
    to: "/services",
    icon: Droplets,
  },
  {
    label: "Orders",
    to: "/orders",
    icon: ClipboardList,
  },
  {
    label: "Order History",
    to: "/orders-history",
    icon: Clock3,
  },
];

export default function CustomerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const userInitial = user?.name?.charAt(0).toUpperCase() ?? "C";

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-slate-900">
      {/* =========================
          NAVBAR
      ========================= */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* LOGO */}
          <Link to="/home" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF5412] text-white shadow-lg shadow-orange-500/20">
              <Car className="h-5 w-5" />
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-extrabold tracking-tight text-slate-900">
                CleanRide
                <span className="text-[#FF5412]">Neo</span>
              </p>

              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Smart Carwash
              </p>
            </div>
          </Link>

          {/* =========================
              DESKTOP NAVIGATION
          ========================= */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-orange-50 text-[#FF5412] shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* =========================
              DESKTOP PROFILE
          ========================= */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 transition hover:bg-slate-50">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-[#FF5412]">
                  {userInitial}
                </div>

                <div className="hidden text-left lg:block">
                  <p className="max-w-[120px] truncate text-xs font-bold text-slate-900">
                    {user?.name ?? "Customer"}
                  </p>

                  <p className="text-[10px] text-slate-400">Customer</p>
                </div>

                <ChevronDown className="h-4 w-4 text-slate-400" />
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-60 rounded-2xl border-slate-100 bg-white p-2 shadow-xl shadow-slate-200/60"
              >
                {/* USER INFO */}
                <div className="px-3 py-2">
                  <p className="text-sm font-bold text-slate-900">
                    {user?.name ?? "Customer"}
                  </p>

                  <p className="mt-1 truncate text-xs text-slate-400">
                    {user?.email}
                  </p>
                </div>

                <DropdownMenuSeparator className="my-2 bg-slate-100" />

                {/* PROFILE */}
                <DropdownMenuItem
                  className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700"
                  onClick={() => navigate("/profile")}
                >
                  <User className="mr-3 h-4 w-4 text-slate-400" />
                  Profile
                </DropdownMenuItem>

                {/* LOGOUT */}
                <DropdownMenuItem
                  className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* =========================
              MOBILE MENU
          ========================= */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 rounded-xl border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-[300px] border-l border-slate-200 bg-white px-0"
              >
                <SheetHeader className="border-b border-slate-100 px-5 pb-5">
                  <SheetTitle className="flex items-center gap-3 text-left">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF5412] text-white shadow-lg shadow-orange-500/20">
                      <Car className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-extrabold tracking-tight text-slate-900">
                        CleanRide
                        <span className="text-[#FF5412]">Neo</span>
                      </p>

                      <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Smart Carwash
                      </p>
                    </div>
                  </SheetTitle>
                </SheetHeader>

                <div className="px-4 py-5">
                  {/* USER INFO */}
                  <div className="mb-5 flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-[#FF5412]">
                      {userInitial}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {user?.name ?? "Customer"}
                      </p>

                      <p className="truncate text-xs text-slate-400">
                        {user?.email}
                      </p>
                    </div>
                  </div>

                  {/* NAVIGATION */}
                  <nav className="space-y-1">
                    {navItems.map((item) => {
                      const Icon = item.icon;

                      return (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          className={({ isActive }) =>
                            `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                              isActive
                                ? "bg-orange-50 text-[#FF5412]"
                                : "text-slate-700 hover:bg-slate-50"
                            }`
                          }
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </NavLink>
                      );
                    })}
                  </nav>

                  <div className="my-5 h-px bg-slate-100" />

                  {/* PROFILE */}
                  <Button
                    variant="ghost"
                    className="h-auto w-full justify-start gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    onClick={() => navigate("/profile")}
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    Profile
                  </Button>

                  {/* LOGOUT */}
                  <Button
                    variant="ghost"
                    className="mt-1 h-auto w-full justify-start gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* =========================
          MAIN CONTENT
      ========================= */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
