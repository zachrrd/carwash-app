import { Car, Clock3, MapPin, Phone, ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function DashboardFooter() {
  return (
    <footer className="mt-4 border-t border-slate-200 pt-10 pb-5">
      <div className="grid gap-10 md:grid-cols-3">
        {/* =========================
            BRAND
        ========================= */}
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF5412] text-white shadow-md shadow-orange-500/20">
              <Car className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-extrabold tracking-tight text-slate-900">
                CleanRide
                <span className="text-[#FF5412]">Neo</span>
              </p>

              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Smart Carwash
              </p>
            </div>
          </div>

          <p className="mt-4 max-w-sm text-xs leading-6 text-slate-500">
            Pengalaman carwash yang lebih mudah, praktis, dan nyaman untuk
            kendaraanmu.
          </p>

          <Button
            type="button"
            variant="ghost"
            className="mt-3 h-auto gap-1.5 px-0 text-xs font-bold text-[#FF5412] hover:bg-transparent hover:text-[#E33D00]"
          >
            Pesan layanan
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* =========================
            INFORMATION
        ========================= */}
        <div>
          <p className="text-sm font-bold text-slate-900">Informasi</p>

          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#FF5412]">
                <Clock3 className="h-3.5 w-3.5" />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-700">
                  Jam Operasional
                </p>

                <p className="mt-0.5 text-[11px] text-slate-500">
                  Senin - Minggu, 08:00 - 20:00
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#FF5412]">
                <MapPin className="h-3.5 w-3.5" />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-700">Lokasi</p>

                <p className="mt-0.5 text-[11px] text-slate-500">
                  Lokasi CleanRideNeo
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#FF5412]">
                <Phone className="h-3.5 w-3.5" />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-700">
                  Customer Support
                </p>

                <p className="mt-0.5 text-[11px] text-slate-500">
                  Siap membantu kebutuhanmu
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =========================
            CUSTOMER
        ========================= */}
        <div>
          <p className="text-sm font-bold text-slate-900">Customer</p>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
              <p className="text-xs font-semibold text-slate-700">
                Booking layanan dengan mudah
              </p>

              <p className="mt-1 text-[11px] leading-5 text-slate-500">
                Pilih layanan dan kendaraan tanpa proses yang ribet.
              </p>
            </div>

            <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
              <p className="text-xs font-semibold text-slate-700">
                Pantau status kendaraan
              </p>

              <p className="mt-1 text-[11px] leading-5 text-slate-500">
                Lihat perkembangan pesananmu secara lebih praktis.
              </p>
            </div>

            <div className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
              <p className="text-xs font-semibold text-slate-700">
                Riwayat pesanan
              </p>

              <p className="mt-1 text-[11px] leading-5 text-slate-500">
                Akses kembali seluruh riwayat layanan kendaraanmu.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          COPYRIGHT
      ========================= */}
      <div className="mt-10 flex flex-col gap-2 border-t border-slate-100 pt-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <p className="text-[11px] text-slate-400">
          © {new Date().getFullYear()} CleanRideNeo. All rights reserved.
        </p>

        <p className="text-[11px] text-slate-400">Smart carwash experience.</p>
      </div>
    </footer>
  );
}
