import { useEffect, useState } from "react";
import { getOrders } from "@/services/order.service";
import type { Order } from "@/types/order";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const formatDate = (date: string | null) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

useEffect(() => {
  let cancelled = false;

  const loadOrders = async () => {
    try {
      setLoading(true);

      const response = await getOrders(page, 10);

      if (cancelled) return;

      setOrders(response.data.data.data);
      setTotalPages(response.data.data.pagination.totalPages);
      setError(null);
    } catch (error) {
      if (cancelled) return;

      console.error(error);
      setError("Failed to fetch order history.");
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  loadOrders();

  return () => {
    cancelled = true;
  };
}, [page]);

  const filteredOrders = orders.filter((order) => {
    const keyword = search.toLowerCase();

    const customerName = order.customers?.name?.toLowerCase() ?? "";

    const plateNumber = order.vehicles?.plate_number?.toLowerCase() ?? "";

    const orderId = order.id.toString();

    const matchesSearch =
      customerName.includes(keyword) ||
      plateNumber.includes(keyword) ||
      orderId.includes(keyword);

    const matchesService =
      serviceFilter === "All" || order.service_status === serviceFilter;

    const matchesPayment =
      paymentFilter === "All" || order.payment_status === paymentFilter;

    return matchesSearch && matchesService && matchesPayment;
  });

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-muted-foreground">Loading order history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Order History</h1>

        <p className="text-sm text-muted-foreground">
          View all customer order history.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search customer, vehicle, or order ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="h-10 rounded-md border bg-background px-3 text-sm"
        >
          <option value="All">All Services</option>
          <option value="Waiting">Waiting</option>
          <option value="Washing">Washing</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="h-10 rounded-md border bg-background px-3 text-sm"
        >
          <option value="All">All Payments</option>
          <option value="Paid">Paid</option>
          <option value="Unpaid">Unpaid</option>
        </select>
      </div>

      {/* TABLE */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No order history found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => {
                    const total =
                      order.order_items?.reduce((sum, item) => {
                        return sum + Number(item.subtotal ?? 0);
                      }, 0) ?? 0;

                    return (
                      <TableRow key={order.id}>
                        {/* ID */}
                        <TableCell className="font-medium">
                          #{order.id}
                        </TableCell>

                        <TableCell>{formatDate(order.order_date)}</TableCell>
                        {/* CUSTOMER */}
                        <TableCell>{order.customers?.name ?? "-"}</TableCell>

                        {/* VEHICLE */}
                        <TableCell>
                          {order.vehicles?.plate_number ?? "-"}
                        </TableCell>

                        {/* SERVICE */}
                        <TableCell>
                          <div className="space-y-1">
                            {order.order_items?.map((item) => (
                              <div key={item.id} className="text-sm">
                                {item.services?.name ?? "-"}{" "}
                                <span className="text-muted-foreground">
                                  × {item.qty}
                                </span>
                              </div>
                            ))}
                          </div>
                        </TableCell>

                        {/* TOTAL */}
                        <TableCell className="font-semibold">
                          Rp {total.toLocaleString("id-ID")}
                        </TableCell>

                        {/* SERVICE STATUS */}
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

                        {/* PAYMENT */}
                        <TableCell>
                          <Badge
                            className={
                              order.payment_status === "Paid"
                                ? "border-green-200 bg-green-100 text-green-800 hover:bg-green-100"
                                : "border-red-200 bg-red-100 text-red-800 hover:bg-red-100"
                            }
                          >
                            {order.payment_status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            <div className="mt-4 flex items-center justify-between">
  <p className="text-sm text-muted-foreground">
    Page {page} of {totalPages}
  </p>

  <div className="flex gap-2">
    <Button
      variant="outline"
      size="sm"
      disabled={page === 1}
      onClick={() => setPage((prev) => prev - 1)}
    >
      Previous
    </Button>

    <Button
      variant="outline"
      size="sm"
      disabled={page === totalPages}
      onClick={() => setPage((prev) => prev + 1)}
    >
      Next
    </Button>
  </div>
</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
