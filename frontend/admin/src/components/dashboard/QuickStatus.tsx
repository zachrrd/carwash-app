import { Clock3, Droplets, CheckCircle2, CreditCard } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useEffect, useState } from "react";
import { getOrders } from "@/services/order.service";
import type { Order } from "@/types/order";

export default function QuickStatus() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getOrders();

        setOrders(response.data.data.data);
      } catch (error) {
        console.error("Failed to fetch quick status:", error);
      }
    };

    fetchOrders();
  }, []);

  // ==========================================
  // STATUS COUNTS
  // ==========================================

  const waiting = orders.filter(
    (order) => order.service_status === "WAITING",
  ).length;

  const washing = orders.filter(
    (order) => order.service_status === "WASHING",
  ).length;

  const completed = orders.filter(
    (order) => order.service_status === "COMPLETED",
  ).length;

  const unpaid = orders.filter(
    (order) => order.payment_status === "UNPAID",
  ).length;

  const statuses = [
    {
      label: "Waiting",
      value: waiting,
      icon: Clock3,
    },
    {
      label: "Washing",
      value: washing,
      icon: Droplets,
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCircle2,
    },
    {
      label: "Unpaid",
      value: unpaid,
      icon: CreditCard,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Status</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {statuses.map((status) => {
          const Icon = status.icon;

          return (
            <div
              key={status.label}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <Icon className="h-4 w-4" />
                </div>

                <span className="text-sm font-medium">{status.label}</span>
              </div>

              <span className="text-lg font-bold">{status.value}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
