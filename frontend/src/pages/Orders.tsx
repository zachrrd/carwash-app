import {
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
} from "@/services/order.service";

import { getCustomers } from "@/services/customer.service";
import { getVehicles } from "@/services/vehicle.service";
import { getService } from "@/services/service.service";
import { getStaffs } from "@/services/staff.service";

import type { Order } from "@/types/order";
import type { Customer } from "@/types/customer";
import type { Vehicle } from "@/types/vehicle";
import type { Service } from "@/types/service";
import type { Staff } from "@/types/staff";

import { createPayment } from "@/services/payment.service";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import {
  Plus,
  Pencil,
  Trash2,
  Car,
  User,
  UserRound,
  Package,
  Minus,
  X,
} from "lucide-react";

type OrderItemForm = {
  service_id: number;
  qty: number;
};

const formatRupiah = (value: number) => {
  return `Rp ${value.toLocaleString("id-ID")}`;
};

export default function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [staffs, setStaffs] = useState<Staff[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [customerId, setCustomerId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [staffId, setStaffId] = useState("");

  const [serviceId, setServiceId] = useState("");
  const [orderItems, setOrderItems] = useState<OrderItemForm[]>([]);

  const [serviceStatus, setServiceStatus] = useState("Waiting");
  const [checkInTime, setCheckInTime] = useState("");

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const [editItems, setEditItems] = useState<OrderItemForm[]>([]);
  const [editServiceId, setEditServiceId] = useState("");

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);

  const [amountReceived, setAmountReceived] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  const fetchData = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const [
        orderResponse,
        customerResponse,
        vehicleResponse,
        serviceResponse,
        staffResponse,
      ] = await Promise.all([
        getOrders(page, 10),
        getCustomers(1, 100),
        getVehicles(1, 100),
        getService(1, 100),
        getStaffs(1, 100),
      ]);

      setOrders(orderResponse.data.data.data);
      setTotalPages(orderResponse.data.data.pagination.totalPages);

      setCustomers(customerResponse.data.data.customers);
      setVehicles(vehicleResponse.data.data.vehicles);
      setServices(serviceResponse.data.data.services);
      setStaffs(staffResponse.data.data.staffs);
    } catch (error) {
      console.error(error);
      setError("Failed to fetch order data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchData(page);
    };

    loadData();
  }, [page]);

  const availableVehicles = useMemo(() => {
    if (!customerId) {
      return [];
    }

    return vehicles.filter(
      (vehicle) => vehicle.customer_id === Number(customerId),
    );
  }, [vehicles, customerId]);

  const activeStaffs = useMemo(() => {
    return staffs.filter((staff) => staff.status === "Active");
  }, [staffs]);

  const activeServices = useMemo(() => {
    return services.filter((service) => service.status === "Active");
  }, [services]);

  const orderTotal = useMemo(() => {
    return orderItems.reduce((total, item) => {
      const service = services.find(
        (service) => service.id === item.service_id,
      );

      if (!service) {
        return total;
      }

      return total + Number(service.price) * item.qty;
    }, 0);
  }, [orderItems, services]);

  const editTotal = useMemo(() => {
    return editItems.reduce((total, item) => {
      const service = services.find(
        (service) => service.id === item.service_id,
      );

      if (!service) {
        return total;
      }

      return total + Number(service.price) * item.qty;
    }, 0);
  }, [editItems, services]);

  const resetForm = () => {
    setCustomerId("");
    setVehicleId("");
    setStaffId("");
    setServiceId("");
    setOrderItems([]);
    setServiceStatus("Waiting");
    setCheckInTime("");
  };

  const handleOpenPayment = (order: Order) => {
    setPaymentOrder(order);
    setAmountReceived("");
    setPaymentMethod("Cash");
    setPaymentOpen(true);
  };

  const getOrderTotal = (order: Order) => {
    return (
      order.order_items?.reduce((total, item) => {
        return total + Number(item.services?.price ?? 0) * (item.qty ?? 1);
      }, 0) ?? 0
    );
  };

  const handlePayment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!paymentOrder) {
      return;
    }

    const received = Number(amountReceived);
    const total = getOrderTotal(paymentOrder);

    if (received < total) {
      toast.error("Amount received is not enough.");
      return;
    }

    setPaymentSubmitting(true);

    try {
      const response = await createPayment({
        order_id: paymentOrder.id,
        amount_received: received,
        payment_method: paymentMethod,
      });

      const invoice = response.data.data.invoice;

      await fetchData(page);

      setPaymentOpen(false);
      setPaymentOrder(null);
      setAmountReceived("");
      setPaymentMethod("Cash");

      toast.success("Payment completed successfully.");

      if (invoice?.id) {
        navigate(`/invoices/${invoice.id}`);
      }
    } catch (error) {
      console.error("PAYMENT ERROR:", error);
      toast.error("Failed to process payment.");
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const handleCustomerChange = (value: string) => {
    setCustomerId(value);
    setVehicleId("");
  };

  const handleAddService = () => {
    if (!serviceId) {
      return;
    }

    const id = Number(serviceId);

    const existingItem = orderItems.find((item) => item.service_id === id);

    if (existingItem) {
      setOrderItems((prev) =>
        prev.map((item) =>
          item.service_id === id
            ? {
                ...item,
                qty: item.qty + 1,
              }
            : item,
        ),
      );
    } else {
      setOrderItems((prev) => [
        ...prev,
        {
          service_id: id,
          qty: 1,
        },
      ]);
    }

    setServiceId("");
  };

  const handleRemoveService = (serviceId: number) => {
    setOrderItems((prev) =>
      prev.filter((item) => item.service_id !== serviceId),
    );
  };

  const updateServiceQty = (serviceId: number, amount: number) => {
    setOrderItems((prev) =>
      prev.map((item) => {
        if (item.service_id !== serviceId) {
          return item;
        }

        const newQty = item.qty + amount;

        return {
          ...item,
          qty: Math.max(1, newQty),
        };
      }),
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!customerId || !vehicleId) {
      toast.error("Customer and vehicle are required.");
      return;
    }

    if (orderItems.length === 0) {
      toast.error("Please add at least one service.");
      return;
    }
    setSubmitting(true);

    try {
      const payload = {
        customer_id: Number(customerId),
        vehicle_id: Number(vehicleId),
        staff_id: staffId ? Number(staffId) : null,
        service_status: serviceStatus,
        check_in_time: checkInTime || null,
        items: orderItems.map((item) => ({
          service_id: item.service_id,
          qty: item.qty,
        })),
      };

      await createOrder(payload);

      await fetchData(page);

      resetForm();
      setOpen(false);
      toast.success("Order created successfully.");
    } catch (error) {
      console.error("CREATE ORDER ERROR:", error);
      toast.error("Failed to create order.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteOrder(id);

      setOrders((prev) => prev.filter((order) => order.id !== id));

      setDeleteOpen(false);
      setDeleteId(null);

      toast.success("Order deleted successfully.");
    } catch (error) {
      console.error("DELETE ORDER ERROR:", error);
      toast.error("Failed to delete order.");
    }
  };

  const handleEdit = (order: Order) => {
    if (order.payment_status === "Paid") {
      toast.error("Order yang sudah dibayar tidak dapat diubah.");
      return;
    }

    setEditOrder(order);

    setEditItems(
      order.order_items?.map((item) => ({
        service_id: item.service_id,
        qty: item.qty,
      })) ?? [],
    );

    setEditServiceId("");
    setEditOpen(true);
  };

  const handleAddEditService = () => {
    if (!editServiceId) {
      return;
    }

    const id = Number(editServiceId);

    const existingItem = editItems.find((item) => item.service_id === id);

    if (existingItem) {
      setEditItems((prev) =>
        prev.map((item) =>
          item.service_id === id
            ? {
                ...item,
                qty: item.qty + 1,
              }
            : item,
        ),
      );
    } else {
      setEditItems((prev) => [
        ...prev,
        {
          service_id: id,
          qty: 1,
        },
      ]);
    }

    setEditServiceId("");
  };

  const handleRemoveEditService = (serviceId: number) => {
    setEditItems((prev) =>
      prev.filter((item) => item.service_id !== serviceId),
    );
  };

  const updateEditServiceQty = (serviceId: number, amount: number) => {
    setEditItems((prev) =>
      prev.map((item) => {
        if (item.service_id !== serviceId) {
          return item;
        }

        return {
          ...item,
          qty: Math.max(1, item.qty + amount),
        };
      }),
    );
  };

  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editOrder) {
      return;
    }

    if (editOrder.payment_status === "Paid") {
      toast.error("Order yang sudah dibayar tidak dapat diubah.");
      return;
    }

    if (editItems.length === 0) {
      toast.error("Order must have at least one service.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        customer_id: editOrder.customer_id,
        vehicle_id: editOrder.vehicle_id,
        staff_id: editOrder.staff_id,
        service_status: editOrder.service_status ?? "Waiting",
        check_in_time: editOrder.check_in_time ?? null,
        items: editItems.map((item) => ({
          service_id: item.service_id,
          qty: item.qty,
        })),
      };

      console.log("UPDATE PAYLOAD:", payload);

      const response = await updateOrder(editOrder.id, payload);

      console.log("UPDATE RESPONSE:", response.data);

      setEditOpen(false);
      setEditOrder(null);
      setEditItems([]);

      await fetchData(page);
      toast.success("Order updated successfully.");
    } catch (error) {
      console.error("UPDATE ERROR:", error);
      toast.error("Failed to update order.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-muted-foreground">Loading orders...</div>
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>

          <p className="text-sm text-muted-foreground">
            Manage customer orders and car wash services.
          </p>
        </div>

        <Dialog
          open={open}
          onOpenChange={(value) => {
            setOpen(value);

            if (!value) {
              resetForm();
            }
          }}
        >
          <Button onClick={() => setOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Order
          </Button>

          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">Create New Order</DialogTitle>

              <p className="text-sm text-muted-foreground">
                Select customer, vehicle, staff and services.
              </p>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Customer</label>

                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <select
                      value={customerId}
                      onChange={(e) => handleCustomerChange(e.target.value)}
                      className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm"
                      required
                    >
                      <option value="">Select customer</option>

                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Vehicle</label>

                  <div className="relative">
                    <Car className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <select
                      value={vehicleId}
                      onChange={(e) => setVehicleId(e.target.value)}
                      disabled={!customerId}
                      className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="">
                        {!customerId
                          ? "Select customer first"
                          : availableVehicles.length === 0
                            ? "No vehicle found"
                            : "Select vehicle"}
                      </option>

                      {availableVehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.plate_number} - {vehicle.brand}{" "}
                          {vehicle.model}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Staff</label>

                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <select
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm"
                  >
                    <option value="">No staff assigned</option>

                    {activeStaffs.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Package className="h-4 w-4" />
                    Services
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <select
                      value={serviceId}
                      onChange={(e) => setServiceId(e.target.value)}
                      className="h-10 flex-1 rounded-md border bg-background px-3 text-sm"
                    >
                      <option value="">Select service</option>

                      {activeServices
                        .filter(
                          (service) =>
                            !orderItems.some(
                              (item) => item.service_id === service.id,
                            ),
                        )
                        .map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name} —{" "}
                            {formatRupiah(Number(service.price))}
                          </option>
                        ))}
                    </select>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddService}
                      disabled={!serviceId}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {orderItems.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-6 text-center">
                      <Package className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />

                      <p className="text-sm font-medium">No services added</p>

                      <p className="text-xs text-muted-foreground">
                        Select a service above to add it to this order.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {orderItems.map((item) => {
                        const service = services.find(
                          (service) => service.id === item.service_id,
                        );

                        if (!service) {
                          return null;
                        }

                        const subtotal = Number(service.price) * item.qty;

                        return (
                          <div
                            key={item.service_id}
                            className="flex items-center gap-3 rounded-lg border p-3"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {service.name}
                              </p>

                              <p className="text-xs text-muted-foreground">
                                {formatRupiah(Number(service.price))} / service
                              </p>
                            </div>

                            <div className="flex items-center rounded-md border">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  updateServiceQty(item.service_id, -1)
                                }
                              >
                                <Minus className="h-3 w-3" />
                              </Button>

                              <span className="w-8 text-center text-sm">
                                {item.qty}
                              </span>

                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  updateServiceQty(item.service_id, 1)
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>

                            <div className="w-28 text-right">
                              <p className="text-sm font-semibold">
                                {formatRupiah(subtotal)}
                              </p>
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() =>
                                handleRemoveService(item.service_id)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-center justify-between border-t pt-4">
                    <span className="font-medium">Total</span>

                    <span className="text-xl font-bold">
                      {formatRupiah(orderTotal)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <label className="text-sm font-medium">Service Status</label>

                <select
                  value={serviceStatus}
                  onChange={(e) => setServiceStatus(e.target.value)}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="Waiting">Waiting</option>

                  <option value="Washing">Washing</option>

                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Check In Time</label>

                <Input
                  type="time"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setOpen(false);
                  }}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={
                    submitting ||
                    !customerId ||
                    !vehicleId ||
                    orderItems.length === 0
                  }
                >
                  {submitting ? "Creating..." : "Create Order"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Order List</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-8 w-8 text-muted-foreground" />

                        <p className="font-medium">No orders yet</p>

                        <p className="text-sm text-muted-foreground">
                          Create your first order.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => {
                    const total =
                      order.order_items?.reduce((sum, item) => {
                        const service = services.find(
                          (service) => service.id === item.service_id,
                        );

                        return sum + Number(service?.price ?? 0) * item.qty;
                      }, 0) ?? 0;

                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          #{order.id}
                        </TableCell>

                        <TableCell>
                          {order.customers?.name ??
                            customers.find(
                              (customer) => customer.id === order.customer_id,
                            )?.name ??
                            "-"}
                        </TableCell>

                        <TableCell>
                          {order.vehicles
                            ? `${order.vehicles.plate_number} - ${order.vehicles.brand}`
                            : (vehicles.find(
                                (vehicle) => vehicle.id === order.vehicle_id,
                              )?.plate_number ?? "-")}
                        </TableCell>

                        <TableCell>
                          {order.staffs?.name ??
                            staffs.find((staff) => staff.id === order.staff_id)
                              ?.name ??
                            "-"}
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            {order.order_items?.map((item) => (
                              <div key={item.id} className="text-sm">
                                {item.services?.name ??
                                  `Service #${item.service_id}`}{" "}
                                <span className="text-muted-foreground">
                                  × {item.qty}
                                </span>
                              </div>
                            ))}
                          </div>
                        </TableCell>

                        <TableCell className="font-semibold">
                          {formatRupiah(total)}
                        </TableCell>

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

                        <TableCell>
                          <div className="flex flex-wrap justify-end gap-2">
                            {order.payment_status !== "Paid" && (
                              <Button
                                size="sm"
                                onClick={() => handleOpenPayment(order)}
                              >
                                Pay
                              </Button>
                            )}

                            {order.payment_status !== "Paid" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(order)}
                              >
                                <Pencil className="mr-1 h-4 w-4" />
                                Edit
                              </Button>
                            )}

                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setDeleteId(order.id);
                                setDeleteOpen(true);
                              }}
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              Delete
                            </Button>

                            {order.payment_status === "Paid" &&
                              order.invoices &&
                              order.invoices.length > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const invoice =
                                      order.invoices?.[
                                        order.invoices.length - 1
                                      ];

                                    if (!invoice) {
                                      return;
                                    }

                                    navigate(`/invoices/${invoice.id}`);
                                  }}
                                >
                                  Invoice
                                </Button>
                              )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
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
                disabled={page === totalPages}
                onClick={() => setPage((prev) => prev + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Order?</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This action cannot be undone. The order and its related items will
              be deleted.
            </p>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>

              <Button
                variant="destructive"
                onClick={() => {
                  if (deleteId !== null) {
                    handleDelete(deleteId);
                  }
                }}
              >
                Delete Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Order</DialogTitle>

            <p className="text-sm text-muted-foreground">
              Update customer, vehicle, services and order status.
            </p>
          </DialogHeader>

          {editOrder && (
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Customer</label>

                  <select
                    value={editOrder.customer_id}
                    onChange={(e) => {
                      const newCustomerId = Number(e.target.value);

                      const firstVehicle = vehicles.find(
                        (vehicle) => vehicle.customer_id === newCustomerId,
                      );

                      setEditOrder({
                        ...editOrder,
                        customer_id: newCustomerId,
                        vehicle_id: firstVehicle?.id ?? 0,
                      });
                    }}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Vehicle</label>

                  <select
                    value={editOrder.vehicle_id}
                    onChange={(e) =>
                      setEditOrder({
                        ...editOrder,
                        vehicle_id: Number(e.target.value),
                      })
                    }
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    {vehicles
                      .filter(
                        (vehicle) =>
                          vehicle.customer_id === editOrder.customer_id,
                      )
                      .map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.plate_number} - {vehicle.brand}{" "}
                          {vehicle.model}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Staff</label>

                <select
                  value={editOrder.staff_id ?? ""}
                  onChange={(e) =>
                    setEditOrder({
                      ...editOrder,
                      staff_id: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">No staff assigned</option>

                  {activeStaffs.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name}
                    </option>
                  ))}
                </select>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Order Services</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <select
                      value={editServiceId}
                      onChange={(e) => setEditServiceId(e.target.value)}
                      className="h-10 flex-1 rounded-md border bg-background px-3 text-sm"
                    >
                      <option value="">Add another service</option>

                      {activeServices
                        .filter(
                          (service) =>
                            !editItems.some(
                              (item) => item.service_id === service.id,
                            ),
                        )
                        .map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name} —{" "}
                            {formatRupiah(Number(service.price))}
                          </option>
                        ))}
                    </select>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddEditService}
                      disabled={!editServiceId}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {editItems.map((item) => {
                      const service = services.find(
                        (service) => service.id === item.service_id,
                      );

                      if (!service) {
                        return null;
                      }

                      const subtotal = Number(service.price) * item.qty;

                      return (
                        <div
                          key={item.service_id}
                          className="flex items-center gap-3 rounded-lg border p-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {service.name}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              {formatRupiah(Number(service.price))} / service
                            </p>
                          </div>

                          <div className="flex items-center rounded-md border">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                updateEditServiceQty(item.service_id, -1)
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>

                            <span className="w-8 text-center text-sm">
                              {item.qty}
                            </span>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() =>
                                updateEditServiceQty(item.service_id, 1)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="w-28 text-right text-sm font-semibold">
                            {formatRupiah(subtotal)}
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() =>
                              handleRemoveEditService(item.service_id)
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between border-t pt-4">
                    <span className="font-medium">Total</span>

                    <span className="text-xl font-bold">
                      {formatRupiah(editTotal)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <label className="text-sm font-medium">Service Status</label>

                <select
                  value={editOrder.service_status ?? "Waiting"}
                  onChange={(e) =>
                    setEditOrder({
                      ...editOrder,
                      service_status: e.target.value,
                    })
                  }
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="Waiting">Waiting</option>

                  <option value="Washing">Washing</option>

                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Status</label>

                <div className="flex h-10 items-center rounded-md border bg-muted/40 px-3">
                  <Badge
                    className={
                      editOrder.payment_status === "Paid"
                        ? "border-green-200 bg-green-100 text-green-800 hover:bg-green-100"
                        : "border-red-200 bg-red-100 text-red-800 hover:bg-red-100"
                    }
                  >
                    {editOrder.payment_status ?? "Unpaid"}
                  </Badge>

                  <span className="ml-3 text-xs text-muted-foreground">
                    Payment status is managed through payment.
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Check In Time</label>

                <Input
                  type="time"
                  value={editOrder.check_in_time ?? ""}
                  onChange={(e) =>
                    setEditOrder({
                      ...editOrder,
                      check_in_time: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={
                    submitting ||
                    editItems.length === 0 ||
                    editOrder.payment_status === "Paid"
                  }
                >
                  {submitting ? "Updating..." : "Update Order"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handlePayment} className="space-y-5">
            <DialogHeader>
              <DialogTitle>Process Payment</DialogTitle>
            </DialogHeader>

            {paymentOrder && (
              <>
                <div className="rounded-lg border bg-muted/40 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Order</p>

                      <p className="font-semibold">#{paymentOrder.id}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Total</p>

                      <p className="text-xl font-bold">
                        {formatRupiah(getOrderTotal(paymentOrder))}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Services</p>

                  <div className="space-y-2">
                    {paymentOrder.order_items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span>
                          {item.services?.name ?? `Service #${item.service_id}`}{" "}
                          × {item.qty}
                        </span>

                        <span className="font-medium">
                          {formatRupiah(
                            Number(item.services?.price ?? 0) * (item.qty ?? 1),
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="paymentMethod"
                    className="text-sm font-medium"
                  >
                    Payment Method
                  </label>

                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full rounded-md border bg-background p-2"
                  >
                    <option value="Cash">Cash</option>

                    <option value="QRIS">QRIS</option>

                    <option value="Transfer">Transfer</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="amountReceived"
                    className="text-sm font-medium"
                  >
                    Amount Received
                  </label>

                  <Input
                    id="amountReceived"
                    type="number"
                    min={getOrderTotal(paymentOrder)}
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    placeholder="Enter amount"
                    required
                  />
                </div>

                {amountReceived &&
                  Number(amountReceived) >= getOrderTotal(paymentOrder) && (
                    <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Change</span>

                        <span className="text-lg font-bold text-green-600">
                          {formatRupiah(
                            Number(amountReceived) -
                              getOrderTotal(paymentOrder),
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    paymentSubmitting ||
                    !amountReceived ||
                    Number(amountReceived) < getOrderTotal(paymentOrder)
                  }
                >
                  {paymentSubmitting ? "Processing..." : "Complete Payment"}
                </Button>
              </>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
