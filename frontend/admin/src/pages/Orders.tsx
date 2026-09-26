import {
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
  cancelOrder,
} from "@/services/order.service";

import { getCustomers } from "@/services/customer.service";
import { getVehicles } from "@/services/vehicle.service";
import { getService } from "@/services/service.service";
import { getStaffs } from "@/services/staff.service";
import { createPayment } from "@/services/payment.service";

import type { Order, OrderStatus } from "@/types/order";
import type { Customer } from "@/types/customer";
import type { Vehicle } from "@/types/vehicle";
import type { Service } from "@/types/service";
import type { Staff } from "@/types/staff";
import type { PaymentMethod } from "@/types/payment";

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
  UserRound,
  Package,
  X,
  Check,
  Play,
  CircleCheck,
  Ban,
  Eye,
  CreditCard,
  Receipt,
  UserCheck,
  AlertCircle,
  Search,
  ChevronDown,
} from "lucide-react";

type OrderItemForm = {
  service_id: number;
  qty: number;
};

const formatRupiah = (value: number) => {
  return `Rp ${value.toLocaleString("id-ID")}`;
};

const getStatusLabel = (status: string | null | undefined) => {
  switch (status) {
    case "WAITING":
      return "Waiting";
    case "CONFIRMED":
      return "Confirmed";
    case "IN_PROGRESS":
      return "In Progress";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status ?? "-";
  }
};

