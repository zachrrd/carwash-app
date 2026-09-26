import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Car,
  CheckCircle2,
  CreditCard,
  Download,
  Droplets,
  Receipt,
  User,
  AlertCircle,
} from "lucide-react";

import { getInvoiceById, downloadInvoicePdf } from "@/services/invoice.service";

import type { Invoice } from "@/services/invoice.service";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

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
  });
};

const formatPaymentDate = (dateString: string | null | undefined) => {
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

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!id || Number.isNaN(Number(id))) {
        setError("ID invoice tidak valid.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await getInvoiceById(Number(id));

        setInvoice(data);
      } catch (err: unknown) {
        console.error("Fetch invoice error:", err);

        const message =
          err instanceof Error ? err.message : "Gagal memuat invoice.";

        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void fetchInvoice();
  }, [id]);

  const handleDownload = async () => {
    if (!invoice) {
      return;
    }

    try {
      setDownloading(true);

      const blob = await downloadInvoicePdf(invoice.id);

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = `${invoice.invoice_no}.pdf`;

      document.body.appendChild(link);
      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download invoice error:", err);

      setError("Gagal mengunduh invoice. Silakan coba lagi.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <Skeleton className="h-6 w-32 rounded-lg" />

        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-80 rounded-lg" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-[500px] w-full rounded-2xl lg:col-span-2" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <AlertCircle className="h-7 w-7" />
        </div>

        <h2 className="mt-4 text-lg font-bold text-slate-900">
          {error || "Invoice Tidak Ditemukan"}
        </h2>

        <p className="mt-1 max-w-md text-xs text-slate-500">
          Invoice tidak dapat dimuat atau kamu tidak memiliki akses ke invoice
          ini.
        </p>

        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(-1)}
          className="mt-6 rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Kembali
        </Button>
      </div>
    );
  }

  const order = invoice.orders;
  const payment = order.payments?.[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Invoice
            </h1>

            <Badge
              variant="outline"
              className="border-emerald-200 bg-emerald-50 text-emerald-700"
            >
              <CheckCircle2 className="mr-1 h-3 w-3" />
              LUNAS
            </Badge>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Invoice {invoice.invoice_no}
          </p>
        </div>

        <Button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="rounded-xl bg-[#FF5412] text-xs font-bold text-white hover:bg-orange-600"
        >
          <Download className="mr-2 h-4 w-4" />

          {downloading ? "Menyiapkan PDF..." : "Download PDF"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Invoice */}
        <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm lg:col-span-2">
          {/* Invoice Header */}
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF5412] text-white">
                    <Receipt className="h-5 w-5" />
                  </div>

                  <div>
                    <CardTitle className="text-lg font-extrabold text-slate-900">
                      CARWASH APP
                    </CardTitle>

                    <p className="text-xs text-slate-500">Invoice Pembayaran</p>
                  </div>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Invoice No.
                </p>

                <p className="mt-1 font-mono text-sm font-extrabold text-slate-900">
                  {invoice.invoice_no}
                </p>

                <p className="mt-1 text-[11px] text-slate-500">
                  {formatDate(invoice.issued_at)}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-6">
            {/* Customer & Vehicle */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <User className="h-4 w-4 text-[#FF5412]" />

                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Customer
                  </span>
                </div>

                <p className="mt-2 text-sm font-extrabold text-slate-900">
                  {order.customers?.name || "-"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <Car className="h-4 w-4 text-[#FF5412]" />

                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Kendaraan
                  </span>
                </div>

                <p className="mt-2 font-mono text-sm font-extrabold text-slate-900">
                  {order.vehicles?.plate_number || "-"}
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  {[order.vehicles?.brand, order.vehicles?.model]
                    .filter(Boolean)
                    .join(" ") || "-"}
                </p>
              </div>
            </div>

            {/* Staff */}
            <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-4">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-[#FF5412]" />

                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Staff Pengerjaan
                </span>
              </div>

              <p className="mt-2 text-sm font-extrabold text-slate-900">
                {order.staffs?.name || "Belum ditentukan"}
              </p>

              <p className="mt-0.5 text-[11px] text-slate-500">
                Staff yang ditugaskan untuk pengerjaan kendaraan
              </p>
            </div>

            <Separator />

            {/* Services */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">
                    Rincian Layanan
                  </h2>

                  <p className="text-[11px] text-slate-500">
                    Layanan yang terdapat dalam pesanan
                  </p>
                </div>

                <span className="text-xs font-semibold text-slate-400">
                  {order.order_items?.length || 0} layanan
                </span>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="hidden grid-cols-[1fr_80px_130px] gap-4 bg-slate-50 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:grid">
                  <span>Layanan</span>
                  <span className="text-center">Qty</span>
                  <span className="text-right">Subtotal</span>
                </div>

                {order.order_items?.map((item) => (
                  <div
                    key={item.id}
                    className="grid gap-2 border-t border-slate-100 px-4 py-4 sm:grid-cols-[1fr_80px_130px] sm:items-center sm:gap-4"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {item.services?.name || "-"}
                      </p>

                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {formatRupiah(item.services?.price || 0)}
                      </p>
                    </div>

                    <div className="text-left text-xs font-semibold text-slate-600 sm:text-center">
                      x{item.qty || 1}
                    </div>

                    <div className="text-sm font-extrabold text-slate-900 sm:text-right">
                      {formatRupiah(item.subtotal)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Total */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500">
                  Total Pembayaran
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  Sudah termasuk seluruh layanan
                </p>
              </div>

              <p className="text-xl font-extrabold text-[#FF5412]">
                {formatRupiah(invoice.total_amount)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right Information */}
        <div className="space-y-6">
          {/* Order */}
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="p-5">
              <CardTitle className="text-base font-bold text-slate-900">
                Informasi Pesanan
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 p-5 pt-0">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Order ID</span>

                <span className="text-xs font-bold text-slate-900">
                  #{order.id}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Tanggal Order</span>

                <span className="text-right text-xs font-bold text-slate-900">
                  {formatDate(order.order_date)}
                </span>
              </div>

              {order.check_in_time && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Check-In</span>

                  <span className="text-xs font-bold text-slate-900">
                    {order.check_in_time} WIB
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment */}
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="p-5">
              <CardTitle className="flex items-center gap-2 text-base font-bold text-slate-900">
                <CreditCard className="h-4 w-4 text-[#FF5412]" />
                Pembayaran
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 p-5 pt-0">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Status</span>

                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                  PAID
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Metode</span>

                <span className="text-xs font-bold text-slate-900">
                  {payment?.payment_method || "-"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Diterima</span>

                <span className="text-xs font-bold text-slate-900">
                  {formatRupiah(payment?.amount_received || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Tanggal Bayar</span>

                <span className="text-right text-xs font-bold text-slate-900">
                  {formatPaymentDate(payment?.payment_date)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
