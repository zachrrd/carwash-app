import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Car,
  CheckCircle2,
  Clock,
  Clock3,
  Plus,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";

import { getMyOrders } from "@/services/order.service";
import type { Order, OrderServiceStatus } from "@/types/order";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const HISTORY_STATUSES: OrderServiceStatus[] = ["COMPLETED", "CANCELLED"];

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
    case "COMPLETED":
      return (
        <Badge
          variant="outline"
          className="border-emerald-200 bg-emerald-50 text-emerald-700"
        >
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Selesai
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge
          variant="outline"
          className="border-rose-200 bg-rose-50 text-rose-700"
        >
          <XCircle className="mr-1 h-3 w-3" />
          Dibatalkan
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

export default function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

useEffect(() => {
  let cancelled = false;

  const loadHistory = async () => {
    try {
      setLoading(true);

      const data = await getMyOrders();

      if (!cancelled) {
        setOrders(data);
      }
    } catch (err: unknown) {
      if (!cancelled) {
        console.error("Failed to load order history:", err);
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  void loadHistory();

  return () => {
    cancelled = true;
  };
}, []);

  const handleRefresh = async () => {
  try {
    setLoading(true);

    const data = await getMyOrders();

    setOrders(data);
  } catch (err: unknown) {
    console.error("Failed to load order history:", err);
  } finally {
    setLoading(false);
  }
};
  const historyOrders = orders.filter((o) =>
    o.service_status ? HISTORY_STATUSES.includes(o.service_status) : false,
  );

  const filteredOrders = historyOrders.filter((order) => {
    // Status filter
    if (activeFilter !== "ALL" && order.service_status !== activeFilter) {
      return false;
    }

    // Search filter
    if (!search.trim()) return true;
    const query = search.toLowerCase();

    const orderIdMatch = String(order.id).includes(query);
    const vehicleMatch =
      order.vehicles?.plate_number.toLowerCase().includes(query) ||
      order.vehicles?.brand.toLowerCase().includes(query) ||
      order.vehicles?.model.toLowerCase().includes(query);
    const serviceMatch = order.order_items?.some((item) =>
      item.services?.name.toLowerCase().includes(query),
    );

    return orderIdMatch || vehicleMatch || serviceMatch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge
            variant="outline"
            className="mb-1 border-slate-200 bg-slate-100 text-slate-700"
          >
            Riwayat Layanan
          </Badge>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Riwayat Pesanan
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Daftar seluruh pesanan cuci mobil kamu yang sudah selesai atau
            dibatalkan.
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
            Pesan Lagi
          </Button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: "ALL", label: "Semua Riwayat", count: historyOrders.length },
            {
              key: "COMPLETED",
              label: "Selesai",
              count: historyOrders.filter(
                (o) => o.service_status === "COMPLETED",
              ).length,
            },
            {
              key: "CANCELLED",
              label: "Dibatalkan",
              count: historyOrders.filter(
                (o) => o.service_status === "CANCELLED",
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

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Cari ID, plat, mobil, layanan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border-slate-200 pl-9 text-xs focus-visible:ring-[#FF5412]"
          />
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Clock3 className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-base font-bold text-slate-900">
              Tidak Ada Riwayat Pesanan
            </h3>
            <p className="mt-1 max-w-sm text-xs text-slate-500">
              {search
                ? `Tidak ditemukan pesanan yang sesuai dengan kata kunci "${search}".`
                : "Kamu belum memiliki riwayat pesanan cuci mobil."}
            </p>

            <Button
              type="button"
              onClick={() => navigate("/orders/create")}
              className="mt-6 rounded-xl bg-slate-900 px-5 text-xs font-bold text-white hover:bg-[#FF5412]"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Pesan Cuci Mobil Sekarang
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredOrders.map((order) => {
            const totalAmount =
              order.order_items?.reduce(
                (sum, item) => sum + Number(item.subtotal),
                0,
              ) ?? 0;

            const primaryServiceId = order.order_items?.[0]?.service_id;

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

                  <CardContent className="space-y-3.5 p-4 sm:p-5">
                    <div className="grid gap-2 rounded-xl bg-slate-50 p-3 text-xs sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-slate-400" />
                        <span className="truncate font-semibold text-slate-800">
                          {order.vehicles?.brand} {order.vehicles?.model} (
                          {order.vehicles?.plate_number})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-500">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span>
                          {formatDate(order.order_date ?? order.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Layanan
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

                <div className="flex flex-col gap-3 border-t border-slate-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400">
                      Total:
                    </span>
                    <p className="text-base font-extrabold text-[#FF5412]">
                      {formatRupiah(totalAmount)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {primaryServiceId && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/orders/create?service_id=${primaryServiceId}`,
                          )
                        }
                        className="rounded-xl border-slate-200 text-xs font-semibold hover:border-orange-200 hover:bg-orange-50 hover:text-[#FF5412]"
                      >
                        Pesan Lagi
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
    </div>
  );
}
