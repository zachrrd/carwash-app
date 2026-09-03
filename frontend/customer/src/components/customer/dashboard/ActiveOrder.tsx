import {
  ArrowRight,
  Car,
  Check,
  CheckCircle2,
  Clock3,
  Droplets,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import type { Order } from "@/types/order";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { Button } from "@/components/ui/button";

interface ActiveOrderProps {
  order: Order | null;
  loading: boolean;
}

const statusSteps = [
  {
    status: "WAITING",
    label: "Menunggu",
    icon: Clock3,
  },
  {
    status: "CONFIRMED",
    label: "Dikonfirmasi",
    icon: CheckCircle2,
  },
  {
    status: "IN_PROGRESS",
    label: "Dicuci",
    icon: Droplets,
  },
  {
    status: "COMPLETED",
    label: "Selesai",
    icon: Check,
  },
] as const;

const getStatusConfig = (status: Order["service_status"]) => {
  switch (status) {
    case "CONFIRMED":
      return {
        label: "Dikonfirmasi",
        description: "Pesanan sudah dikonfirmasi dan siap untuk diproses.",
      };

    case "IN_PROGRESS":
      return {
        label: "Sedang Dicuci",
        description: "Kendaraanmu sedang dalam proses pencucian.",
      };

    case "WAITING":
    default:
      return {
        label: "Menunggu",
        description: "Pesananmu sudah diterima dan sedang menunggu konfirmasi.",
      };
  }
};

const formatRupiah = (value: number | string) => {
  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return "Rp 0";
  }

  return `Rp ${amount.toLocaleString("id-ID")}`;
};

const formatDate = (date: string | null | undefined) => {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function ActiveOrder({ order, loading }: ActiveOrderProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card className="overflow-hidden rounded-2xl border-slate-200/80 shadow-sm">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-slate-200" />
                <div className="h-6 w-32 rounded bg-slate-200" />
              </div>

              <div className="h-8 w-28 rounded-full bg-slate-200" />
            </div>

            <div className="h-20 rounded-2xl bg-slate-100" />

            <div className="h-2 rounded-full bg-slate-100" />

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="h-16 rounded-xl bg-slate-100" />
              <div className="h-16 rounded-xl bg-slate-100" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!order) {
    return (
      <Card className="overflow-hidden rounded-2xl border-slate-200/80 bg-white shadow-sm">
        <CardContent className="flex flex-col items-center justify-center px-6 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <Car className="h-6 w-6 text-slate-400" />
          </div>

          <h3 className="mt-4 text-base font-bold tracking-tight text-slate-900">
            Tidak Ada Pesanan Aktif
          </h3>

          <p className="mt-1 max-w-sm text-sm leading-relaxed text-slate-500">
            Belum ada kendaraan yang sedang diproses. Yuk booking layanan untuk
            kendaraanmu.
          </p>

          <Button
            type="button"
            onClick={() => navigate("/orders/create")}
            className="mt-5 h-10 rounded-xl bg-slate-900 px-5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#FF5412]"
          >
            Buat Pesanan
            <ArrowRight className="ml-2 h-3.5 w-3.5" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  const config = getStatusConfig(order.service_status);

  const currentStepIndex = statusSteps.findIndex(
    (step) => step.status === order.service_status,
  );

  const totalAmount =
    order.order_items?.reduce(
      (total, item) => total + Number(item.subtotal),
      0,
    ) ?? 0;

  const vehicle = order.vehicles;

  return (
    <Card className="overflow-hidden rounded-2xl border-slate-200/80 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
      <CardHeader className="border-b border-slate-100 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Pesanan Aktif
              </p>
            </div>

            <h2 className="mt-1.5 text-xl font-extrabold tracking-tight text-slate-900">
              Order #{order.id}
            </h2>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3.5 py-2 text-xs font-bold text-[#FF5412]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#FF5412]" />
            {config.label}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#FF5412] shadow-sm">
              <Car className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Kendaraan
              </p>

              <p className="mt-1 truncate text-sm font-bold text-slate-900">
                {vehicle ? `${vehicle.brand} ${vehicle.model}` : "Kendaraan"}
              </p>

              {vehicle?.plate_number && (
                <p className="mt-0.5 text-xs font-medium text-slate-500">
                  {vehicle.plate_number}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#FF5412] shadow-sm">
              <Clock3 className="h-5 w-5" />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Jadwal
              </p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                {formatDate(order.order_date ?? order.created_at)}
              </p>

              {order.check_in_time && (
                <p className="mt-0.5 text-xs text-slate-500">
                  Check-in {order.check_in_time}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50/80 to-white p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#FF5412] shadow-sm">
              <Droplets className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                {config.description}
              </p>

              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                Status akan diperbarui secara otomatis saat pesanan diproses.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-7">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-900">Progress Pesanan</p>

            <span className="text-[11px] font-medium text-slate-400">
              {currentStepIndex + 1} dari {statusSteps.length}
            </span>
          </div>

          <div className="mt-5 flex items-start">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isLast = index === statusSteps.length - 1;

              return (
                <div
                  key={step.status}
                  className="flex min-w-0 flex-1 items-start"
                >
                  <div className="flex min-w-0 flex-1 flex-col items-center">
                    <div
                      className={[
                        "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-500",
                        isCurrent
                          ? "border-[#FF5412] bg-[#FF5412] text-white shadow-lg shadow-orange-500/20"
                          : isCompleted
                            ? "border-[#FF5412] bg-orange-50 text-[#FF5412]"
                            : "border-slate-200 bg-white text-slate-300",
                      ].join(" ")}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    <p
                      className={[
                        "mt-2 text-center text-[10px] font-semibold",
                        isCurrent || isCompleted
                          ? "text-slate-900"
                          : "text-slate-400",
                      ].join(" ")}
                    >
                      {step.label}
                    </p>
                  </div>

                  {!isLast && (
                    <div
                      className={[
                        "mt-4 h-0.5 flex-1 transition-colors duration-500",
                        index < currentStepIndex
                          ? "bg-[#FF5412]"
                          : "bg-slate-200",
                      ].join(" ")}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Pesanan
            </p>

            <p className="mt-1 text-xl font-extrabold tracking-tight text-[#FF5412]">
              {formatRupiah(totalAmount)}
            </p>
          </div>

          <Button
            type="button"
            onClick={() => navigate(`/orders/${order.id}`)}
            className="h-10 rounded-xl bg-slate-900 px-5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#FF5412]"
          >
            Lihat Detail
            <ArrowRight className="ml-2 h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
