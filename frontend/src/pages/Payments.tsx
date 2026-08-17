import { useEffect, useState } from "react";
import { Eye, CreditCard, Banknote, Wallet } from "lucide-react";

import { getPayments } from "@/services/payment.service";
import type { Payment } from "@/types/payment";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);

        const response = await getPayments(page, 10);

        console.log("PAYMENT RESPONSE:", response.data);

        setPayments(response.data.data.data);
        setTotalPages(response.data.data.pagination.totalPages);
      } catch (error) {
        console.error(error);
        setError("Payment data failed to fetch.");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [page]);

  const handleViewDetail = (payment: Payment) => {
    setSelectedPayment(payment);
    setDetailOpen(true);
  };

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(value));
  };

  const totalRevenue = payments.reduce(
    (total, payment) =>
      total + Number(payment.amount_received) - Number(payment.change_amount),
    0,
  );

  const totalReceived = payments.reduce(
    (total, payment) => total + Number(payment.amount_received),
    0,
  );

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <p className="text-muted-foreground">Loading payments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>

        <p className="text-sm text-muted-foreground">
          Manage and monitor customer payments.
        </p>
      </div>

      {/* SUMMARY */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Payments
            </CardTitle>

            <CreditCard className="h-5 w-5 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>

            <p className="text-xs text-muted-foreground">
              Successful transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Received
            </CardTitle>

            <Banknote className="h-5 w-5 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalReceived)}
            </div>

            <p className="text-xs text-muted-foreground">
              Money received from customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>

            <Wallet className="h-5 w-5 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalRevenue)}
            </div>

            <p className="text-xs text-muted-foreground">Net payment value</p>
          </CardContent>
        </Card>
      </div>

      {/* PAYMENT TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
        </CardHeader>

        <CardContent>
          {payments.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No payment transactions found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Payment</TableHead>

                    <TableHead>Order</TableHead>

                    <TableHead>Customer</TableHead>

                    <TableHead>Vehicle</TableHead>

                    <TableHead>Amount</TableHead>

                    <TableHead>Method</TableHead>

                    <TableHead>Status</TableHead>

                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {payments.map((payment) => {
                    const order = payment.orders;

                    return (
                      <TableRow key={payment.id}>
                        {/* PAYMENT */}
                        <TableCell className="font-medium">
                          #{payment.id}
                        </TableCell>

                        {/* ORDER */}
                        <TableCell>#{order.id}</TableCell>

                        {/* CUSTOMER */}
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {order.customers.name}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {order.customers.phone ?? "-"}
                            </p>
                          </div>
                        </TableCell>

                        {/* VEHICLE */}
                        <TableCell>
                          <div>
                            <p className="font-medium">
                              {order.vehicles.plate_number}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {order.vehicles.brand} {order.vehicles.model}
                            </p>
                          </div>
                        </TableCell>

                        {/* AMOUNT */}
                        <TableCell className="font-medium">
                          {formatCurrency(
                            Number(payment.amount_received) -
                              Number(payment.change_amount),
                          )}
                        </TableCell>

                        {/* METHOD */}
                        <TableCell>
                          <Badge variant="outline">
                            {payment.payment_method}
                          </Badge>
                        </TableCell>

                        {/* STATUS */}
                        <TableCell>
                          <Badge className="border-green-200 bg-green-50 text-green-700 hover:bg-green-50">
                            Paid
                          </Badge>
                        </TableCell>

                        {/* ACTION */}
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetail(payment)}
                          >
                            <Eye className="h-4 w-4" />

                            <span className="sr-only">View payment</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between border-t pt-4">
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
          )}
        </CardContent>
      </Card>

      {/* DETAIL DIALOG */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          {selectedPayment && (
            <>
              <DialogHeader>
                <DialogTitle>Payment #{selectedPayment.id}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                {/* ORDER INFO */}
                <div className="rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Order</p>

                      <p className="text-lg font-semibold">
                        #{selectedPayment.orders.id}
                      </p>
                    </div>

                    <Badge className="border-green-200 bg-green-50 text-green-700 hover:bg-green-50">
                      Paid
                    </Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Customer</p>

                      <p className="text-sm font-medium">
                        {selectedPayment.orders.customers.name}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Vehicle</p>

                      <p className="text-sm font-medium">
                        {selectedPayment.orders.vehicles.plate_number}
                      </p>
                    </div>
                  </div>
                </div>

                {/* SERVICES */}
                <div>
                  <h3 className="mb-3 text-sm font-semibold">Services</h3>

                  <div className="space-y-3">
                    {selectedPayment.orders.order_items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium">{item.services.name}</p>

                          <p className="text-xs text-muted-foreground">
                            {item.qty} × {formatCurrency(item.services.price)}
                          </p>
                        </div>

                        <p className="font-medium">
                          {formatCurrency(item.subtotal)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PAYMENT INFO */}
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total</span>

                      <span className="font-semibold">
                        {formatCurrency(
                          selectedPayment.orders.order_items.reduce(
                            (total, item) => total + Number(item.subtotal),
                            0,
                          ),
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Amount Received
                      </span>

                      <span>
                        {formatCurrency(selectedPayment.amount_received)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Change</span>

                      <span>
                        {formatCurrency(selectedPayment.change_amount)}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Payment Method
                      </span>

                      <Badge variant="outline">
                        {selectedPayment.payment_method}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
