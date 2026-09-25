import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

import { getInvoiceById } from "@/services/invoice.service";
import type { Invoice as InvoiceType } from "@/types/invoice";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {toast} from "sonner"

export default function Invoice() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<InvoiceType | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchInvoice = async () => {
      if (!id) {
        setError("Invoice ID tidak ditemukan.");
        setLoading(false);
        return;
      }

      try {
        const response = await getInvoiceById(Number(id));

        if (cancelled) return;

        setInvoice(response.data.data);
        setError(null);
      } catch (error) {
        if (cancelled) return;

        console.error(error);
        setError("Gagal mengambil data invoice.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchInvoice();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const formatRupiah = (value: string | number) => {
    return `Rp ${Number(value).toLocaleString("id-ID")}`;
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <p className="text-muted-foreground">Loading invoice...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/payments")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-destructive">
          {error ?? "Invoice tidak ditemukan."}
        </div>
      </div>
    );
  }

  const order = invoice.orders;

  const payment = order.payments[0];

const handleDownloadPDF = async () => {
  const invoiceElement = document.getElementById("invoice");

  if (!invoiceElement || !invoice) {
    toast.error("Data invoice tidak ditemukan.");
    return;
  }

  try {
    const canvas = await html2canvas(invoiceElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = 210;
    const margin = 10;
    const contentWidth = pdfWidth - margin * 2;

    const imgHeight =
      (canvas.height * contentWidth) / canvas.width;

    pdf.addImage(
      imgData,
      "PNG",
      margin,
      margin,
      contentWidth,
      imgHeight,
    );

    pdf.save(`Invoice-${invoice.invoice_no}.pdf`);

    toast.success("Invoice berhasil di-download.");
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    toast.error("Gagal membuat PDF invoice.");
  }
};

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* ACTION */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/payments")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Payments
        </Button>

        <Button onClick={handleDownloadPDF}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>

      {/* INVOICE */}
      <Card
        id="invoice"
        className="print:mx-0 print:w-full print:max-w-none print:border-none print:shadow-none"
      >
        <CardHeader className="border-b text-center">
          <CardTitle className="text-2xl font-bold">CARWASH</CardTitle>

          <p className="text-sm text-muted-foreground">Management App</p>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* INVOICE INFO */}
          <div className="flex flex-col justify-between gap-4 sm:flex-row">
            <div>
              <p className="text-sm text-muted-foreground">Invoice</p>

              <p className="font-semibold">{invoice.invoice_no}</p>
            </div>

            <div className="sm:text-right">
              <p className="text-sm text-muted-foreground">Date</p>

              <p className="font-medium">{formatDate(invoice.issued_at)}</p>
            </div>
          </div>

          {/* CUSTOMER */}
          <div className="grid gap-6 border-y py-5 sm:grid-cols-3">
            <div>
              <p className="mb-1 text-sm text-muted-foreground">Customer</p>

              <p className="font-medium">{order.customers.name}</p>

              <p className="text-sm text-muted-foreground">
                {order.customers.phone ?? "-"}
              </p>
            </div>

            <div>
              <p className="mb-1 text-sm text-muted-foreground">Vehicle</p>

              <p className="font-medium">{order.vehicles.plate_number}</p>

              <p className="text-sm text-muted-foreground">
                {order.vehicles.brand} {order.vehicles.model}
              </p>
            </div>

            {/* STAFF */}
            <div className="sm:text-right">
              <p className="mb-1 text-sm text-muted-foreground">Staff</p>

              <p className="font-medium">
                {order.staffs?.name ?? "Not Assigned"}
              </p>

              {order.staffs?.phone && (
                <p className="text-sm text-muted-foreground">
                  {order.staffs.phone}
                </p>
              )}
            </div>
          </div>

          {/* SERVICES */}
          <div>
            <div className="mb-3 grid grid-cols-12 border-b pb-2 text-sm font-medium text-muted-foreground">
              <span className="col-span-6">Service</span>

              <span className="col-span-2 text-center">Qty</span>

              <span className="col-span-4 text-right">Subtotal</span>
            </div>

            <div className="space-y-3">
              {order.order_items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 text-sm">
                  <span className="col-span-6 font-medium">
                    {item.services.name}
                  </span>

                  <span className="col-span-2 text-center">
                    {item.qty ?? 1}
                  </span>

                  <span className="col-span-4 text-right">
                    {formatRupiah(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* TOTAL */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Total</span>

              <span className="text-xl font-bold">
                {formatRupiah(invoice.total_amount)}
              </span>
            </div>
          </div>

          {/* PAYMENT */}
          {payment && (
            <div className="rounded-lg bg-muted/50 p-4">
              <h3 className="mb-3 font-semibold">Payment</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method</span>

                  <span className="font-medium">{payment.payment_method}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Received</span>

                  <span>{formatRupiah(payment.amount_received)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Change</span>

                  <span>{formatRupiah(payment.change_amount ?? "0")}</span>
                </div>
              </div>
            </div>
          )}

          {/* FOOTER */}
          <div className="border-t pt-5 text-center">
            <p className="font-medium">Thank you for your visit!</p>

            <p className="text-sm text-muted-foreground">
              Please keep this invoice as your payment receipt.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
