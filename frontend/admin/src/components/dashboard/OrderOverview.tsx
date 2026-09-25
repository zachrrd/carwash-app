import { useEffect, useState } from "react";

import { getOrders } from "@/services/order.service";
import type { Order } from "@/types/order";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

const chartConfig = {
  orders: {
    label: "Orders",
  },
};

export default function OrderOverview() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getOrders();

        const orderList =
          response.data.data.orders ||
          (response.data.data as any).data ||
          [];
        setOrders(orderList);
      } catch (error) {
        console.error("Failed to fetch order overview:", error);
      }
    };

    fetchOrders();
  }, []);

  // ==========================================
  // LAST 7 DAYS
  // ==========================================

  const today = new Date();

  const data = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);

    date.setDate(today.getDate() - (6 - index));

    const day = date.toLocaleDateString("en-US", {
      weekday: "short",
    });

    const ordersCount = orders.filter((order) => {
      if (!order.order_date) return false;
      const orderDate = new Date(order.order_date);

      return (
        orderDate.getDate() === date.getDate() &&
        orderDate.getMonth() === date.getMonth() &&
        orderDate.getFullYear() === date.getFullYear()
      );
    }).length;

    return {
      day,
      orders: ordersCount,
    };
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Order Overview</CardTitle>

        <CardDescription>
          Number of orders during the last 7 days.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-70 w-full">
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />

            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

            <Area
              dataKey="orders"
              type="natural"
              fill="var(--primary)"
              fillOpacity={0.15}
              stroke="var(--primary)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
