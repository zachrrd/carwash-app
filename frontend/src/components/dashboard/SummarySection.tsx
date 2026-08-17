import { Car, CheckCircle2, Droplets, Wallet, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useEffect, useState } from "react";
import { getOrders } from "@/services/order.service";
import type { Order } from "@/types/order";

const formatRupiah = (value: number) => {
  return `Rp ${value.toLocaleString("id-ID")}`;
};

export default function SummarySection() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getOrders();

        setOrders(response.data.data.data);
      } catch (error) {
        console.error("Failed to fetch dashboard orders:", error);
      }
    };

    fetchOrders();
  }, []);

  // ==========================================
  // TODAY'S ORDERS
  // ==========================================

  const today = new Date();

  const todayOrders = orders.filter((order) => {
    if (!order.order_date) return false;
    const orderDate = new Date(order.order_date);

    return (
      orderDate.getDate() === today.getDate() &&
      orderDate.getMonth() === today.getMonth() &&
      orderDate.getFullYear() === today.getFullYear()
    );
  });

  // ==========================================
  // WASHING NOW
  // ==========================================

  const washingNow = todayOrders.filter(
    (order) => order.service_status === "Washing",
  ).length;

  // ==========================================
  // COMPLETED
  // ==========================================

  const completed = todayOrders.filter(
    (order) => order.service_status === "Completed",
  ).length;

  // ==========================================
  // REVENUE
  // ==========================================

  const revenue = todayOrders
    .filter((order) => order.payment_status === "Paid")
    .reduce((total, order) => {
      const orderTotal =
        order.order_items?.reduce((sum, item) => {
          return sum + Number(item.subtotal ?? 0);
        }, 0) ?? 0;

      return total + orderTotal;
    }, 0);

  const summaryData = [
    {
      title: "Today's Orders",
      value: todayOrders.length,
      description: "Orders today",
      icon: Car,
    },
    {
      title: "Washing Now",
      value: washingNow,
      description: `${
        todayOrders.filter((order) => order.service_status === "Waiting").length
      } waiting`,
      icon: Droplets,
    },
    {
      title: "Completed",
      value: completed,
      description: "Completed today",
      icon: CheckCircle2,
    },
    {
      title: "Revenue Today",
      value: formatRupiah(revenue),
      description: "Paid orders today",
      icon: Wallet,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {summaryData.map((item) => {
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
              <div className="text-2xl font-bold">{item.value}</div>

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
  );
}
