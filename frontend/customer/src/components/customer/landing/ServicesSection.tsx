import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Car, Clock3, Droplets } from "lucide-react";
import api from "@/services/api";

interface Service {
  id: number;
  name: string;
  duration: number;
  price: string;
  status: string;
  image_url: string | null;
}

interface ServicesResponse {
  success: boolean;
  message: string;
  data: {
    services: Service[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

const formatRupiah = (value: string) => {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return "Rp 0";
  }

  return `Rp ${number.toLocaleString("id-ID")}`;
};

export default function ServicesSection() {
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await api.get<ServicesResponse>("/services/public", {
          params: {
            page: 1,
            limit: 100,
            status: "ACTIVE",
          },
        });

        setServices(response.data.data.services ?? []);
      } catch (error) {
        console.error("Failed to fetch services:", error);
      } finally {
        setLoadingServices(false);
      }
    };

    loadServices();
  }, []);

  const scrollServices = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    const scrollAmount = 360;

    scrollRef.current.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section id="services" className="scroll-mt-20 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-[#FF5412]">
              <Droplets className="h-3.5 w-3.5" />
              Our Services
            </div>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Pilih perawatan terbaik
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
              Berbagai pilihan layanan untuk menjaga kendaraan tetap bersih,
              nyaman, dan terlihat seperti baru.
            </p>
          </div>

          {/* Navigation Buttons */}
          {!loadingServices && services.length > 0 && (
            <div className="hidden shrink-0 gap-2 sm:flex">
              <button
                type="button"
                onClick={() => scrollServices("left")}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-[#FF5412] hover:bg-orange-50 hover:text-[#FF5412]"
                aria-label="Previous services"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => scrollServices("right")}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-[#FF5412] hover:bg-orange-50 hover:text-[#FF5412]"
                aria-label="Next services"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Loading */}
        {loadingServices ? (
          <div className="mt-10 flex gap-5 overflow-hidden">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="min-w-[280px] animate-pulse overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm sm:min-w-[320px]"
              >
                <div className="aspect-[16/10] bg-slate-100" />

                <div className="space-y-3 p-5">
                  <div className="h-5 w-2/3 rounded bg-slate-100" />
                  <div className="h-4 w-1/3 rounded bg-slate-100" />
                  <div className="h-10 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-slate-200 px-5 py-12 text-center">
            <Droplets className="mx-auto h-8 w-8 text-slate-300" />

            <p className="mt-3 text-sm font-medium text-slate-500">
              Belum ada layanan yang tersedia.
            </p>
          </div>
        ) : (
          <>
            {/* Horizontal Services */}
            <div
              ref={scrollRef}
              className="services-scroll mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-5"
            >
              {services.map((service) => (
                <div
                  key={service.id}
                  className="group min-w-[285px] snap-start overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60 sm:min-w-[320px] lg:min-w-[340px]"
                >
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    {service.image_url ? (
                      <img
                        src={service.image_url}
                        alt={service.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
                        <Car className="h-12 w-12 text-[#FF5412]/30" />
                      </div>
                    )}

                    <div className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-emerald-600 shadow-sm">
                      AVAILABLE
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="line-clamp-2 text-base font-extrabold text-slate-900">
                        {service.name}
                      </h3>

                      <div className="flex shrink-0 items-center gap-1 rounded-lg bg-orange-50 px-2 py-1 text-[10px] font-bold text-[#FF5412]">
                        <Clock3 className="h-3 w-3" />
                        {service.duration} min
                      </div>
                    </div>

                    <div className="mt-5 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
                          Starting from
                        </p>

                        <p className="mt-1 text-lg font-extrabold text-[#FF5412]">
                          {formatRupiah(service.price)}
                        </p>
                      </div>

                      <Link
                        to="/register"
                        className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 text-xs font-bold text-white transition hover:bg-[#FF5412]"
                      >
                        Book
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Hint */}
            {services.length > 1 && (
              <div className="mt-1 flex items-center justify-center gap-2 text-xs font-medium text-slate-400 sm:hidden">
                <ArrowLeft className="h-3.5 w-3.5" />
                Geser untuk melihat layanan lainnya
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Hide scrollbar */}
      <style>{`
        .services-scroll {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .services-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
