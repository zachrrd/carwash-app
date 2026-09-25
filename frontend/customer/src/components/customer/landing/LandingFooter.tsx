import { Car } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-7 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF5412] text-white">
            <Car className="h-4 w-4" />
          </div>

          <div>
            <p className="text-xs font-extrabold">
              CleanRide<span className="text-[#FF5412]">Neo</span>
            </p>

            <p className="text-[9px] text-slate-400">
              Smart Carwash Experience
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} CleanRideNeo. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
