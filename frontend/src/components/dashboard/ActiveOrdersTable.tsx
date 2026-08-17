import { ArrowRight, Badge } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useEffect, useState } from "react";
import { getOrders } from "@/services/order.service";
import type { Order } from "@/types/order";

export default function ActiveOrdersTable() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getOrders();

        setOrders(response.data.data.data);
      } catch (error) {
        console.error("Failed to fetch active orders:", error);
      }
    };

    fetchOrders();
  }, []);

  const activeOrders = orders
    .filter(
      (order) =>
        order.service_status === "Waiting" ||
        order.service_status === "Washing",
    )
    .sort((a, b) => {
      if (!a.order_date) return 1;
      if (!b.order_date) return -1;

      return (
        new Date(b.order_date).getTime() - new Date(a.order_date).getTime()
      );
    })
    .slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Active Orders</CardTitle>

          <CardDescription>
            Orders that are currently being processed.
          </CardDescription>
        </div>

        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => navigate("/orders")}
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {activeOrders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No active orders.
                  </TableCell>
                </TableRow>
              ) : (
                activeOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>

                    <TableCell>{order.customers?.name ?? "-"}</TableCell>

                    <TableCell>{order.vehicles?.plate_number ?? "-"}</TableCell>

                    <TableCell>
                      {order.order_items?.map((item) => (
                        <div key={item.id}>
                          {item.services?.name ?? `Service #${item.service_id}`}
                          {" × "}
                          {item.qty}
                        </div>
                      ))}
                    </TableCell>

                    <TableCell>{order.staffs?.name ?? "-"}</TableCell>

                    <TableCell>
                      <Badge
                        className={
                          order.service_status === "Waiting"
                            ? "border-yellow-200 bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                            : order.service_status === "Washing"
                              ? "border-blue-200 bg-blue-100 text-blue-800 hover:bg-blue-100"
                              : order.service_status === "Completed"
                                ? "border-green-200 bg-green-100 text-green-800 hover:bg-green-100"
                                : ""
                        }
                      >
                        {order.service_status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
