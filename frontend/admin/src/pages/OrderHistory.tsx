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

const serviceStatusLabels: Record<string, string> = {
  WAITING: "Waiting",
  CONFIRMED: "Confirmed",
  IN_PROGRESS: "Washing",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const paymentStatusLabels: Record<string, string> = {
  PAID: "Paid",
  UNPAID: "Unpaid",
};

const getServiceStatusClass = (status: string) => {
  switch (status) {
    case "WAITING":
      return "border-yellow-200 bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    case "CONFIRMED":
      return "border-purple-200 bg-purple-100 text-purple-800 hover:bg-purple-100";
    case "IN_PROGRESS":
      return "border-blue-200 bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "COMPLETED":
      return "border-green-200 bg-green-100 text-green-800 hover:bg-green-100";
    case "CANCELLED":
      return "border-red-200 bg-red-100 text-red-800 hover:bg-red-100";
    default:
      return "";
  }
};

const getPaymentStatusClass = (status: string) => {
  switch (status) {
    case "PAID":
      return "border-green-200 bg-green-100 text-green-800 hover:bg-green-100";
    case "UNPAID":
      return "border-red-200 bg-red-100 text-red-800 hover:bg-red-100";
    default:
      return "";
  }
};

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let cancelled = false;

    const loadOrders = async () => {
      try {
        setLoading(true);

        const response = await getOrders(page, 10);

        if (cancelled) {
          return;
        }

        const responseData = response.data.data;

        setOrders(responseData.orders ?? []);
        setTotalPages(responseData.pagination?.totalPages ?? 1);
        setError(null);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("ORDER HISTORY ERROR:", error);
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

  const handleServiceFilterChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setServiceFilter(event.target.value);
    setPage(1);
  };

  const handlePaymentFilterChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setPaymentFilter(event.target.value);
    setPage(1);
  };

  const filteredOrders = orders.filter((order) => {
    const keyword = search.trim().toLowerCase();

    const customerName = order.customers?.name?.toLowerCase() ?? "";
    const customerPhone = order.customers?.phone?.toLowerCase() ?? "";
    const plateNumber = order.vehicles?.plate_number?.toLowerCase() ?? "";
    const brand = order.vehicles?.brand?.toLowerCase() ?? "";
    const model = order.vehicles?.model?.toLowerCase() ?? "";
    const orderId = String(order.id);

    const serviceStatus = order.service_status ?? "";
    const paymentStatus = order.payment_status ?? "";

    const matchesSearch =
      keyword === "" ||
      customerName.includes(keyword) ||
      customerPhone.includes(keyword) ||
      plateNumber.includes(keyword) ||
      brand.includes(keyword) ||
      model.includes(keyword) ||
      orderId.includes(keyword);

    const matchesService =
      serviceFilter === "All" || serviceStatus === serviceFilter;

    const matchesPayment =
      paymentFilter === "All" || paymentStatus === paymentFilter;

    return matchesSearch && matchesService && matchesPayment;
  });

  const formatDate = (date: string | null) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (value: number) => {
    return `Rp ${value.toLocaleString("id-ID")}`;
  };

  const getOrderTotal = (order: Order) => {
    return (
      order.order_items?.reduce((sum, item) => {
        return sum + Number(item.subtotal ?? 0);
      }, 0) ?? 0
    );
  };

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
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-sm"
        />

        <select
          value={serviceFilter}
          onChange={handleServiceFilterChange}
          className="h-10 rounded-md border bg-background px-3 text-sm"
        >
          <option value="All">All Services</option>
          <option value="WAITING">Waiting</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="IN_PROGRESS">Washing</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <select
          value={paymentFilter}
          onChange={handlePaymentFilterChange}
          className="h-10 rounded-md border bg-background px-3 text-sm"
        >
          <option value="All">All Payments</option>
          <option value="PAID">Paid</option>
          <option value="UNPAID">Unpaid</option>
        </select>
      </div>

      <Card>
        <CardContent className="pt-6">
          {filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No order history found.
            </div>
          ) : (
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
                  {filteredOrders.map((order) => {
                    const total = getOrderTotal(order);
                    const serviceStatus = order.service_status ?? "";
                    const paymentStatus = order.payment_status ?? "";

                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          #{order.id}
                        </TableCell>

                        <TableCell>{formatDate(order.order_date)}</TableCell>

                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {order.customers?.name ?? "-"}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {order.customers?.phone ?? "-"}
                            </p>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {order.vehicles?.plate_number ?? "-"}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {order.vehicles?.brand ?? ""}{" "}
                              {order.vehicles?.model ?? ""}
                            </p>
                          </div>
                        </TableCell>

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

                        <TableCell className="font-semibold">
                          {formatCurrency(total)}
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={getServiceStatusClass(serviceStatus)}
                          >
                            {(serviceStatusLabels[serviceStatus] ??
                              serviceStatus) ||
                              "-"}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={getPaymentStatusClass(paymentStatus)}
                          >
                            {(paymentStatusLabels[paymentStatus] ??
                              paymentStatus) ||
                              "-"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="mt-4 flex items-center justify-between border-t pt-4">
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
                    disabled={page >= totalPages}
                    onClick={() => setPage((prev) => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
