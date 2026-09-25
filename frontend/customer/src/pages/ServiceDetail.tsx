import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Car,
  CheckCircle2,
  Clock3,
  Droplets,
} from "lucide-react";

import api from "@/services/api";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Service {
  id: number;
  name: string;
  duration: number;
  price: string;
  status: string;
  image_url: string | null;
  image_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface ServiceResponse {
  success: boolean;
  message: string;
  data: Service;
}

const formatRupiah = (value: string | number) => {
  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return "Rp 0";
  }

  return `Rp ${amount.toLocaleString("id-ID")}`;
};

const formatDuration = (duration: number) => {
  if (duration < 60) {
    return `${duration} menit`;
  }

  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  if (minutes === 0) {
    return `${hours} jam`;
  }

  return `${hours} jam ${minutes} menit`;
};

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadService = async () => {
      if (!id) {
        if (mounted) {
          setError("Service ID tidak ditemukan.");
          setLoading(false);
        }

        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await api.get<ServiceResponse>(
          `/services/public/${id}`,
        );

        if (mounted) {
          setService(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch service detail:", error);

        if (mounted) {
          setError("Layanan tidak ditemukan atau gagal dimuat.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadService();

    return () => {
      mounted = false;
    };
  }, [id]);

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <section className="space-y-6">
        <Skeleton className="h-9 w-36 rounded-md" />

        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <Skeleton className="aspect-[16/10] w-full rounded-3xl" />

          <div className="space-y-5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-20 w-full rounded-2xl" />

            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-24 rounded-2xl" />
              <Skeleton className="h-24 rounded-2xl" />
            </div>

            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </section>
    );
  }

  /* =========================
     ERROR / NOT FOUND
  ========================= */
  if (error || !service) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-[#FF5412]">
            <Droplets className="h-7 w-7" />
          </div>

          <h1 className="mt-5 text-xl font-extrabold text-slate-900">
            Layanan tidak ditemukan
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error || "Layanan yang kamu cari mungkin sudah tidak tersedia."}
          </p>

          <Button
            type="button"
            onClick={() => navigate("/services")}
            className="mt-6 rounded-xl bg-slate-900 px-5 hover:bg-[#FF5412]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Services
          </Button>
        </div>
      </section>
    );
  }

  const isAvailable = service.status === "ACTIVE";

  return (
    <section className="space-y-6">
      {/* =========================
          BACK BUTTON
      ========================= */}
      <div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate("/services")}
          className="px-0 text-sm font-semibold text-slate-500 hover:bg-transparent hover:text-[#FF5412]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Services
        </Button>
      </div>

      {/* =========================
          SERVICE DETAIL
      ========================= */}
      <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
        {/* IMAGE */}
        <Card className="overflow-hidden rounded-3xl border-slate-200 shadow-sm">
          <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
            {service.image_url ? (
              <img
                src={service.image_url}
                alt={service.name}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-50 via-orange-100 to-slate-100">
                <Car className="h-24 w-24 text-[#FF5412]/25" />
              </div>
            )}

            <div className="absolute left-4 top-4">
              <Badge
                variant="secondary"
                className={
                  isAvailable
                    ? "border-0 bg-white/95 text-emerald-600 shadow-sm hover:bg-white/95"
                    : "border-0 bg-white/95 text-slate-500 shadow-sm hover:bg-white/95"
                }
              >
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />

                {isAvailable ? "Available" : "Unavailable"}
              </Badge>
            </div>
          </div>
        </Card>

        {/* INFORMATION */}
        <div className="space-y-6">
          {/* TITLE */}
          <div>
            <p className="text-sm font-semibold text-[#FF5412]">
              Service Detail
            </p>

            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {service.name}
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
              Perawatan kendaraan yang dirancang untuk membuat kendaraanmu
              kembali bersih, nyaman, dan terlihat lebih terawat.
            </p>
          </div>

          {/* PRICE + DURATION */}
          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="rounded-2xl border-orange-100 bg-orange-50/60 shadow-none">
              <CardContent className="p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Harga
                </p>

                <p className="mt-1 text-2xl font-extrabold text-[#FF5412]">
                  {formatRupiah(service.price)}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-100 bg-slate-50 shadow-none">
              <CardContent className="p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Estimasi Durasi
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <Clock3 className="h-5 w-5 text-[#FF5412]" />

                  <p className="text-lg font-extrabold text-slate-900">
                    {formatDuration(service.duration)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* INFORMATION */}
          <Card className="rounded-2xl border-slate-100 shadow-sm">
            <CardContent className="p-5">
              <h2 className="text-sm font-bold text-slate-900">
                Tentang layanan
              </h2>

              <div className="mt-4 space-y-3">
                {/* SERVICE */}
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#FF5412]">
                    <Droplets className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      Perawatan kendaraan
                    </p>

                    <p className="mt-0.5 text-xs leading-5 text-slate-500">
                      Dikerjakan oleh tim carwash untuk memberikan hasil
                      perawatan yang optimal.
                    </p>
                  </div>
                </div>

                {/* DURATION */}
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#FF5412]">
                    <Clock3 className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      Proses terjadwal
                    </p>

                    <p className="mt-0.5 text-xs leading-5 text-slate-500">
                      Estimasi pengerjaan sekitar{" "}
                      <span className="font-semibold text-slate-700">
                        {formatDuration(service.duration)}
                      </span>
                      .
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ACTION */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              disabled={!isAvailable}
              onClick={() =>
                navigate(`/orders/create?service_id=${service.id}`)
              }
              className="
                h-12
                flex-1
                rounded-xl
                bg-[#FF5412]
                px-6
                font-bold
                text-white
                shadow-lg
                shadow-orange-500/20
                hover:bg-[#E33D00]
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Booking Sekarang
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/services")}
              className="
                h-12
                w-full
                rounded-xl
                border-slate-200
                px-6
                font-semibold
                text-slate-700
                hover:border-orange-200
                hover:bg-orange-50
                hover:text-[#FF5412]
                sm:w-auto
              "
            >
              Layanan Lainnya
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
