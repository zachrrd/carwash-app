import { Car, CheckCircle2, Droplets, Sparkles } from "lucide-react";

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-[#FF5412]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Simple Process
          </div>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Semudah 3 langkah
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <div className="relative rounded-2xl border border-slate-100 bg-slate-50 p-6">
            <span className="text-5xl font-black text-orange-100">01</span>

            <div className="mt-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF5412] text-white">
              <Car className="h-5 w-5" />
            </div>

            <h3 className="mt-4 font-extrabold text-slate-900">Buat Akun</h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Daftar dan lengkapi informasi kendaraanmu.
            </p>
          </div>

          <div className="relative rounded-2xl border border-slate-100 bg-slate-50 p-6">
            <span className="text-5xl font-black text-orange-100">02</span>

            <div className="mt-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF5412] text-white">
              <Droplets className="h-5 w-5" />
            </div>

            <h3 className="mt-4 font-extrabold text-slate-900">
              Pilih Layanan
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Pilih layanan carwash yang sesuai dengan kendaraanmu.
            </p>
          </div>

          <div className="relative rounded-2xl border border-slate-100 bg-slate-50 p-6">
            <span className="text-5xl font-black text-orange-100">03</span>

            <div className="mt-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[#FF5412] text-white">
              <Sparkles className="h-5 w-5" />
            </div>

            <h3 className="mt-4 font-extrabold text-slate-900">
              Sit Back & Relax
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Pantau proses dan tunggu kendaraanmu kembali bersih.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
