import {
  ArrowRight,
  Clock3,
  Droplets,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function WhyUsSection() {
  return (
    <section id="why-us" className="scroll-mt-20 bg-[#F4F6FA] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-[#FF5412]">
              <Zap className="h-3.5 w-3.5" />
              Why CleanRideNeo
            </div>

            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Bukan sekadar
              <span className="text-[#FF5412]"> cuci mobil.</span>
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-500">
              Kami membuat pengalaman carwash menjadi lebih sederhana dengan
              teknologi yang membantu kamu menghemat waktu.
            </p>

            <Link
              to="/register"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#FF5412]"
            >
              Mulai pengalamanmu
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-[#FF5412]">
                <Clock3 className="h-5 w-5" />
              </div>

              <h3 className="mt-4 font-bold text-slate-900">Hemat Waktu</h3>

              <p className="mt-2 text-xs leading-6 text-slate-500">
                Pesan layanan tanpa perlu datang terlebih dahulu untuk
                mengantre.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                <Droplets className="h-5 w-5" />
              </div>

              <h3 className="mt-4 font-bold text-slate-900">
                Layanan Berkualitas
              </h3>

              <p className="mt-2 text-xs leading-6 text-slate-500">
                Pilihan layanan yang dirancang untuk kebutuhan kendaraan kamu.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <h3 className="mt-4 font-bold text-slate-900">
                Aman & Terpercaya
              </h3>

              <p className="mt-2 text-xs leading-6 text-slate-500">
                Informasi pesanan dan status kendaraan dapat dipantau dengan
                mudah.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-500">
                <Sparkles className="h-5 w-5" />
              </div>

              <h3 className="mt-4 font-bold text-slate-900">
                Modern Experience
              </h3>

              <p className="mt-2 text-xs leading-6 text-slate-500">
                Semua kebutuhan carwash dalam pengalaman digital yang sederhana.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
