import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTASection() {
  return (
    <section className="px-4 pb-16 sm:px-6 sm:pb-20">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#FF7336] via-[#FF5412] to-[#D93600] px-6 py-12 text-center text-white shadow-2xl shadow-orange-500/20 sm:px-10">
        <div className="mx-auto max-w-2xl">
          <Sparkles className="mx-auto h-7 w-7 text-orange-100" />

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Kendaraan siap tampil maksimal?
          </h2>

          <p className="mt-3 text-sm leading-6 text-white/75">
            Buat akun sekarang dan nikmati pengalaman carwash yang lebih mudah
            dan praktis.
          </p>

          <Link
            to="/register"
            className="mt-7 inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-[#E33D00] shadow-lg transition hover:bg-orange-50"
          >
            Mulai Sekarang
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
