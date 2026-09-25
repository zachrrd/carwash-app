import { Link } from "react-router-dom";
import {
  ArrowRight,
  Car,
  CheckCircle2,
  Clock3,
  Droplets,
  XCircle,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";

import type { Order } from "@/types/order";
import { useNavigate } from "react-router-dom";

interface RecentOrdersProps {
  orders: Order[];
  loading?: boolean;
}

const formatDate = (date?: string | null) => {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusConfig = (status: string | null) => {
  switch (status) {
    case "CONFIRMED":
      return {
        label: "Dikonfirmasi",
        className: "border-blue-200 bg-blue-50 text-blue-600",
        icon: CheckCircle2,
      };

    case "IN_PROGRESS":
      return {
        label: "Sedang Dicuci",
        className: "border-purple-200 bg-purple-50 text-purple-600",
        icon: Droplets,
      };

    case "COMPLETED":
      return {
        label: "Selesai",
        className: "border-emerald-200 bg-emerald-50 text-emerald-600",
        icon: CheckCircle2,
      };

    case "CANCELLED":
      return {
        label: "Dibatalkan",
        className: "border-red-200 bg-red-50 text-red-600",
        icon: XCircle,
      };

    case "WAITING":
    default:
      return {
        label: "Menunggu",
        className: "border-orange-200 bg-orange-50 text-[#FF5412]",
        icon: Clock3,
      };
  }
};

export default function RecentOrders({
  orders,
  loading = false,
}: RecentOrdersProps) {
  const recentOrders = orders.slice(0, 5);
  const navigate = useNavigate();
  return (
    <section>
      {/* HEADER */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#FF5412]">
            Riwayat Terbaru
          </p>

          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
            Pesanan terakhir
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Lihat aktivitas pesanan terbarumu.
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate("/orders-history")}
          className="w-fit shrink-0 gap-1.5 px-0 text-sm font-bold text-[#FF5412] hover:bg-transparent hover:text-[#E33D00]"
        >
          <Link to="/orders-history">
            Lihat semua
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <Card
              key={item}
              className="overflow-hidden rounded-2xl border-slate-100 shadow-sm"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-slate-200" />

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                    <div className="h-3 w-48 animate-pulse rounded bg-slate-200" />
                    <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : recentOrders.length === 0 ? (
        /* EMPTY STATE */
        <Card className="rounded-2xl border-dashed border-slate-200 shadow-none">
          <CardContent className="flex flex-col items-center justify-center px-5 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#FF5412]">
              <Clock3 className="h-6 w-6" />
            </div>

            <p className="mt-4 text-sm font-bold text-slate-700">
              Belum ada riwayat pesanan
            </p>

            <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-400">
              Pesanan yang kamu buat akan muncul di sini.
            </p>

            <Button
              type="button"
              onClick={() => navigate("/orders/create")}
              className="mt-5 rounded-xl bg-slate-900 text-xs font-bold hover:bg-[#FF5412]"
            >
              <Link to="/orders/create">
                Buat Pesanan
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* ORDERS */
        <div className="space-y-3">
          {recentOrders.map((order) => {
            const status = getStatusConfig(order.service_status);
            const StatusIcon = status.icon;

            const vehicle = order.vehicles;

            return (
              <Card
                key={order.id}
                className="group overflow-hidden rounded-2xl border-slate-100 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <CardContent className="p-4">
                  <Link
                    to={`/orders/${order.id}`}
                    className="flex items-center gap-4"
                  >
                    {/* VEHICLE ICON */}
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF5412] transition group-hover:bg-[#FF5412] group-hover:text-white">
                      <Car className="h-5 w-5" />
                    </div>

                    {/* ORDER INFO */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">
                          Order #{order.id}
                        </p>

                        <Badge
                          variant="outline"
                          className={`gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${status.className}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {status.label}
                        </Badge>
                      </div>

                      {/* VEHICLE */}
                      <p className="mt-1 truncate text-xs font-medium text-slate-500">
                        {vehicle?.brand ?? "Kendaraan"} {vehicle?.model ?? ""}
                        {vehicle?.plate_number
                          ? ` • ${vehicle.plate_number}`
                          : ""}
                      </p>

                      {/* DATE */}
                      <p className="mt-1 text-[11px] text-slate-400">
                        {formatDate(order.order_date ?? order.created_at)}
                      </p>
                    </div>

                    {/* ARROW */}
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-300 transition duration-200 group-hover:translate-x-0.5 group-hover:text-[#FF5412]" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
