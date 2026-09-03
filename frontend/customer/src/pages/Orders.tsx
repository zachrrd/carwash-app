import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Car,
  CheckCircle2,
  Clock,
  Clock3,
  Droplets,
  Plus,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

import { getMyOrders, cancelOrder } from "@/services/order.service";
import type { Order, OrderServiceStatus } from "@/types/order";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ACTIVE_STATUSES: OrderServiceStatus[] = [
  "WAITING",
  "CONFIRMED",
  "IN_PROGRESS",
];

const formatRupiah = (value: number | string) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return "Rp 0";
  return `Rp ${amount.toLocaleString("id-ID")}`;
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "-";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusBadge = (status: OrderServiceStatus | null) => {
  switch (status) {
    case "WAITING":
      return (
        <Badge
          variant="outline"
          className="border-amber-200 bg-amber-50 text-amber-700"
        >
          <Clock3 className="mr-1 h-3 w-3" />
          Menunggu Konfirmasi
        </Badge>
      );
    case "CONFIRMED":
      return (
        <Badge
          variant="outline"
          className="border-blue-200 bg-blue-50 text-blue-700"
        >
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Dikonfirmasi
        </Badge>
      );
    case "IN_PROGRESS":
      return (
        <Badge
          variant="outline"
          className="border-orange-200 bg-orange-50 text-[#FF5412]"
        >
          <Droplets className="mr-1 h-3 w-3" />
          Sedang Dicuci
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="border-slate-200 bg-slate-50 text-slate-700"
        >
          {status || "-"}
        </Badge>
      );
  }
};

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  // Cancel dialog states
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

