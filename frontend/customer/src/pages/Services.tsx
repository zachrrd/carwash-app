import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Car,
  Clock3,
  Droplets,
  Search,
  Sparkles,
} from "lucide-react";

import { getServices } from "@/services/service.service";
import type { Service } from "@/types/service";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getServices({
          page: 1,
          limit: 100,
          status: "ACTIVE",
        });

        setServices(result.services);
      } catch (err) {
        console.error("Failed to fetch services:", err);
        setError("Gagal memuat layanan. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  const filteredServices = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return services;
    }

    return services.filter((service) =>
      service.name.toLowerCase().includes(keyword),
    );
  }, [services, search]);

  return (
    <div className="space-y-8">
      {/* =========================
          HEADER
      ========================= */}
      <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#FF7336] via-[#FF5412] to-[#E33D00] px-5 py-8 text-white shadow-xl shadow-orange-500/20 sm:px-8 sm:py-10">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-60 w-60 rounded-full bg-black/10 blur-3xl" />

        <div className="relative z-10 max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            CleanRideNeo Services
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Pilih layanan terbaik
            <br className="hidden sm:block" />
            untuk kendaraanmu.
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-7 text-white/80 sm:text-base">
            Temukan berbagai pilihan perawatan kendaraan yang praktis,
            profesional, dan sesuai dengan kebutuhanmu.
          </p>
        </div>
      </section>

      {/* =========================
          SEARCH
      ========================= */}
      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#FF5412]">Layanan Kami</p>

            <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
              Semua layanan
            </h2>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari layanan..."
              className="h-11 rounded-xl border-slate-200 bg-white pl-9 pr-4 text-sm shadow-sm focus-visible:border-[#FF5412] focus-visible:ring-[#FF5412]/20"
            />
          </div>
        </div>
      </section>

      {/* =========================
          ERROR
      ========================= */}
      {error && !loading && (
        <Card className="rounded-2xl border-red-100 bg-red-50">
          <CardContent className="flex flex-col items-center justify-center px-5 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-500">
              <Droplets className="h-5 w-5" />
            </div>

            <p className="mt-4 text-sm font-semibold text-red-700">{error}</p>

            <Button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
            >
              Coba Lagi
            </Button>
          </CardContent>
        </Card>
      )}

      {/* =========================
          LOADING
      ========================= */}
      {loading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Card
              key={item}
              className="overflow-hidden rounded-2xl border-slate-100 shadow-sm"
            >
              <Skeleton className="aspect-[16/10] w-full rounded-none" />

              <CardContent className="p-5">
                <Skeleton className="h-5 w-3/4" />

                <Skeleton className="mt-3 h-4 w-1/2" />

                <div className="mt-6 flex items-end justify-between">
                  <div>
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="mt-2 h-6 w-28" />
                  </div>

                  <Skeleton className="h-10 w-24 rounded-xl" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* =========================
          EMPTY
      ========================= */}
      {!loading && !error && filteredServices.length === 0 && (
        <Card className="rounded-2xl border-dashed border-slate-200 shadow-none">
          <CardContent className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#FF5412]">
              <Droplets className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-base font-bold text-slate-900">
              {search
                ? "Layanan tidak ditemukan"
                : "Belum ada layanan tersedia"}
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {search
                ? "Coba gunakan kata kunci pencarian yang berbeda."
                : "Saat ini belum ada layanan aktif yang dapat dipesan."}
            </p>

            {search && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setSearch("")}
                className="mt-5 rounded-xl"
              >
                Reset pencarian
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* =========================
          SERVICE GRID
      ========================= */}
      {!loading && !error && filteredServices.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <Card
              key={service.id}
              className="group overflow-hidden rounded-2xl border-slate-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60"
            >
              {/* IMAGE */}
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                {service.image_url ? (
                  <>
                    <img
                      src={service.image_url}
                      alt={service.name}
                      className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />

                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60" />
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100">
                    <Car className="h-14 w-14 text-[#FF5412]/25" />
                  </div>
                )}

                <Badge className="absolute left-3 top-3 border border-white/70 bg-white/90 text-[10px] font-bold text-emerald-600 shadow-sm backdrop-blur-sm hover:bg-white/90">
                  AVAILABLE
                </Badge>
              </div>

              {/* CONTENT */}
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="line-clamp-2 text-base font-extrabold leading-6 text-slate-900">
                    {service.name}
                  </h3>

                  <Badge
                    variant="secondary"
                    className="shrink-0 rounded-lg bg-orange-50 px-2 py-1 text-[10px] font-bold text-[#FF5412] hover:bg-orange-50"
                  >
                    {service.duration} min
                  </Badge>
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                  <Clock3 className="h-3.5 w-3.5" />
                  <span>{formatDuration(service.duration)}</span>
                </div>

                <div className="mt-6 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                      Mulai dari
                    </p>

                    <p className="mt-1 text-lg font-extrabold text-[#FF5412]">
                      {formatRupiah(service.price)}
                    </p>
                  </div>

                  <Link to={`/services/${service.id}`}>
                    <Button
                      type="button"
                      className="h-10 rounded-xl bg-slate-900 px-3.5 text-xs font-bold text-white hover:bg-[#FF5412]"
                    >
                      Detail
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && !error && filteredServices.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:flex-row">
          <div>
            <p className="text-sm font-bold text-slate-900">
              Sudah menemukan layanan yang cocok?
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Yuk booking sekarang dan buat kendaraanmu kembali bersih.
            </p>
          </div>

          <Link to="/orders/create">
            <Button
              type="button"
              className="h-10 rounded-xl bg-[#FF5412] px-5 text-xs font-bold text-white hover:bg-[#E33D00]"
            >
              Booking Sekarang
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
