import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Car,
  CheckCircle2,
  Clock,
  Clock3,
  CreditCard,
  Droplets,
  Plus,
  Receipt,
  ShieldAlert,
  XCircle,
  AlertCircle,
  Download,
} from "lucide-react";

import { getOrderById, cancelOrder } from "@/services/order.service";
import {
  createMidtransPayment,
  verifyMidtransPayment,
} from "@/services/payment.service";
import { downloadInvoicePdf } from "@/services/invoice.service";
import type { Order, OrderServiceStatus, PaymentStatus } from "@/types/order";

import { socket, connectSocket, disconnectSocket } from "@/services/socket";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const formatRupiah = (value: number | string) => {
  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return "Rp 0";
  }

  return `Rp ${amount.toLocaleString("id-ID")}`;
};

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) {
    return "-";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusBadge = (status: OrderServiceStatus | null) => {
  switch (status) {
    case "WAITING":
      return (
        <Badge
          variant="outline"
          className="border-amber-200 bg-amber-50 text-amber-700"
        >
          <Clock3 className="mr-1 h-3 w-3" />
          Menunggu Konfirmasi
        </Badge>
      );

    case "CONFIRMED":
      return (
        <Badge
          variant="outline"
          className="border-blue-200 bg-blue-50 text-blue-700"
        >
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Dikonfirmasi
        </Badge>
      );

    case "IN_PROGRESS":
      return (
        <Badge
          variant="outline"
          className="border-orange-200 bg-orange-50 text-[#FF5412]"
        >
          <Droplets className="mr-1 h-3 w-3" />
          Sedang Dicuci
        </Badge>
      );

    case "COMPLETED":
      return (
        <Badge
          variant="outline"
          className="border-emerald-200 bg-emerald-50 text-emerald-700"
        >
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Selesai
        </Badge>
      );

    case "CANCELLED":
      return (
        <Badge
          variant="outline"
          className="border-rose-200 bg-rose-50 text-rose-700"
        >
          <XCircle className="mr-1 h-3 w-3" />
          Dibatalkan
        </Badge>
      );

    default:
      return (
        <Badge
          variant="outline"
          className="border-slate-200 bg-slate-50 text-slate-700"
        >
          {status || "-"}
        </Badge>
      );
  }
};

const getPaymentBadge = (status: PaymentStatus | null) => {
  switch (status) {
    case "PAID":
      return (
        <Badge
          variant="outline"
          className="border-emerald-200 bg-emerald-50 text-emerald-700"
        >
          Lunas (Paid)
        </Badge>
      );

    case "UNPAID":
      return (
        <Badge
          variant="outline"
          className="border-amber-200 bg-amber-50 text-amber-700"
        >
          Belum Bayar (Unpaid)
        </Badge>
      );

    case "REFUNDED":
      return (
        <Badge
          variant="outline"
          className="border-purple-200 bg-purple-50 text-purple-700"
        >
          Refunded
        </Badge>
      );

    case "FAILED":
      return (
        <Badge
          variant="outline"
          className="border-red-200 bg-red-50 text-red-700"
        >
          Gagal
        </Badge>
      );

    default:
      return (
        <Badge
          variant="outline"
          className="border-slate-200 bg-slate-50 text-slate-700"
        >
          {status || "UNPAID"}
        </Badge>
      );
  }
};

/* =========================================================
   COMPONENT
========================================================= */

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const parsedOrderId = id ? Number(id) : NaN;

  const invalidOrderId =
    !id ||
    Number.isNaN(parsedOrderId) ||
    !Number.isInteger(parsedOrderId) ||
    parsedOrderId <= 0;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);

  // Cancel modal states
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Payment states
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Invoice states
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  /* =========================================================
     BACK NAVIGATION
  ========================================================= */
  const handleBack = () => {
    if (
      window.history.state &&
      typeof window.history.state.idx === "number" &&
      window.history.state.idx > 0
    ) {
      navigate(-1);
    } else {
      navigate("/orders");
    }
  };

  /* =========================================================
     FETCH ORDER
  ========================================================= */

  useEffect(() => {
    if (invalidOrderId) {
      return;
    }

    let cancelled = false;

    const loadOrder = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getOrderById(parsedOrderId);

        if (!cancelled) {
          setOrder(data);
        }
      } catch (err: unknown) {
        if (cancelled) {
          return;
        }

        console.error("Fetch order error:", err);

        if (typeof err === "object" && err !== null && "response" in err) {
          const response = (
            err as {
              response?: {
                data?: {
                  message?: string;
                };
              };
            }
          ).response;

          setError(response?.data?.message ?? "Gagal mengambil detail order.");
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Gagal mengambil detail order.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadOrder();

    return () => {
      cancelled = true;
    };
  }, [invalidOrderId, parsedOrderId, reloadKey]);

  useEffect(() => {
    if (invalidOrderId) {
      return;
    }

    const handleOrderStatusUpdated = (data: {
      orderId: number;
      serviceStatus: OrderServiceStatus;
    }) => {
      if (data.orderId !== parsedOrderId) {
        return;
      }

      setOrder((currentOrder) => {
        if (!currentOrder) {
          return currentOrder;
        }

        return {
          ...currentOrder,
          service_status: data.serviceStatus,
        };
      });
    };

    const handleConnect = () => {
      socket.emit("join-order", parsedOrderId);
    };

    socket.on("order-status-updated", handleOrderStatusUpdated);
    socket.on("connect", handleConnect);

    connectSocket();

    if (socket.connected) {
      socket.emit("join-order", parsedOrderId);
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("order-status-updated", handleOrderStatusUpdated);
      disconnectSocket();
    };
  }, [invalidOrderId, parsedOrderId]);
  /* =========================================================
     REFRESH ORDER
  ========================================================= */

  const refreshOrder = async () => {
    if (invalidOrderId) {
      return;
    }

    try {
      const data = await getOrderById(parsedOrderId);
      setOrder(data);
      setError(null);
    } catch (err: unknown) {
      console.error("Refresh order error:", err);

      if (typeof err === "object" && err !== null && "response" in err) {
        const response = (
          err as {
            response?: {
              data?: {
                message?: string;
              };
            };
          }
        ).response;

        setError(response?.data?.message ?? "Gagal memperbarui detail order.");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Gagal memperbarui detail order.");
      }
    }
  };

  /* =========================================================
     CANCEL ORDER
  ========================================================= */

  const handleConfirmCancel = async () => {
    if (!order) {
      return;
    }

    setCancelling(true);
    setCancelError(null);

    try {
      const updated = await cancelOrder(order.id);

      setOrder(updated);
      setCancelModalOpen(false);
    } catch (err: unknown) {
      console.error("Cancel order error:", err);

      if (typeof err === "object" && err !== null && "response" in err) {
        const response = (
          err as {
            response?: {
              data?: {
                message?: string;
              };
            };
          }
        ).response;

        setCancelError(
          response?.data?.message ??
            "Gagal membatalkan pesanan. Silakan coba lagi.",
        );
      } else if (err instanceof Error) {
        setCancelError(err.message);
      } else {
        setCancelError("Gagal membatalkan pesanan. Silakan coba lagi.");
      }
    } finally {
      setCancelling(false);
    }
  };

  /* =========================================================
     MIDTRANS AUTO VERIFY
  ========================================================= */

  useEffect(() => {
    if (invalidOrderId) {
      return;
    }

    const params = new URLSearchParams(window.location.search);

    const transactionStatus = params.get("transaction_status");
    const midtransOrderId = params.get("order_id");

    if (!transactionStatus && !midtransOrderId) {
      return;
    }

    let cancelled = false;

    const checkAndSync = async () => {
      try {
        if (midtransOrderId) {
          await verifyMidtransPayment(parsedOrderId, midtransOrderId);
        }

        if (cancelled) {
          return;
        }

        const data = await getOrderById(parsedOrderId);

        if (!cancelled) {
          setOrder(data);
          setError(null);
        }
      } catch (err: unknown) {
        console.error("Auto verify error:", err);
      } finally {
        if (!cancelled) {
          navigate(`/orders/${parsedOrderId}`, { replace: true });
        }
      }
    };

    void checkAndSync();

    return () => {
      cancelled = true;
    };
  }, [parsedOrderId, invalidOrderId]);

  /* =========================================================
     PAYMENT
  ========================================================= */

  const handlePayment = async () => {
    if (!order) {
      return;
    }

    if (order.payment_status === "PAID") {
      return;
    }

    setPaying(true);
    setPaymentError(null);

    try {
      const payment = await createMidtransPayment(order.id);

      if (!payment.token && !payment.redirectUrl) {
        throw new Error("Token pembayaran tidak tersedia.");
      }

      const snapObj = window.snap;

      if (snapObj && payment.token) {
        snapObj.pay(payment.token, {
          onSuccess: async (result: MidtransResult) => {
            console.log("Midtrans payment success:", result);

            try {
              if (result.order_id) {
                await verifyMidtransPayment(order.id, result.order_id);
              }
            } catch (err: unknown) {
              console.error("Verification error:", err);
            }

            await refreshOrder();
          },

          onPending: async (result: MidtransResult) => {
            console.log("Midtrans payment pending:", result);

            await refreshOrder();
          },

          onError: (result: MidtransResult) => {
            console.error("Midtrans payment error:", result);

            setPaymentError(
              "Pembayaran gagal. Silakan coba kembali atau gunakan metode pembayaran lain.",
            );
          },

          onClose: async () => {
            console.log("Midtrans popup closed");

            await refreshOrder();
          },
        });
      } else if (payment.redirectUrl) {
        window.location.assign(payment.redirectUrl);
      } else {
        throw new Error("Tidak dapat membuka halaman pembayaran Midtrans.");
      }
    } catch (err: unknown) {
      console.error("Create Midtrans payment error:", err);

      let message = "Gagal membuat pembayaran. Silakan coba lagi.";

      if (typeof err === "object" && err !== null && "response" in err) {
        const response = (
          err as {
            response?: {
              data?: {
                message?: string;
              };
            };
          }
        ).response;

        message = response?.data?.message ?? message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      setPaymentError(message);
    } finally {
      setPaying(false);
    }
  };

  /* =========================================================
     DOWNLOAD INVOICE
  ========================================================= */

  const handleDownloadInvoice = async () => {
    const invoice = order?.invoices?.[0];

    if (!invoice) {
      return;
    }

    try {
      setDownloadingInvoice(true);

      const blob = await downloadInvoicePdf(invoice.id);

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = `${invoice.invoice_no}.pdf`;

      document.body.appendChild(link);
      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      console.error("Download invoice error:", err);

      setPaymentError("Gagal mengunduh invoice. Silakan coba lagi.");
    } finally {
      setDownloadingInvoice(false);
    }
  };

  /* =========================================================
     INVALID ID
  ========================================================= */

  if (invalidOrderId) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <AlertCircle className="h-7 w-7" />
        </div>

        <h2 className="mt-4 text-lg font-bold text-slate-900">
          ID Pesanan Tidak Valid
        </h2>

        <p className="mt-1 max-w-md text-xs text-slate-500">
          Tautan pesanan yang kamu buka tidak valid.
        </p>

        <Button
          type="button"
          onClick={() => navigate("/orders")}
          className="mt-6 rounded-xl bg-[#FF5412] text-xs font-bold text-white hover:bg-orange-600"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Kembali ke Pesanan
        </Button>
      </div>
    );
  }

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <Skeleton className="h-6 w-32 rounded-lg" />

        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>

          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error || !order) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <AlertCircle className="h-7 w-7" />
        </div>

        <h2 className="mt-4 text-lg font-bold text-slate-900">
          {error || "Pesanan Tidak Ditemukan"}
        </h2>

        <p className="mt-1 max-w-md text-xs text-slate-500">
          Silakan periksa kembali tautan pesanan kamu atau kembali ke daftar
          pesanan.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/orders")}
            className="rounded-xl text-xs font-semibold"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Kembali ke Pesanan
          </Button>

          <Button
            type="button"
            onClick={() => {
              setReloadKey((current) => current + 1);
            }}
            className="rounded-xl bg-[#FF5412] text-xs font-bold text-white hover:bg-orange-600"
          >
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  /* =========================================================
     DERIVED DATA
  ========================================================= */

  const invoice = order.invoices?.[0];

  const isCancellable =
    (order.service_status === "WAITING" ||
      order.service_status === "CONFIRMED") &&
    order.payment_status !== "PAID";

  const totalAmount =
    order.order_items?.reduce((sum, item) => sum + Number(item.subtotal), 0) ??
    0;

  const totalDuration =
    order.order_items?.reduce(
      (sum, item) => sum + (item.services?.duration || 0) * (item.qty || 1),
      0,
    ) ?? 0;

  const steps: {
    key: OrderServiceStatus;
    label: string;
    desc: string;
  }[] = [
    {
      key: "WAITING",
      label: "Menunggu",
      desc: "Pesanan masuk ke sistem",
    },
    {
      key: "CONFIRMED",
      label: "Dikonfirmasi",
      desc: "Diverifikasi oleh tim bengkel",
    },
    {
      key: "IN_PROGRESS",
      label: "Sedang Dicuci",
      desc: "Mobil sedang diproses cuci",
    },
    {
      key: "COMPLETED",
      label: "Selesai",
      desc: "Mobil bersih dan siap diambil",
    },
  ];

  const currentStepIndex =
    order.service_status === "WAITING"
      ? 0
      : order.service_status === "CONFIRMED"
        ? 1
        : order.service_status === "IN_PROGRESS"
          ? 2
          : order.service_status === "COMPLETED"
            ? 3
            : -1;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-6 pb-12">
      {/* Back button & Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={handleBack}
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Order #{order.id}
            </h1>

            {getStatusBadge(order.service_status)}
            {getPaymentBadge(order.payment_status)}
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Dibuat pada {formatDate(order.order_date ?? order.created_at)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isCancellable && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setCancelError(null);
                setCancelModalOpen(true);
              }}
              className="rounded-xl border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <XCircle className="mr-1.5 h-3.5 w-3.5" />
              Batalkan Pesanan
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            onClick={() => navigate("/orders/create")}
            className="rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-[#FF5412]"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Order Lagi
          </Button>
        </div>
      </div>

      {/* Visual Stepper / Status Timeline */}
      {order.service_status !== "CANCELLED" ? (
        <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="p-5 sm:p-6">
            <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
              Progres Pengerjaan
            </p>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {steps.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div
                    key={step.key}
                    className={`relative rounded-2xl border p-4 transition ${
                      isCurrent
                        ? "border-[#FF5412] bg-orange-50/50 shadow-xs ring-1 ring-[#FF5412]/30"
                        : isPassed
                          ? "border-slate-200 bg-slate-50/50"
                          : "border-dashed border-slate-200 bg-white opacity-60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                          isPassed
                            ? "bg-[#FF5412] text-white"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {idx + 1}
                      </span>

                      {isPassed && (
                        <CheckCircle2 className="h-4 w-4 text-[#FF5412]" />
                      )}
                    </div>

                    <h4 className="mt-3 text-xs font-bold text-slate-900">
                      {step.label}
                    </h4>

                    <p className="mt-0.5 text-[11px] leading-tight text-slate-500">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
          <XCircle className="h-5 w-5 shrink-0 text-rose-600" />

          <div>
            <p className="text-sm font-bold">Pesanan Telah Dibatalkan</p>

            <p className="text-xs text-rose-600">
              Pesanan ini sudah tidak dapat diproses kembali. Silakan buat
              pesanan baru jika diperlukan.
            </p>
          </div>
        </div>
      )}

      {/* Main Details Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Vehicle Info */}
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-[#FF5412]">
                  <Car className="h-5 w-5" />
                </div>

                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Informasi Kendaraan
                  </CardTitle>

                  <CardDescription className="text-xs">
                    Identitas mobil yang didaftarkan pada pesanan ini
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="grid gap-4 p-5 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Nomor Plat
                </p>

                <p className="mt-1 font-mono text-sm font-extrabold text-slate-900">
                  {order.vehicles?.plate_number || "-"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Merek / Brand
                </p>

                <p className="mt-1 text-sm font-bold text-slate-900">
                  {order.vehicles?.brand || "-"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Model / Seri
                </p>

                <p className="mt-1 text-sm font-bold text-slate-900">
                  {order.vehicles?.model || "-"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Ordered Services */}
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-[#FF5412]">
                  <Droplets className="h-5 w-5" />
                </div>

                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Rincian Layanan ({order.order_items?.length || 0})
                  </CardTitle>

                  <CardDescription className="text-xs">
                    Paket pencucian yang dipilih
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="divide-y divide-slate-100 p-0">
              {order.order_items?.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900">
                      {item.services?.name}
                    </h4>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" />
                        {item.services?.duration} Menit
                      </span>

                      <span>•</span>

                      <span>
                        {item.qty || 1} x{" "}
                        {formatRupiah(item.services?.price || 0)}
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-semibold text-slate-400">
                      Subtotal
                    </span>

                    <p className="text-sm font-extrabold text-slate-900">
                      {formatRupiah(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-5">
              <CardTitle className="text-base font-bold text-slate-900">
                Ringkasan Pembayaran
              </CardTitle>

              <CardDescription className="text-xs">
                Detail biaya dan tagihan
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 p-5">
              {/* Check-in */}
              {order.check_in_time && (
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    Rencana Check-In:
                  </span>

                  <span className="font-bold text-slate-900">
                    {order.check_in_time} WIB
                  </span>
                </div>
              )}

              {/* Duration */}
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Estimasi Durasi:</span>

                <span className="font-bold text-slate-900">
                  {totalDuration} Menit
                </span>
              </div>

              {/* Invoice */}
              {invoice && (
                <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#FF5412]">
                      <Receipt className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Invoice
                      </p>

                      <p className="mt-1 font-mono text-sm font-extrabold text-slate-900">
                        {invoice.invoice_no}
                      </p>

                      <div className="mt-1 flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700"
                        >
                          LUNAS
                        </Badge>

                        <span className="text-[11px] text-slate-400">
                          {formatRupiah(invoice.total_amount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(`/invoices/${invoice.id}`)}
                      className="rounded-xl text-xs font-bold"
                    >
                      <Receipt className="mr-1.5 h-3.5 w-3.5" />
                      Lihat Invoice
                    </Button>

                    <Button
                      type="button"
                      disabled={downloadingInvoice}
                      onClick={handleDownloadInvoice}
                      className="rounded-xl bg-[#FF5412] text-xs font-bold text-white hover:bg-orange-600"
                    >
                      <Download className="mr-1.5 h-3.5 w-3.5" />

                      {downloadingInvoice ? "Mengunduh..." : "Download"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Payment Record */}
              {order.payments && order.payments.length > 0 && (
                <div className="space-y-1 rounded-xl bg-slate-50 p-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <CreditCard className="h-4 w-4 text-emerald-600" />

                    <span className="font-semibold">Metode Pembayaran:</span>
                  </div>

                  <p className="font-bold text-slate-900">
                    {order.payments[0].payment_method}
                  </p>

                  <p className="text-[11px] text-slate-400">
                    Diterima: {formatRupiah(order.payments[0].amount_received)}
                  </p>
                </div>
              )}

              <Separator />

              {/* Price Summary */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Subtotal Layanan:</span>

                  <span>{formatRupiah(totalAmount)}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Biaya Admin:</span>

                  <span className="font-semibold text-emerald-600">GRATIS</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-bold text-slate-900">
                    Total Biaya:
                  </span>

                  <span className="text-lg font-extrabold text-[#FF5412]">
                    {formatRupiah(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Payment Status */}
              {order.payment_status === "PAID" ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-800">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />

                    <span>Pembayaran Berhasil (Lunas)</span>
                  </div>

                  <p className="mt-1 text-[11px] leading-relaxed text-emerald-700">
                    Pesanan Anda telah lunas dan tercatat di sistem. Tim kami
                    akan memproses pencucian sesuai jadwal.
                  </p>
                </div>
              ) : (
                order.service_status !== "CANCELLED" && (
                  <div className="space-y-3 pt-2">
                    {paymentError && (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                        {paymentError}
                      </div>
                    )}

                    <Button
                      type="button"
                      disabled={paying}
                      onClick={handlePayment}
                      className="w-full rounded-xl bg-[#FF5412] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-orange-600"
                    >
                      <CreditCard className="mr-2 h-4 w-4" />

                      {paying ? "Menyiapkan Pembayaran..." : "Bayar Sekarang"}
                    </Button>

                    <div className="rounded-xl bg-orange-50/70 p-3 text-[11px] text-slate-600">
                      <p className="font-semibold text-slate-800">
                        Metode Pembayaran Tersedia:
                      </p>

                      <p className="mt-0.5 leading-relaxed">
                        Online via(QRIS, GoPay, Virtual Account BCA / Mandiri /
                        BNI / BRI, Kartu Kredit/Debit) atau bisa bayar tunai di
                        kasir saat kedatangan.
                      </p>
                    </div>
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <ShieldAlert className="h-6 w-6" />
            </div>

            <DialogTitle className="text-center text-lg font-bold text-slate-900">
              Batalkan Pesanan #{order.id}?
            </DialogTitle>

            <DialogDescription className="text-center text-xs text-slate-500">
              Apakah kamu yakin ingin membatalkan pesanan ini? Aksi ini tidak
              dapat diurungkan.
            </DialogDescription>
          </DialogHeader>

          {cancelError && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {cancelError}
            </div>
          )}

          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCancelModalOpen(false)}
              className="rounded-xl text-xs font-semibold"
            >
              Kembali
            </Button>

            <Button
              type="button"
              disabled={cancelling}
              onClick={handleConfirmCancel}
              className="rounded-xl bg-red-600 text-xs font-bold text-white hover:bg-red-700"
            >
              {cancelling ? "Membatalkan..." : "Ya, Batalkan Pesanan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
