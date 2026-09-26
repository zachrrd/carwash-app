import {
  Car,
  CheckCircle2,
  Droplets,
  Wallet,
  TrendingUp,
  Calendar,
  CalendarDays,
  CalendarRange,
  Coins,
} from "lucide-react";

import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { getOrders } from "@/services/order.service";

import {
  getRevenueSummary,
  type RevenueSummaryData,
} from "@/services/payment.service";

import type { Order } from "@/types/order";

const formatRupiah = (value: number) => {
  return `Rp ${value.toLocaleString("id-ID")}`;
};

export default function SummarySection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [revenueData, setRevenueData] =
    useState<RevenueSummaryData | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const [ordersRes, revenueRes] =
          await Promise.all([
            getOrders().catch((err) => {
              console.error(
                "Failed to fetch dashboard orders:",
                err,
              );
              return null;
            }),

            getRevenueSummary().catch((err) => {
              console.error(
                "Failed to fetch revenue summary:",
                err,
              );
              return null;
            }),
          ]);

        if (ordersRes?.data?.data) {
          const orderList =
            ordersRes.data.data.orders ||
            (ordersRes.data.data as any).data ||
            [];

          setOrders(orderList);
        }

        if (revenueRes?.data?.data) {
          setRevenueData(revenueRes.data.data);
        }
      } catch (err) {
        console.error(
          "SummarySection error:",
          err,
        );
      }
    };

    fetchSummary();
  }, []);

  const today = new Date();

  const todayOrders = orders.filter((order) => {
    if (!order.order_date) {
      return false;
    }

    const orderDate = new Date(order.order_date);

    return (
      orderDate.getDate() === today.getDate() &&
      orderDate.getMonth() === today.getMonth() &&
      orderDate.getFullYear() === today.getFullYear()
    );
  });

  const inProgressNow = todayOrders.filter(
    (order) =>
      order.service_status === "IN_PROGRESS",
  ).length;

  const completed = todayOrders.filter(
    (order) =>
      order.service_status === "COMPLETED",
  ).length;

  const todayRevenue =
    revenueData?.today?.revenue ?? 0;

  const monthRevenue =
    revenueData?.month?.revenue ?? 0;

  const yearRevenue =
    revenueData?.year?.revenue ?? 0;

  const allTimeRevenue =
    revenueData?.allTime?.revenue ?? 0;

  const operationalData = [
    {
      title: "Today's Orders",
      value: todayOrders.length,
      description: "Pesanan masuk hari ini",
      icon: Car,
    },
    {
      title: "In Progress",
      value: inProgressNow,
      description: `${
        todayOrders.filter(
          (order) =>
            order.service_status === "WAITING",
        ).length
      } dalam antrean`,
      icon: Droplets,
    },
    {
      title: "Completed",
      value: completed,
      description:
        "Mobil selesai dicuci hari ini",
      icon: CheckCircle2,
    },
    {
      title: "Revenue Today",
      value: formatRupiah(todayRevenue),
      description: `${
        revenueData?.today?.count ?? 0
      } transaksi lunas hari ini`,
      icon: Wallet,
    },
  ];

  const revenueMetrics = [
    {
      title: "Pendapatan Hari Ini",
      subtitle: "Hari Ini",
      value: formatRupiah(todayRevenue),
      count:
        revenueData?.today?.count ?? 0,
      icon: Calendar,
      badgeColor:
        "bg-emerald-500/10 text-emerald-600 border-emerald-200",
    },
    {
      title: `Pendapatan Bulan Ini (${
        revenueData?.month?.monthName ??
        "Bulan Ini"
      })`,
      subtitle:
        revenueData?.month?.monthName ??
        "Bulan Ini",
      value: formatRupiah(monthRevenue),
      count:
        revenueData?.month?.count ?? 0,
      icon: CalendarDays,
      badgeColor:
        "bg-blue-500/10 text-blue-600 border-blue-200",
    },
    {
      title: `Pendapatan Tahun Ini (${
        revenueData?.year?.year ??
        today.getFullYear()
      })`,
      subtitle: `Tahun ${
        revenueData?.year?.year ??
        today.getFullYear()
      }`,
      value: formatRupiah(yearRevenue),
      count:
        revenueData?.year?.count ?? 0,
      icon: CalendarRange,
      badgeColor:
        "bg-purple-500/10 text-purple-600 border-purple-200",
    },
    {
      title: "Pendapatan Keseluruhan",
      subtitle: "All-Time Lifetime",
      value: formatRupiah(allTimeRevenue),
      count:
        revenueData?.allTime?.count ?? 0,
      icon: Coins,
      badgeColor:
        "bg-orange-500/10 text-orange-600 border-orange-200",
    },
  ];

  return (
    <div className="space-y-6">
      {/* OPERATIONAL SUMMARY */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {operationalData.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {item.title}
                </CardTitle>

                <div className="rounded-lg bg-primary/10 p-2">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>

              <CardContent>
                <div className="text-2xl font-bold">
                  {item.value}
                </div>

                <div className="mt-2 flex items-center gap-1 text-xs">
                  <TrendingUp className="h-3.5 w-3.5 text-green-600" />

                  <span className="text-muted-foreground">
                    {item.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* REVENUE OVERVIEW */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              Laporan Pendapatan
            </h3>

            <p className="text-xs text-muted-foreground">
              Statistik agregasi pendapatan real-time per periode
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {revenueMetrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <Card
                key={metric.title}
                className="relative overflow-hidden border-border/70 shadow-sm transition-all hover:border-primary/30"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {metric.subtitle}
                  </span>

                  <div
                    className={`rounded-lg border p-2 ${metric.badgeColor}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                </CardHeader>

                <CardContent className="space-y-1">
                  <div className="text-2xl font-extrabold tracking-tight text-foreground">
                    {metric.value}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {metric.count}
                    </span>{" "}
                    transaksi lunas
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}