const handleRefresh = async () => {
  setLoading(true);

  try {
    const data = await getMyOrders();
    setOrders(data);
  } catch (err: unknown) {
    console.error("Failed to load customer orders:", err);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  let cancelled = false;

  const loadOrders = async () => {
    try {
      setLoading(true);

      const data = await getMyOrders();

      if (!cancelled) {
        setOrders(data);
      }
    } catch (err: unknown) {
      if (!cancelled) {
        console.error("Failed to load customer orders:", err);
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  void loadOrders();

  return () => {
    cancelled = true;
  };
}, []);

  // Filter only active orders
  const activeOrders = orders.filter((o) =>
    o.service_status ? ACTIVE_STATUSES.includes(o.service_status) : false,
  );

  const filteredOrders = activeOrders.filter((o) => {
    if (activeFilter === "ALL") return true;
    return o.service_status === activeFilter;
  });

  // Handle order cancel
  const handleOpenCancelDialog = (order: Order) => {
    setOrderToCancel(order);
    setCancelError(null);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!orderToCancel) return;

    setCancelling(true);
    setCancelError(null);

    try {
      await cancelOrder(orderToCancel.id);
      setCancelModalOpen(false);
      setOrderToCancel(null);
      await handleRefresh();
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const response = (
          err as {
            response?: {
              data?: {
                message?: string;
              };
            };
          }
        ).response;

        const message = response?.data?.message;

        console.error(message);
      }
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge
            variant="outline"
            className="mb-1 border-orange-200 bg-orange-50 text-[#FF5412]"
          >
            Pesanan Berjalan
          </Badge>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Daftar Pesanan Aktif
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Pantau status pengerjaan cuci mobil kamu secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="rounded-xl border-slate-200 text-xs font-semibold"
          >
            <RefreshCw
              className={`mr-1.5 h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Muat Ulang
          </Button>

          <Button
            type="button"
            onClick={() => navigate("/orders/create")}
            className="rounded-xl bg-[#FF5412] text-xs font-bold text-white shadow-sm hover:bg-orange-600"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Buat Pesanan Baru
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { key: "ALL", label: "Semua Aktif", count: activeOrders.length },
          {
            key: "WAITING",
            label: "Menunggu",
            count: activeOrders.filter((o) => o.service_status === "WAITING")
              .length,
          },
          {
            key: "CONFIRMED",
            label: "Dikonfirmasi",
            count: activeOrders.filter((o) => o.service_status === "CONFIRMED")
              .length,
          },
          {
            key: "IN_PROGRESS",
            label: "Sedang Dicuci",
            count: activeOrders.filter(
              (o) => o.service_status === "IN_PROGRESS",
            ).length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveFilter(tab.key)}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              activeFilter === tab.key
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                activeFilter === tab.key
                  ? "bg-slate-700 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Content List */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-56 w-full rounded-2xl" />
          <Skeleton className="h-56 w-full rounded-2xl" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#FF5412]">
              <Car className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-base font-bold text-slate-900">
              Tidak Ada Pesanan Aktif
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              {activeFilter === "ALL"
                ? "Kamu sedang tidak memiliki pesanan cuci mobil yang sedang berlangsung."
                : `Tidak ada pesanan dengan status ${activeFilter}.`}
            </p>

            <Button
              type="button"
              onClick={() => navigate("/orders/create")}
              className="mt-6 rounded-xl bg-slate-900 px-5 text-xs font-bold text-white hover:bg-[#FF5412]"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Buat Pesanan Sekarang
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredOrders.map((order) => {
            const totalAmount =
              order.order_items?.reduce(
                (sum, item) => sum + Number(item.subtotal),
                0,
              ) ?? 0;

            const isCancellable =
              (order.service_status === "WAITING" ||
                order.service_status === "CONFIRMED") &&
              order.payment_status !== "PAID";

            return (
              <Card
                key={order.id}
                className="flex flex-col justify-between overflow-hidden rounded-2xl border-slate-200 shadow-sm transition hover:shadow-md"
              >
                <div>
                  <CardHeader className="border-b border-slate-100 bg-slate-50/60 p-4 sm:p-5">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Booking ID
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900">
                          #{order.id}
                        </h3>
                      </div>
                      {getStatusBadge(order.service_status)}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4 p-4 sm:p-5">
                    {/* Vehicle & Date */}
                    <div className="grid gap-3 rounded-xl bg-slate-50 p-3.5 text-xs sm:grid-cols-2">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#FF5412] shadow-xs">
                          <Car className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-900">
                            {order.vehicles
                              ? `${order.vehicles.brand} ${order.vehicles.model}`
                              : "Kendaraan"}
                          </p>
                          <p className="font-semibold text-slate-500">
                            {order.vehicles?.plate_number}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#FF5412] shadow-xs">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-bold text-slate-900">
                            {formatDate(order.order_date ?? order.created_at)}
                          </p>
                          {order.check_in_time && (
                            <p className="font-semibold text-slate-500">
                              Check-in: {order.check_in_time}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Services Items summary */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Layanan Dipesan
                      </p>
                      <div className="space-y-1">
                        {order.order_items?.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="truncate font-medium text-slate-700">
                              {item.services?.name}{" "}
                              {item.qty ? `(${item.qty}x)` : ""}
                            </span>
                            <span className="font-semibold text-slate-900">
                              {formatRupiah(item.subtotal)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </div>

                {/* Footer with totals and action buttons */}
                <div className="flex flex-col gap-3 border-t border-slate-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400">
                      Total Biaya:
                    </span>
                    <p className="text-base font-extrabold text-[#FF5412]">
                      {formatRupiah(totalAmount)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCancellable && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenCancelDialog(order)}
                        className="rounded-xl border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        Batalkan
                      </Button>
                    )}

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-[#FF5412]"
                    >
                      Detail
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-lg font-bold text-slate-900">
              Batalkan Pesanan #{orderToCancel?.id}?
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-slate-500">
              Apakah kamu yakin ingin membatalkan pesanan ini? Aksi ini tidak
              dapat diurungkan.
            </DialogDescription>
          </DialogHeader>

          {cancelError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {cancelError}
            </div>
          )}

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancelModalOpen(false)}
              className="rounded-xl text-xs font-semibold"
            >
              Kembali
            </Button>
            <Button
              type="button"
              disabled={cancelling}
              onClick={handleConfirmCancel}
              className="rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-700"
            >
              {cancelling ? "Membatalkan..." : "Ya, Batalkan Pesanan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
