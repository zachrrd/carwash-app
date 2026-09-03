import { Link } from "react-router-dom";
import {
  ArrowRight,
  Car,
  CheckCircle2,
  Clock3,
  Droplets,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#F4F6FA] pt-28">
      <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-orange-200/40 blur-3xl" />
      <div className="absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-orange-100/50 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 sm:px-6 md:pb-20 lg:grid-cols-2 lg:gap-16 lg:pt-10">
        <div className="text-center lg:text-left">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3.5 py-2 text-xs font-semibold text-[#E33D00] lg:mx-0">
            <Sparkles className="h-3.5 w-3.5" />
            Smart Carwash Experience
          </div>

          <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Kendaraan bersih.
            <span className="block text-[#FF5412]">Kamu tinggal santai.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-500 sm:text-base lg:mx-0">
            Nikmati layanan carwash yang praktis tanpa antre lama. Pilih
            layanan, buat pesanan, dan pantau proses kendaraanmu langsung dari
            smartphone.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              to="/register"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#FF5412] px-6 text-sm font-bold text-white shadow-xl shadow-orange-500/20 transition hover:bg-[#E33D00]"
            >
              Pesan Sekarang
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#services"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Lihat Layanan
            </a>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-3 text-xs font-medium text-slate-500 lg:justify-start">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Proses praktis
            </span>

            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Harga transparan
            </span>

            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Status real-time
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#FF7336] via-[#FF5412] to-[#D93600] p-5 shadow-2xl shadow-orange-500/20 sm:p-7">
            <div className="absolute -right-14 -top-14 h-40 w-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-black/10" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-white/70">
                    Your carwash
                  </p>

                  <h2 className="mt-1 text-xl font-extrabold text-white">
                    CleanRideNeo
                  </h2>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#FF5412] shadow-lg">
                  <Car className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-7 rounded-2xl bg-white/10 p-4 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/70">Service Status</p>

                    <p className="mt-1 text-sm font-bold text-white">
                      Ready when you are
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-400 px-2.5 py-1 text-[10px] font-bold text-emerald-950">
                    OPEN
                  </span>
                </div>

                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
                    <Droplets className="h-5 w-5 text-blue-100" />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between text-[11px] text-white/70">
                      <span>Carwash Experience</span>
                      <span>100%</span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
                      <div className="h-full w-full rounded-full bg-white" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/10 p-3">
                  <Clock3 className="h-4 w-4 text-white/80" />

                  <p className="mt-2 text-xs font-semibold text-white">
                    Fast Service
                  </p>

                  <p className="mt-0.5 text-[10px] text-white/60">
                    Hemat waktu
                  </p>
                </div>

                <div className="rounded-xl bg-white/10 p-3">
                  <ShieldCheck className="h-4 w-4 text-white/80" />

                  <p className="mt-2 text-xs font-semibold text-white">
                    Quality Care
                  </p>

                  <p className="mt-0.5 text-[10px] text-white/60">
                    Perawatan terbaik
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-4 -left-3 hidden rounded-2xl border border-slate-100 bg-white p-3 shadow-xl sm:flex sm:items-center sm:gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#FF5412]">
              <Star className="h-4 w-4 fill-current" />
            </div>

            <div>
              <p className="text-xs font-bold text-slate-900">Premium Care</p>

              <p className="text-[10px] text-slate-400">Untuk kendaraanmu</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