const getOrderTotal = (order: Order) => {
  return (
    order.order_items?.reduce((total, item) => {
      const price = Number(item.services?.price ?? 0);
      const qty = item.qty ?? 1;

      return total + price * qty;
    }, 0) ?? 0
  );
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
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerDropdownOpen, setCustomerDropdownOpen] = useState(false);

  const [vehicleId, setVehicleId] = useState("");

  const [staffId, setStaffId] = useState("");
  const [staffSearch, setStaffSearch] = useState("");
  const [staffDropdownOpen, setStaffDropdownOpen] = useState(false);

  const [serviceId, setServiceId] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);

  const [orderItems, setOrderItems] = useState<OrderItemForm[]>([]);
  const [checkInTime, setCheckInTime] = useState("");
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [assignStaffOrder, setAssignStaffOrder] = useState<Order | null>(null);
  const [selectedAssignStaffId, setSelectedAssignStaffId] = useState("");
  const [assignStaffSearch, setAssignStaffSearch] = useState("");
  const [assignStaffDropdownOpen, setAssignStaffDropdownOpen] = useState(false);
  const [assignStaffOpen, setAssignStaffOpen] = useState(false);
  const [assignStaffSubmitting, setAssignStaffSubmitting] = useState(false);

  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editItems, setEditItems] = useState<OrderItemForm[]>([]);
  const [editServiceId, setEditServiceId] = useState("");
  const [editServiceSearch, setEditServiceSearch] = useState("");
  const [editServiceDropdownOpen, setEditServiceDropdownOpen] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [cancelId, setCancelId] = useState<number | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelSubmitting, setCancelSubmitting] = useState(false);

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
  const [amountReceived, setAmountReceived] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);

  const [statusSubmitting, setStatusSubmitting] = useState<number | null>(null);

  const fetchOrders = async (pageNumber = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getOrders(pageNumber, 10);
      const data = response.data.data;

      setOrders(data.orders || (data as any).data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      const [customerRes, vehicleRes, serviceRes, staffRes] = await Promise.all(
        [
          getCustomers(1, 100),
          getVehicles(1, 100),
          getService(1, 100),
          getStaffs(1, 100),
        ],
      );

      setCustomers(customerRes.data.data.customers || []);
      setVehicles(vehicleRes.data.data.vehicles || []);
      setServices(serviceRes.data.data.services || []);
      setStaffs(staffRes.data.data.staffs || []);
    } catch (err) {
      console.error("Failed to fetch master data:", err);
      setError("Failed to fetch master data.");
    }
  };

  useEffect(() => {
    void fetchOrders(page);
  }, [page]);

  useEffect(() => {
    void fetchMasterData();
  }, []);

  const availableVehicles = useMemo(() => {
    if (!customerId) return [];

    return vehicles.filter(
      (vehicle) => vehicle.customer_id === Number(customerId),
    );
  }, [vehicles, customerId]);

  const filteredCustomers = useMemo(() => {
    const keyword = customerSearch.trim().toLowerCase();

    if (!keyword) return customers;

    return customers.filter((customer) => {
      const name = customer.name?.toLowerCase() ?? "";
      const phone = customer.phone?.toLowerCase() ?? "";
      const email = customer.email?.toLowerCase() ?? "";

      return (
        name.includes(keyword) ||
        phone.includes(keyword) ||
        email.includes(keyword)
      );
    });
  }, [customers, customerSearch]);

  const activeStaffs = useMemo(() => {
    return staffs.filter((staff) => staff.status === "ACTIVE");
  }, [staffs]);

  const filteredStaffs = useMemo(() => {
    const keyword = staffSearch.trim().toLowerCase();

    if (!keyword) return activeStaffs;

    return activeStaffs.filter((staff) => {
      const name = staff.name?.toLowerCase() ?? "";
      const phone = staff.phone?.toLowerCase() ?? "";

      return name.includes(keyword) || phone.includes(keyword);
    });
  }, [activeStaffs, staffSearch]);

  const activeServices = useMemo(() => {
    return services.filter((service) => service.status === "ACTIVE");
  }, [services]);

  const filteredServices = useMemo(() => {
    const keyword = serviceSearch.trim().toLowerCase();

    const availableServices = activeServices.filter(
      (service) => !orderItems.some((item) => item.service_id === service.id),
    );

    if (!keyword) return availableServices;

    return availableServices.filter((service) => {
      const name = service.name?.toLowerCase() ?? "";

      return name.includes(keyword);
    });
  }, [activeServices, orderItems, serviceSearch]);

  const filteredEditServices = useMemo(() => {
    const keyword = editServiceSearch.trim().toLowerCase();

    const availableServices = activeServices.filter(
      (service) => !editItems.some((item) => item.service_id === service.id),
    );

    if (!keyword) return availableServices;

    return availableServices.filter((service) => {
      const name = service.name?.toLowerCase() ?? "";

      return name.includes(keyword);
    });
  }, [activeServices, editItems, editServiceSearch]);

  const filteredAssignStaffs = useMemo(() => {
    const keyword = assignStaffSearch.trim().toLowerCase();

    if (!keyword) return activeStaffs;

    return activeStaffs.filter((staff) => {
      const name = staff.name?.toLowerCase() ?? "";
      const phone = staff.phone?.toLowerCase() ?? "";

      return name.includes(keyword) || phone.includes(keyword);
    });
  }, [activeStaffs, assignStaffSearch]);

  const selectedCustomer = useMemo(() => {
    if (!customerId) return null;

    return (
      customers.find((customer) => customer.id === Number(customerId)) ?? null
    );
  }, [customers, customerId]);

  const selectedStaff = useMemo(() => {
    if (!staffId) return null;

    return staffs.find((staff) => staff.id === Number(staffId)) ?? null;
  }, [staffs, staffId]);

  const selectedService = useMemo(() => {
    if (!serviceId) return null;

    return services.find((service) => service.id === Number(serviceId)) ?? null;
  }, [services, serviceId]);

  const selectedAssignStaff = useMemo(() => {
    if (!selectedAssignStaffId) return null;

    return (
      staffs.find((staff) => staff.id === Number(selectedAssignStaffId)) ?? null
    );
  }, [staffs, selectedAssignStaffId]);

  const orderTotal = useMemo(() => {
    return orderItems.reduce((total, item) => {
      const service = services.find((s) => s.id === item.service_id);

      if (!service) return total;

      return total + Number(service.price);
    }, 0);
  }, [orderItems, services]);

  const editTotal = useMemo(() => {
    return editItems.reduce((total, item) => {
      const service = services.find((s) => s.id === item.service_id);

      if (!service) return total;

      return total + Number(service.price);
    }, 0);
  }, [editItems, services]);

  const resetForm = () => {
    setCustomerId("");
    setCustomerSearch("");
    setCustomerDropdownOpen(false);

    setVehicleId("");

    setStaffId("");
    setStaffSearch("");
    setStaffDropdownOpen(false);

    setServiceId("");
    setServiceSearch("");
    setServiceDropdownOpen(false);

    setOrderItems([]);
    setCheckInTime("");
  };

  const handleCustomerChange = (id: string) => {
    const customer = customers.find((item) => item.id === Number(id));

    setCustomerId(id);
    setVehicleId("");

    if (customer) {
      setCustomerSearch(customer.name);
    }

    setCustomerDropdownOpen(false);
  };

  const handleCustomerSearchChange = (value: string) => {
    setCustomerSearch(value);
    setCustomerDropdownOpen(true);
  };

  const handleStaffChange = (id: string) => {
    const staff = staffs.find((item) => item.id === Number(id));

    setStaffId(id);

    if (staff) {
      setStaffSearch(staff.name);
    }

    setStaffDropdownOpen(false);
  };

  const handleStaffSearchChange = (value: string) => {
    setStaffSearch(value);
    setStaffId("");
    setStaffDropdownOpen(true);
  };

  const handleServiceChange = (id: string) => {
    const service = services.find((item) => item.id === Number(id));

    setServiceId(id);

    if (service) {
      setServiceSearch(service.name);
    }

    setServiceDropdownOpen(false);
  };

  const handleServiceSearchChange = (value: string) => {
    setServiceSearch(value);
    setServiceId("");
    setServiceDropdownOpen(true);
  };

  const handleAddService = () => {
    if (!serviceId) return;

    const id = Number(serviceId);

    const existingItem = orderItems.find((item) => item.service_id === id);

    if (existingItem) {
      toast.info("This service is already added.");
      setServiceId("");
      return;
    }

    setOrderItems((prev) => [
      ...prev,
      {
        service_id: id,
        qty: 1,
      },
    ]);

    setServiceId("");
    setServiceSearch("");
    setServiceDropdownOpen(false);
  };

  const handleRemoveService = (sId: number) => {
    setOrderItems((prev) => prev.filter((item) => item.service_id !== sId));
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
        check_in_time: checkInTime || null,
        items: orderItems.map((item) => ({
          service_id: item.service_id,
          qty: 1,
        })),
      };

      await createOrder(payload);
      await fetchOrders(page);

      resetForm();
      setOpen(false);

      toast.success("Order created successfully.");
    } catch (err: any) {
      console.error("CREATE ORDER ERROR:", err);

      toast.error(err.response?.data?.message || "Failed to create order.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDetail = (order: Order) => {
    setDetailOrder(order);
    setDetailOpen(true);
  };

  const handleOpenAssignStaff = (order: Order) => {
    setAssignStaffOrder(order);
    setSelectedAssignStaffId(order.staff_id ? String(order.staff_id) : "");

    const currentStaff = staffs.find((staff) => staff.id === order.staff_id);

    setAssignStaffSearch(currentStaff?.name ?? "");
    setAssignStaffDropdownOpen(false);
    setAssignStaffOpen(true);
  };

  const handleAssignStaffSearchChange = (value: string) => {
    setAssignStaffSearch(value);
    setSelectedAssignStaffId("");
    setAssignStaffDropdownOpen(true);
  };

  const handleSelectAssignStaff = (staff: Staff) => {
    setSelectedAssignStaffId(String(staff.id));
    setAssignStaffSearch(staff.name);
    setAssignStaffDropdownOpen(false);
  };

  const handleSaveAssignStaff = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!assignStaffOrder) return;

    if (!selectedAssignStaffId) {
      toast.error("Please select a staff member.");
      return;
    }

    setAssignStaffSubmitting(true);

    try {
      const payload: any =
        assignStaffOrder.payment_status === "PAID"
          ? {
              staff_id: Number(selectedAssignStaffId),
            }
          : {
              customer_id: assignStaffOrder.customer_id,
              vehicle_id: assignStaffOrder.vehicle_id,
              staff_id: Number(selectedAssignStaffId),
              check_in_time: assignStaffOrder.check_in_time ?? null,
              items:
                assignStaffOrder.order_items?.map((item) => ({
                  service_id: item.service_id,
                  qty: 1,
                })) ?? [],
            };

      const res = await updateOrder(assignStaffOrder.id, payload);

      const updatedOrder = res.data.data;

      setOrders((prev) =>
        prev.map((o) => (o.id === assignStaffOrder.id ? updatedOrder : o)),
      );

      if (detailOrder?.id === assignStaffOrder.id) {
        setDetailOrder(updatedOrder);
      }

      setAssignStaffOpen(false);
      setAssignStaffOrder(null);
      setAssignStaffSearch("");
      setAssignStaffDropdownOpen(false);

      toast.success("Staff assigned successfully.");
    } catch (err: any) {
      console.error("ASSIGN STAFF ERROR:", err);

      toast.error(err.response?.data?.message || "Failed to assign staff.");
    } finally {
      setAssignStaffSubmitting(false);
    }
  };

  const handleStatusUpdate = async (order: Order, nextStatus: OrderStatus) => {
    if (statusSubmitting !== null) return;

    if (order.service_status === "COMPLETED") {
      toast.error("Completed order cannot be changed.");
      return;
    }

    if (order.service_status === "CANCELLED") {
      toast.error("Cancelled order cannot be changed.");
      return;
    }

    if (nextStatus === "CONFIRMED") {
      if (!order.staff_id) {
        toast.info("Please assign a staff before confirming the order.");

        handleOpenAssignStaff(order);
        return;
      }
    }

    if (nextStatus === "IN_PROGRESS") {
      if (!order.staff_id) {
        toast.info("Please assign a staff before starting service.");

        handleOpenAssignStaff(order);
        return;
      }

      if (order.payment_status !== "PAID") {
        toast.error("Order must be paid before service can start.");

        return;
      }
    }

    if (nextStatus === "COMPLETED") {
      if (order.service_status !== "IN_PROGRESS") {
        toast.error("Only in-progress orders can be completed.");

        return;
      }

      if (order.payment_status !== "PAID") {
        toast.error("Order must be paid before it can be completed.");

        return;
      }
    }

    setStatusSubmitting(order.id);

    try {
      await updateOrderStatus(order.id, {
        service_status: nextStatus,
      });

      await fetchOrders(page);

      if (detailOrder?.id === order.id) {
        setDetailOrder({
          ...detailOrder,
          service_status: nextStatus,
        });
      }

      toast.success(`Order status updated to ${getStatusLabel(nextStatus)}.`);
    } catch (err: any) {
      console.error("STATUS UPDATE ERROR:", err);

      toast.error(
        err.response?.data?.message || "Failed to update order status.",
      );
    } finally {
      setStatusSubmitting(null);
    }
  };

  const handleOpenPayment = (order: Order) => {
    if (order.payment_status === "PAID") {
      toast.info("Order is already paid.");
      return;
    }

    setPaymentOrder(order);

    const total = getOrderTotal(order);

    setAmountReceived(String(total));
    setPaymentMethod("CASH");
    setPaymentOpen(true);
  };

  const handlePayment = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!paymentOrder) return;

    const total = getOrderTotal(paymentOrder);
    const amount = Number(amountReceived);

    if (!amount || amount < total) {
      toast.error("Amount received is less than total amount.");

      return;
    }

    setPaymentSubmitting(true);

    try {
      await createPayment({
        order_id: paymentOrder.id,
        amount_received: amount,
        payment_method: paymentMethod,
      });

      await fetchOrders(page);

      if (detailOrder?.id === paymentOrder.id) {
        setDetailOrder({
          ...detailOrder,
          payment_status: "PAID",
        });
      }

      setPaymentOpen(false);
      setPaymentOrder(null);

      toast.success("Payment recorded successfully.");
    } catch (err: any) {
      console.error("PAYMENT ERROR:", err);

      toast.error(err.response?.data?.message || "Failed to process payment.");
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const handleEdit = (order: Order) => {
    if (order.payment_status === "PAID") {
      handleOpenAssignStaff(order);
      return;
    }

    if (
      order.service_status === "COMPLETED" ||
      order.service_status === "CANCELLED"
    ) {
      toast.error(
        `${getStatusLabel(order.service_status)} order cannot be modified.`,
      );

      return;
    }

    setEditOrder(order);

    setEditItems(
      order.order_items?.map((item) => ({
        service_id: item.service_id,
        qty: 1,
      })) ?? [],
    );

    setEditServiceId("");
    setEditServiceSearch("");
    setEditServiceDropdownOpen(false);
    setEditOpen(true);
  };

  const handleEditServiceChange = (id: string) => {
    const service = services.find((item) => item.id === Number(id));

    setEditServiceId(id);

    if (service) {
      setEditServiceSearch(service.name);
    }

    setEditServiceDropdownOpen(false);
  };

  const handleEditServiceSearchChange = (value: string) => {
    setEditServiceSearch(value);
    setEditServiceId("");
    setEditServiceDropdownOpen(true);
  };

  const handleAddEditService = () => {
    if (!editServiceId) return;

    const id = Number(editServiceId);

    const existing = editItems.find((item) => item.service_id === id);

    if (existing) {
      toast.info("This service is already added.");
      setEditServiceId("");
      return;
    }

    setEditItems((prev) => [
      ...prev,
      {
        service_id: id,
        qty: 1,
      },
    ]);

    setEditServiceId("");
    setEditServiceSearch("");
    setEditServiceDropdownOpen(false);
  };

  const handleRemoveEditService = (sId: number) => {
    setEditItems((prev) => prev.filter((item) => item.service_id !== sId));
  };

  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editOrder) return;

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
        check_in_time: editOrder.check_in_time ?? null,
        items: editItems.map((item) => ({
          service_id: item.service_id,
          qty: 1,
        })),
      };

      await updateOrder(editOrder.id, payload);

      setEditOpen(false);
      setEditOrder(null);
      setEditItems([]);

      await fetchOrders(page);

      toast.success("Order updated successfully.");
    } catch (err: any) {
      console.error("UPDATE ERROR:", err);

      toast.error(err.response?.data?.message || "Failed to update order.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (cancelId === null) return;

    setCancelSubmitting(true);

    try {
      await cancelOrder(cancelId);
      await fetchOrders(page);

      if (detailOrder?.id === cancelId) {
        setDetailOrder({
          ...detailOrder,
          service_status: "CANCELLED",
        });
      }

      setCancelOpen(false);
      setCancelId(null);

      toast.success("Order cancelled successfully.");
    } catch (err: any) {
      console.error("CANCEL ORDER ERROR:", err);

      toast.error(err.response?.data?.message || "Failed to cancel order.");
    } finally {
      setCancelSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteOrder(id);
      await fetchOrders(page);

      setDeleteOpen(false);
      setDeleteId(null);

      toast.success("Order deleted successfully.");
    } catch (err: any) {
      console.error("DELETE ORDER ERROR:", err);

      toast.error(err.response?.data?.message || "Failed to delete order.");
    }
  };

  const getStatusBadgeClass = (status: string | null | undefined) => {
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

  const paymentTotal = paymentOrder ? getOrderTotal(paymentOrder) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>

          <p className="text-sm text-muted-foreground">
            Manage customer orders, staff assignments, payments, and wash
            progress.
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

          <DialogContent className="h-[80vh] max-h-[80vh] overflow-y-auto sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-xl">Create New Order</DialogTitle>

              <p className="text-sm text-muted-foreground">
                Select customer, vehicle, staff and services.
              </p>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Customer *</label>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerDropdownOpen((prev) => !prev);
                        setStaffDropdownOpen(false);
                        setServiceDropdownOpen(false);
                      }}
                      className="flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 text-left text-sm"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <UserRound className="h-4 w-4 shrink-0 text-muted-foreground" />

                        <span
                          className={
                            selectedCustomer
                              ? "truncate"
                              : "text-muted-foreground"
                          }
                        >
                          {selectedCustomer?.name ?? "Select customer"}
                        </span>
                      </div>

                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>

                    {customerDropdownOpen && (
                      <div className="absolute z-50 mt-1 w-full rounded-md border bg-background p-2 shadow-lg">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                          <Input
                            autoFocus
                            value={customerSearch}
                            onChange={(e) =>
                              handleCustomerSearchChange(e.target.value)
                            }
                            placeholder="Search customer..."
                            className="pl-9"
                          />
                        </div>

                        <div className="mt-2 max-h-52 overflow-y-auto">
                          {filteredCustomers.length === 0 ? (
                            <div className="p-3 text-center text-sm text-muted-foreground">
                              No customer found.
                            </div>
                          ) : (
                            filteredCustomers.map((customer) => (
                              <button
                                key={customer.id}
                                type="button"
                                onClick={() =>
                                  handleCustomerChange(String(customer.id))
                                }
                                className={`flex w-full flex-col items-start rounded-md px-3 py-2.5 text-left hover:bg-muted ${
                                  customer.id === Number(customerId)
                                    ? "bg-muted"
                                    : ""
                                }`}
                              >
                                <span className="text-sm font-medium">
                                  {customer.name}
                                </span>

                                <span className="text-xs text-muted-foreground">
                                  {customer.phone ||
                                    customer.email ||
                                    "No contact information"}
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedCustomer && (
                    <div className="rounded-md bg-muted/50 px-3 py-2 text-xs">
                      <span className="font-medium">Selected:</span>{" "}
                      {selectedCustomer.name}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Vehicle *</label>

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

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Staff (Optional / Can assign later)
                  </label>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => {
                        setStaffDropdownOpen((prev) => !prev);
                        setCustomerDropdownOpen(false);
                        setServiceDropdownOpen(false);
                      }}
                      className="flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 text-left text-sm"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <UserRound className="h-4 w-4 shrink-0 text-muted-foreground" />

                        <span
                          className={
                            selectedStaff ? "truncate" : "text-muted-foreground"
                          }
                        >
                          {selectedStaff?.name ?? "No staff assigned yet"}
                        </span>
                      </div>

                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>

                    {staffDropdownOpen && (
                      <div className="absolute z-50 mt-1 w-full rounded-md border bg-background p-2 shadow-lg">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                          <Input
                            autoFocus
                            value={staffSearch}
                            onChange={(e) =>
                              handleStaffSearchChange(e.target.value)
                            }
                            placeholder="Search staff..."
                            className="pl-9"
                          />
                        </div>

                        <div className="mt-2 max-h-52 overflow-y-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setStaffId("");
                              setStaffSearch("");
                              setStaffDropdownOpen(false);
                            }}
                            className="w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted"
                          >
                            No staff assigned yet
                          </button>

                          {filteredStaffs.length === 0 ? (
                            <div className="p-3 text-center text-sm text-muted-foreground">
                              No staff found.
                            </div>
                          ) : (
                            filteredStaffs.map((staff) => (
                              <button
                                key={staff.id}
                                type="button"
                                onClick={() =>
                                  handleStaffChange(String(staff.id))
                                }
                                className={`flex w-full flex-col items-start rounded-md px-3 py-2.5 text-left hover:bg-muted ${
                                  staff.id === Number(staffId) ? "bg-muted" : ""
                                }`}
                              >
                                <span className="text-sm font-medium">
                                  {staff.name}
                                </span>

                                {staff.phone && (
                                  <span className="text-xs text-muted-foreground">
                                    {staff.phone}
                                  </span>
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Check In Time</label>

                  <Input
                    type="time"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                  />
                </div>
              </div>

              <Card className="overflow-visible">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Package className="h-4 w-4" />
                    Services
                  </CardTitle>
                </CardHeader>

                <CardContent className="relative space-y-4 overflow-visible">
                  <div className="relative">
                    <div className="flex items-stretch gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setServiceDropdownOpen((prev) => !prev);
                          setServiceSearch("");
                          setCustomerDropdownOpen(false);
                          setStaffDropdownOpen(false);
                        }}
                        className="flex min-h-10 min-w-0 flex-1 items-center justify-between rounded-md border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-muted/50"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <Package className="h-4 w-4 shrink-0 text-muted-foreground" />

                          <span
                            className={
                              selectedService
                                ? "min-w-0 whitespace-normal break-words leading-5"
                                : "text-muted-foreground"
                            }
                          >
                            {selectedService?.name ?? "Select service"}
                          </span>
                        </div>

                        <ChevronDown
                          className={`ml-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                            serviceDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddService}
                        disabled={!serviceId}
                        className="h-10 w-10 shrink-0 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {serviceDropdownOpen && (
                      <div className="absolute left-0 right-12 top-full z-[100] mt-1 rounded-md border bg-background p-2 shadow-xl">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                          <Input
                            autoFocus
                            value={serviceSearch}
                            onChange={(e) =>
                              handleServiceSearchChange(e.target.value)
                            }
                            placeholder="Search service..."
                            className="pl-9"
                          />
                        </div>

                        <div className="mt-2 max-h-60 overflow-y-auto">
                          {filteredServices.length === 0 ? (
                            <div className="p-3 text-center text-sm text-muted-foreground">
                              No service found.
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {filteredServices.map((service) => {
                                const isSelected =
                                  serviceId === String(service.id);

                                return (
                                  <button
                                    key={service.id}
                                    type="button"
                                    onClick={() => {
                                      handleServiceChange(String(service.id));
                                      setServiceDropdownOpen(false);
                                      setServiceSearch("");
                                    }}
                                    className={`flex w-full items-center gap-3 rounded-md px-3 py-3 text-left transition-colors ${
                                      isSelected ? "bg-muted" : "hover:bg-muted"
                                    }`}
                                  >
                                    <div className="min-w-0 flex-1">
                                      <p className="whitespace-normal break-words text-sm font-medium leading-5">
                                        {service.name}
                                      </p>

                                      <p className="mt-1 text-xs text-muted-foreground">
                                        {formatRupiah(Number(service.price))}
                                      </p>
                                    </div>

                                    {isSelected && (
                                      <Check className="h-4 w-4 shrink-0" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {orderItems.length === 0 ? (
                      <div className="rounded-lg border border-dashed p-4 text-center">
                        <Package className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />

                        <p className="text-sm font-medium text-muted-foreground">
                          No services added
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Select a service above and click the + button.
                        </p>
                      </div>
                    ) : (
                      orderItems.map((item) => {
                        const service = services.find(
                          (s) => s.id === item.service_id,
                        );

                        if (!service) return null;

                        const subtotal = Number(service.price);

                        return (
                          <div
                            key={item.service_id}
                            className="flex items-center gap-3 rounded-lg border p-3"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="whitespace-normal break-words text-sm font-medium leading-5">
                                {service.name}
                              </p>

                              <p className="mt-1 text-xs text-muted-foreground">
                                {formatRupiah(Number(service.price))}
                              </p>
                            </div>

                            <div className="shrink-0 rounded-md bg-muted px-3 py-1 text-xs font-medium">
                              Qty 1
                            </div>

                            <div className="w-28 shrink-0 text-right text-sm font-semibold">
                              {formatRupiah(subtotal)}
                            </div>

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() =>
                                handleRemoveService(item.service_id)
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t pt-4">
                    <span className="font-medium">Total</span>

                    <span className="text-xl font-bold">
                      {formatRupiah(orderTotal)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={submitting || orderItems.length === 0}
                >
                  {submitting ? "Creating..." : "Create Order"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Service Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Workflow Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="h-32 text-center text-muted-foreground"
                    >
                      No orders found.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => {
                    const total = getOrderTotal(order);

                    const isWaiting = order.service_status === "WAITING";

                    const isConfirmed = order.service_status === "CONFIRMED";

                    const isInProgress = order.service_status === "IN_PROGRESS";

                    const isCompleted = order.service_status === "COMPLETED";

                    const isCancelled = order.service_status === "CANCELLED";

                    const isPaid = order.payment_status === "PAID";

                    const hasStaff = !!order.staff_id;

                    const canCancel =
                      (isWaiting || isConfirmed) && !isPaid && !isCancelled;

                    return (
                      <TableRow key={order.id}>
                        <TableCell className="font-bold">#{order.id}</TableCell>

                        <TableCell>
                          <div className="font-medium">
                            {order.customers?.name ??
                              customers.find((c) => c.id === order.customer_id)
                                ?.name ??
                              "-"}
                          </div>

                          {order.customers?.phone && (
                            <div className="text-xs text-muted-foreground">
                              {order.customers.phone}
                            </div>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="font-semibold">
                            {order.vehicles?.plate_number ??
                              vehicles.find((v) => v.id === order.vehicle_id)
                                ?.plate_number ??
                              "-"}
                          </div>

                          <div className="text-xs text-muted-foreground">
                            {order.vehicles?.brand} {order.vehicles?.model}
                          </div>
                        </TableCell>

                        <TableCell>
                          {hasStaff ? (
                            <div className="flex items-center gap-1.5 font-medium">
                              <UserRound className="h-3.5 w-3.5 text-muted-foreground" />

                              {order.staffs?.name ??
                                staffs.find((s) => s.id === order.staff_id)
                                  ?.name ??
                                "-"}
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 border-amber-300 bg-amber-50 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                              onClick={() => handleOpenAssignStaff(order)}
                            >
                              <UserRound className="mr-1 h-3 w-3" />+ Assign
                              Staff
                            </Button>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="space-y-1">
                            {order.order_items?.map((item) => (
                              <div key={item.id} className="text-xs">
                                <span className="font-medium">
                                  {item.services?.name ??
                                    `Service #${item.service_id}`}
                                </span>{" "}
                                <span className="text-muted-foreground">
                                  × {item.qty}
                                </span>
                              </div>
                            ))}
                          </div>
                        </TableCell>

                        <TableCell className="font-bold text-[#FF5412]">
                          {formatRupiah(total)}
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={getStatusBadgeClass(
                              order.service_status,
                            )}
                          >
                            {getStatusLabel(order.service_status)}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Badge
                            className={
                              isPaid
                                ? "border-green-200 bg-green-100 text-green-800 hover:bg-green-100"
                                : "border-red-200 bg-red-100 text-red-800 hover:bg-red-100"
                            }
                          >
                            {order.payment_status ?? "UNPAID"}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-wrap justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1 text-xs"
                              onClick={() => handleOpenDetail(order)}
                              title="View Order Details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Detail
                            </Button>

                            {isWaiting && (
                              <>
                                <Button
                                  size="sm"
                                  className="h-8 gap-1 bg-slate-900 text-xs text-white hover:bg-slate-800"
                                  disabled={statusSubmitting === order.id}
                                  onClick={() =>
                                    handleStatusUpdate(order, "CONFIRMED")
                                  }
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  Confirm
                                </Button>

                                {!isPaid && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-1 border-blue-200 text-xs text-blue-600 hover:bg-blue-50"
                                    onClick={() => handleOpenPayment(order)}
                                  >
                                    <CreditCard className="h-3.5 w-3.5" />
                                    Pay
                                  </Button>
                                )}
                              </>
                            )}

                            {isConfirmed && (
                              <>
                                {!isPaid && (
                                  <Button
                                    size="sm"
                                    className="h-8 gap-1 bg-blue-600 text-xs text-white hover:bg-blue-700"
                                    onClick={() => handleOpenPayment(order)}
                                  >
                                    <CreditCard className="h-3.5 w-3.5" />
                                    Pay Cashier
                                  </Button>
                                )}

                                {isPaid && (
                                  <Button
                                    size="sm"
                                    className="h-8 gap-1 bg-[#FF5412] text-xs text-white hover:bg-orange-600"
                                    disabled={statusSubmitting === order.id}
                                    onClick={() =>
                                      handleStatusUpdate(order, "IN_PROGRESS")
                                    }
                                  >
                                    <Play className="h-3.5 w-3.5" />
                                    Start Service
                                  </Button>
                                )}
                              </>
                            )}

                            {isInProgress && (
                              <Button
                                size="sm"
                                className="h-8 gap-1 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
                                disabled={statusSubmitting === order.id}
                                onClick={() =>
                                  handleStatusUpdate(order, "COMPLETED")
                                }
                              >
                                <CircleCheck className="h-3.5 w-3.5" />
                                Complete
                              </Button>
                            )}

                            {isCompleted &&
                              order.invoices &&
                              order.invoices.length > 0 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 gap-1 text-xs"
                                  onClick={() => {
                                    const invoice =
                                      order.invoices?.[
                                        order.invoices.length - 1
                                      ];

                                    if (invoice) {
                                      navigate(`/invoices/${invoice.id}`);
                                    }
                                  }}
                                >
                                  <Receipt className="h-3.5 w-3.5" />
                                  Invoice
                                </Button>
                              )}

                            {canCancel && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs text-destructive hover:bg-red-50 hover:text-destructive"
                                onClick={() => {
                                  setCancelId(order.id);
                                  setCancelOpen(true);
                                }}
                              >
                                <Ban className="h-3.5 w-3.5" />
                              </Button>
                            )}

                            {!isPaid && !isCompleted && !isCancelled && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => handleEdit(order)}
                                title="Edit Order"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            )}

                            {!isPaid && !isCompleted && (
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => {
                                  setDeleteId(order.id);
                                  setDeleteOpen(true);
                                }}
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
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

          <div className="flex items-center justify-between border-t p-4">
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

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold">
                  Order Details #{detailOrder?.id}
                </DialogTitle>

                <p className="text-xs text-muted-foreground">
                  View and manage order workflow status and assignments.
                </p>
              </div>

              {detailOrder && (
                <div className="flex items-center gap-2">
                  <Badge
                    className={getStatusBadgeClass(detailOrder.service_status)}
                  >
                    {getStatusLabel(detailOrder.service_status)}
                  </Badge>

                  <Badge
                    className={
                      detailOrder.payment_status === "PAID"
                        ? "border-green-200 bg-green-100 text-green-800"
                        : "border-red-200 bg-red-100 text-red-800"
                    }
                  >
                    {detailOrder.payment_status ?? "UNPAID"}
                  </Badge>
                </div>
              )}
            </div>
          </DialogHeader>

          {detailOrder && (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border bg-muted/30 p-4">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Customer Information
                  </p>

                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-bold">
                      {detailOrder.customers?.name ??
                        customers.find((c) => c.id === detailOrder.customer_id)
                          ?.name ??
                        "-"}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Phone: {detailOrder.customers?.phone ?? "-"}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border bg-muted/30 p-4">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    Vehicle Information
                  </p>

                  <div className="mt-2 space-y-1">
                    <p className="font-mono text-sm font-bold">
                      {detailOrder.vehicles?.plate_number ??
                        vehicles.find((v) => v.id === detailOrder.vehicle_id)
                          ?.plate_number ??
                        "-"}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {detailOrder.vehicles?.brand}{" "}
                      {detailOrder.vehicles?.model}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-[#FF5412]" />

                    <span className="text-sm font-bold">Staff In Charge</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs font-semibold"
                    onClick={() => handleOpenAssignStaff(detailOrder)}
                  >
                    <UserCheck className="mr-1 h-3.5 w-3.5" />

                    {detailOrder.staff_id ? "Change Staff" : "Assign Staff"}
                  </Button>
                </div>

                <div className="mt-3">
                  {detailOrder.staff_id ? (
                    <p className="text-sm font-semibold text-slate-800">
                      Assigned:{" "}
                      <span className="font-bold text-[#FF5412]">
                        {detailOrder.staffs?.name ??
                          staffs.find((s) => s.id === detailOrder.staff_id)
                            ?.name}
                      </span>
                    </p>
                  ) : (
                    <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800">
                      <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />

                      <span>
                        Staff is not yet assigned. Please assign staff before
                        confirming or starting the wash service.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Ordered Services ({detailOrder.order_items?.length ?? 0})
                </p>

                <div className="divide-y rounded-xl border">
                  {detailOrder.order_items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 text-sm"
                    >
                      <div>
                        <p className="font-medium">
                          {item.services?.name ?? `Service #${item.service_id}`}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          Qty {item.qty} ×{" "}
                          {formatRupiah(Number(item.services?.price ?? 0))}
                        </p>
                      </div>

                      <p className="font-bold">
                        {formatRupiah(
                          Number(item.services?.price ?? 0) * (item.qty ?? 1),
                        )}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <span className="text-sm font-semibold">Total Amount:</span>

                  <span className="text-lg font-extrabold text-[#FF5412]">
                    {formatRupiah(getOrderTotal(detailOrder))}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
                <Button variant="outline" onClick={() => setDetailOpen(false)}>
                  Close
                </Button>

                <div className="flex flex-wrap items-center gap-2">
                  {detailOrder.service_status === "WAITING" && (
                    <>
                      {detailOrder.payment_status !== "PAID" && (
                        <Button
                          variant="outline"
                          onClick={() => handleOpenPayment(detailOrder)}
                        >
                          <CreditCard className="mr-1 h-4 w-4" />
                          Pay
                        </Button>
                      )}

                      <Button
                        className="bg-slate-900 text-white hover:bg-slate-800"
                        onClick={() =>
                          handleStatusUpdate(detailOrder, "CONFIRMED")
                        }
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Confirm Order
                      </Button>
                    </>
                  )}

                  {detailOrder.service_status === "CONFIRMED" && (
                    <>
                      {detailOrder.payment_status !== "PAID" ? (
                        <Button
                          className="bg-blue-600 text-white hover:bg-blue-700"
                          onClick={() => handleOpenPayment(detailOrder)}
                        >
                          <CreditCard className="mr-1 h-4 w-4" />
                          Process Payment
                        </Button>
                      ) : (
                        <Button
                          className="bg-[#FF5412] text-white hover:bg-orange-600"
                          onClick={() =>
                            handleStatusUpdate(detailOrder, "IN_PROGRESS")
                          }
                        >
                          <Play className="mr-1 h-4 w-4" />
                          Start Service
                        </Button>
                      )}
                    </>
                  )}

                  {detailOrder.service_status === "IN_PROGRESS" && (
                    <Button
                      className="bg-emerald-600 text-white hover:bg-emerald-700"
                      onClick={() =>
                        handleStatusUpdate(detailOrder, "COMPLETED")
                      }
                    >
                      <CircleCheck className="mr-1 h-4 w-4" />
                      Complete Service
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={assignStaffOpen}
        onOpenChange={(value) => {
          setAssignStaffOpen(value);

          if (!value) {
            setAssignStaffSearch("");
            setAssignStaffDropdownOpen(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveAssignStaff} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                Assign Staff to Order #{assignStaffOrder?.id}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <p className="text-xs text-muted-foreground">
                Select an active staff member to take responsibility for washing
                this vehicle.
              </p>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select Staff *</label>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAssignStaffDropdownOpen((prev) => !prev)}
                    className="flex h-10 w-full items-center justify-between rounded-md border bg-background px-3 text-left text-sm"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <UserRound className="h-4 w-4 shrink-0 text-muted-foreground" />

                      <span
                        className={
                          selectedAssignStaff
                            ? "truncate"
                            : "text-muted-foreground"
                        }
                      >
                        {selectedAssignStaff?.name ?? "Select staff"}
                      </span>
                    </div>

                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>

                  {assignStaffDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-background p-2 shadow-lg">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <Input
                          autoFocus
                          value={assignStaffSearch}
                          onChange={(e) =>
                            handleAssignStaffSearchChange(e.target.value)
                          }
                          placeholder="Search staff..."
                          className="pl-9"
                        />
                      </div>

                      <div className="mt-2 max-h-52 overflow-y-auto">
                        {filteredAssignStaffs.length === 0 ? (
                          <div className="p-3 text-center text-sm text-muted-foreground">
                            No staff found.
                          </div>
                        ) : (
                          filteredAssignStaffs.map((staff) => (
                            <button
                              key={staff.id}
                              type="button"
                              onClick={() => handleSelectAssignStaff(staff)}
                              className={`flex w-full flex-col items-start rounded-md px-3 py-2.5 text-left hover:bg-muted ${
                                staff.id === Number(selectedAssignStaffId)
                                  ? "bg-muted"
                                  : ""
                              }`}
                            >
                              <span className="text-sm font-medium">
                                {staff.name}
                              </span>

                              {staff.phone && (
                                <span className="text-xs text-muted-foreground">
                                  {staff.phone}
                                </span>
                              )}
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAssignStaffOpen(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={assignStaffSubmitting || !selectedAssignStaffId}
              >
                {assignStaffSubmitting ? "Saving..." : "Save Assignment"}
              </Button>
            </div>
          </form>
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

                      <p className="text-xl font-bold text-[#FF5412]">
                        {formatRupiah(paymentTotal)}
                      </p>
                    </div>
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
                    onChange={(e) =>
                      setPaymentMethod(e.target.value as PaymentMethod)
                    }
                    className="w-full rounded-md border bg-background p-2 text-sm"
                  >
                    <option value="CASH">Cash</option>

                    <option value="QRIS">QRIS</option>

                    <option value="TRANSFER">Transfer</option>
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
                    min={paymentTotal}
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    placeholder="Enter amount"
                    required
                  />
                </div>

                {amountReceived && Number(amountReceived) >= paymentTotal && (
                  <div className="rounded-lg bg-green-50 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Change:</span>

                      <span className="text-lg font-bold text-green-600">
                        {formatRupiah(Number(amountReceived) - paymentTotal)}
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
                    Number(amountReceived) < paymentTotal
                  }
                >
                  {paymentSubmitting ? "Processing..." : "Complete Payment"}
                </Button>
              </>
            )}
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={editOpen}
        onOpenChange={(value) => {
          setEditOpen(value);

          if (!value) {
            setEditServiceSearch("");
            setEditServiceDropdownOpen(false);
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Edit Order #{editOrder?.id}
            </DialogTitle>

            <p className="text-sm text-muted-foreground">
              Update customer, vehicle, staff, services and check-in time.
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
                        (v) => v.customer_id === newCustomerId,
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
                      .filter((v) => v.customer_id === editOrder.customer_id)
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
                  <div className="relative">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setEditServiceDropdownOpen((prev) => !prev)
                        }
                        className="flex h-10 flex-1 items-center justify-between rounded-md border bg-background px-3 text-left text-sm"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <Package className="h-4 w-4 shrink-0 text-muted-foreground" />

                          <span
                            className={
                              editServiceId
                                ? "truncate"
                                : "text-muted-foreground"
                            }
                          >
                            {editServiceId
                              ? services.find(
                                  (service) =>
                                    service.id === Number(editServiceId),
                                )?.name
                              : "Add another service"}
                          </span>
                        </div>

                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      </button>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddEditService}
                        disabled={!editServiceId}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {editServiceDropdownOpen && (
                      <div className="absolute z-50 mt-1 w-[calc(100%-3rem)] rounded-md border bg-background p-2 shadow-lg">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                          <Input
                            autoFocus
                            value={editServiceSearch}
                            onChange={(e) =>
                              handleEditServiceSearchChange(e.target.value)
                            }
                            placeholder="Search service..."
                            className="pl-9"
                          />
                        </div>

                        <div className="mt-2 max-h-52 overflow-y-auto">
                          {filteredEditServices.length === 0 ? (
                            <div className="p-3 text-center text-sm text-muted-foreground">
                              No service found.
                            </div>
                          ) : (
                            filteredEditServices.map((service) => (
                              <button
                                key={service.id}
                                type="button"
                                onClick={() =>
                                  handleEditServiceChange(String(service.id))
                                }
                                className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left hover:bg-muted"
                              >
                                <span className="text-sm font-medium">
                                  {service.name}
                                </span>

                                <span className="ml-3 text-xs text-muted-foreground">
                                  {formatRupiah(Number(service.price))}
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {editItems.map((item) => {
                      const service = services.find(
                        (s) => s.id === item.service_id,
                      );

                      if (!service) return null;

                      const subtotal = Number(service.price);

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
                              {formatRupiah(Number(service.price))}
                            </p>
                          </div>

                          <div className="rounded-md bg-muted px-3 py-1 text-xs font-medium">
                            Qty 1
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
                  disabled={submitting || editItems.length === 0}
                >
                  {submitting ? "Updating..." : "Update Order"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Order #{cancelId}?</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This order will be marked as cancelled and cannot be processed
              further.
            </p>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setCancelOpen(false)}
                disabled={cancelSubmitting}
              >
                Keep Order
              </Button>

              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={cancelSubmitting}
              >
                {cancelSubmitting ? "Cancelling..." : "Cancel Order"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
    </div>
  );
}
