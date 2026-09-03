import { useState } from "react";
import { Link } from "react-router-dom";
import { Car, Menu, X } from "lucide-react";

export default function LandingNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200/60 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF5412] text-white shadow-lg shadow-orange-500/20">
            <Car className="h-5 w-5" />
          </div>

          <div>
            <p className="text-sm font-extrabold tracking-tight">
              CleanRide<span className="text-[#FF5412]">Neo</span>
            </p>

            <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Carwash
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          <a
            href="#services"
            className="text-sm font-medium text-slate-600 transition hover:text-[#FF5412]"
          >
            Services
          </a>

          <a
            href="#why-us"
            className="text-sm font-medium text-slate-600 transition hover:text-[#FF5412]"
          >
            Why Us
          </a>

          <a
            href="#how-it-works"
            className="text-sm font-medium text-slate-600 transition hover:text-[#FF5412]"
          >
            How It Works
          </a>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/login"
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="rounded-xl bg-[#FF5412] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/20 transition hover:bg-[#E33D00]"
          >
            Register
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-700 md:hidden"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            <a
              href="#services"
              onClick={closeMenu}
              className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Services
            </a>

            <a
              href="#why-us"
              onClick={closeMenu}
              className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Why Us
            </a>

            <a
              href="#how-it-works"
              onClick={closeMenu}
              className="rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              How It Works
            </a>

            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
              <Link
                to="/login"
                className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="rounded-xl bg-[#FF5412] px-4 py-3 text-center text-sm font-semibold text-white"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
