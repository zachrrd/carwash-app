import { useNavigate } from "react-router-dom";
import { ArrowRight, Clock3, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function WelcomeHero() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#FF7336] via-[#FF5412] to-[#E33D00] px-5 py-8 text-white shadow-xl shadow-orange-500/20 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
      {/* Decorative background */}
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-black/10 blur-2xl" />

      <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        {/* Main Content */}
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5" />
            Smart Carwash Experience
          </div>

          {/* Greeting */}
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Halo, {user?.name ?? "Customer"}
          </h1>

          {/* Description */}
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/80 sm:text-base">
            Siap membuat kendaraanmu kembali bersih? Pilih layanan yang sesuai
            dan nikmati pengalaman carwash yang lebih mudah dan praktis.
          </p>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              onClick={() => navigate("/services")}
              className="h-11 rounded-xl bg-white px-5 font-semibold text-[#FF5412] shadow-lg hover:bg-white/90"
            >
              Booking Sekarang
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <Button
              type="button"
              onClick={() => navigate("/orders")}
              variant="outline"
              className="h-11 rounded-xl border-white/30 bg-white/10 px-5 font-semibold text-white hover:bg-white/20 hover:text-white"
            >
              Lihat Pesanan
            </Button>
          </div>
        </div>

        {/* Quick Info */}
        <div className="hidden w-full max-w-xs rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md lg:block">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
              <Clock3 className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs text-white/60">Carwash Experience</p>

              <p className="mt-1 text-sm font-bold">Cepat & Praktis</p>
            </div>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
            <div className="h-full w-full rounded-full bg-white" />
          </div>

          <p className="mt-2 text-[11px] text-white/60">
            Pesan layanan tanpa proses yang ribet.
          </p>
        </div>
      </div>
    </section>
  );
}
