import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Car, Droplets } from "lucide-react";

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

const SKELETON_ITEMS = [1, 2, 3];

const formatRupiah = (value: string | number) => {
  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return "Rp 0";
  }

  return `Rp ${amount.toLocaleString("id-ID")}`;
};

export default function ServicePreview() {
  const navigate = useNavigate();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadServices = async () => {
      try {
        const response = await api.get<ServicesResponse>("/services/public", {
          params: {
            page: 1,
            limit: 100,
            status: "ACTIVE",
          },
        });

        if (mounted) {
          setServices(response.data.data.services ?? []);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard services:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadServices();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="w-full">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-[#FF5412]">Layanan Kami</p>

          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
            Pilih perawatan kendaraanmu
          </h2>

          <p className="mt-1.5 text-sm text-slate-500">
            Temukan layanan terbaik untuk menjaga kendaraanmu tetap prima.
          </p>
        </div>

        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate("/services")}
          className="
            h-9
            w-fit
            shrink-0
            rounded-lg
            px-3
            text-sm
            font-bold
            text-[#FF5412]
            transition-colors
            hover:bg-orange-50
            hover:text-[#E33D00]
          "
        >
          Lihat semua
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </div>

      {/* LOADING */}
      {loading && (
        <div
          className="
            flex
            gap-5
            overflow-hidden
            pb-3
          "
        >
          {SKELETON_ITEMS.map((item) => (
            <Card
              key={item}
              className="
                w-[290px]
                shrink-0
                overflow-hidden
                rounded-2xl
                border-slate-100
                bg-white
                shadow-sm
                sm:w-[310px]
              "
            >
              <Skeleton className="aspect-[16/10] w-full rounded-none" />

              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <Skeleton className="h-5 w-36 rounded-md" />

                  <Skeleton className="h-6 w-16 rounded-lg" />
                </div>

                <div className="mt-5 flex items-end justify-between gap-3">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-24 rounded-md" />
                    <Skeleton className="h-6 w-28 rounded-md" />
                  </div>

                  <Skeleton className="h-10 w-20 rounded-xl" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && services.length === 0 && (
        <Card className="rounded-2xl border-dashed border-slate-200 bg-white shadow-none">
          <CardContent className="flex flex-col items-center justify-center px-5 py-14 text-center">
            <div
              className="
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-orange-50
              "
            >
              <Droplets className="h-7 w-7 text-[#FF5412]/40" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-700">
              Belum ada layanan tersedia
            </h3>

            <p className="mt-1 max-w-sm text-xs text-slate-400">
              Saat ini belum ada layanan aktif yang dapat ditampilkan.
            </p>
          </CardContent>
        </Card>
      )}

      {/* SERVICE LIST */}
      {!loading && services.length > 0 && (
        <div className="relative">
          <div
            className="
              flex
              gap-5
              overflow-x-auto
              pb-4
              scroll-smooth
              snap-x
              snap-mandatory
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
            "
          >
            {services.map((service) => (
              <Card
                key={service.id}
                className="
                  group
                  w-[290px]
                  shrink-0
                  snap-start
                  overflow-hidden
                  rounded-2xl
                  border-slate-100
                  bg-white
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:border-slate-200
                  hover:shadow-xl
                  hover:shadow-slate-200/60
                  sm:w-[310px]
                "
              >
                {/* IMAGE */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  {service.image_url ? (
                    <img
                      src={service.image_url}
                      alt={service.name}
                      loading="lazy"
                      className="
                        h-full
                        w-full
                        object-cover
                        transition-transform
                        duration-500
                        ease-out
                        group-hover:scale-105
                      "
                    />
                  ) : (
                    <div
                      className="
                        flex
                        h-full
                        w-full
                        items-center
                        justify-center
                        bg-gradient-to-br
                        from-orange-50
                        to-orange-100
                      "
                    >
                      <Car className="h-12 w-12 text-[#FF5412]/30" />
                    </div>
                  )}

                  {/* IMAGE OVERLAY */}
                  <div
                    className="
                      pointer-events-none
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-black/10
                      via-transparent
                      to-transparent
                    "
                  />

                  {/* STATUS */}
                  <Badge
                    variant="secondary"
                    className="
                      absolute
                      left-3
                      top-3
                      border
                      border-white/70
                      bg-white/95
                      px-2.5
                      py-1
                      text-[10px]
                      font-extrabold
                      tracking-wide
                      text-emerald-600
                      shadow-sm
                      backdrop-blur-sm
                      hover:bg-white/95
                    "
                  >
                    AVAILABLE
                  </Badge>
                </div>

                {/* CONTENT */}
                <CardContent className="p-5">
                  <div className="flex min-h-[48px] items-start justify-between gap-3">
                    <h3
                      className="
                        line-clamp-2
                        text-base
                        font-extrabold
                        leading-snug
                        text-slate-900
                      "
                    >
                      {service.name}
                    </h3>

                    <Badge
                      variant="secondary"
                      className="
                        shrink-0
                        rounded-lg
                        border-0
                        bg-orange-50
                        px-2
                        py-1
                        text-[10px]
                        font-extrabold
                        text-[#FF5412]
                        hover:bg-orange-50
                      "
                    >
                      {service.duration} min
                    </Badge>
                  </div>

                  <div className="mt-5 flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p
                        className="
                          text-[10px]
                          font-semibold
                          uppercase
                          tracking-[0.12em]
                          text-slate-400
                        "
                      >
                        Mulai dari
                      </p>

                      <p className="mt-1 text-lg font-extrabold tracking-tight text-[#FF5412]">
                        {formatRupiah(service.price)}
                      </p>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => navigate(`/services/${service.id}`)}
                      className="
                        h-10
                        shrink-0
                        rounded-xl
                        bg-slate-900
                        px-3.5
                        text-xs
                        font-bold
                        text-white
                        shadow-sm
                        transition-all
                        duration-200
                        hover:bg-[#FF5412]
                        hover:shadow-md
                      "
                    >
                      Detail
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* RIGHT EDGE HINT */}
          <div
            className="
              pointer-events-none
              absolute
              right-0
              top-0
              hidden
              h-full
              w-20
              bg-gradient-to-l
              from-[#F4F6FA]
              via-[#F4F6FA]/70
              to-transparent
              sm:block
            "
          />
        </div>
      )}
    </section>
  );
}
