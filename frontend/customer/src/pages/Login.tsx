import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
  Car, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Clock, 
  Droplets,
  ArrowRight,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(form.email, form.password);
      navigate("/home");
    } catch (err: unknown) {
      const error = err as {
        response?: {
          data?: {
            message?: string;
            errors?: { message: string }[];
          };
        };
      };

      const message =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.message ||
        "Email atau password yang Anda masukkan salah.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F6FA] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-orange-500 selection:text-white">
      {/* Master Container Card */}
      <div className="w-full max-w-5xl bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl shadow-slate-200/80 border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px] transition-all">
        
        {/* LEFT SIDE: Hero / Branding Panel (Desktop & Tablet) */}
        <div className="lg:col-span-6 p-4 sm:p-5 hidden md:flex flex-col">
          <div className="relative flex-1 rounded-[24px] sm:rounded-[30px] bg-gradient-to-br from-[#FF7336] via-[#FF5412] to-[#E33D00] p-8 sm:p-10 text-white flex flex-col justify-between overflow-hidden shadow-inner">
            
            {/* Background Decorative Graphic Elements */}
            <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-56 h-56 rounded-full bg-black/10 blur-2xl pointer-events-none" />
            <div className="absolute right-8 top-1/3 w-28 h-28 rounded-full border border-white/15 pointer-events-none animate-pulse" />
            <div className="absolute left-12 bottom-1/4 w-16 h-16 rounded-full border border-white/10 pointer-events-none" />

            {/* Top Tagline & Headline */}
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide text-white border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Smart & On-Demand Carwash</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.2]">
                Cuci kendaraan jadi lebih mudah, cepat & praktis.
              </h1>

              <p className="text-white/85 text-sm sm:text-base leading-relaxed max-w-md font-normal">
                Pantau antrean dan status pengerjaan carwash secara real-time langsung dari smartphone Anda.
              </p>
            </div>

            {/* Center / Bottom Illustration Cards */}
            <div className="relative z-10 my-8 flex flex-col items-center justify-center">
              {/* Main Visual Badge */}
              <div className="relative w-full max-w-[320px] bg-white/10 backdrop-blur-xl border border-white/25 rounded-2xl p-5 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white text-[#FF5412] flex items-center justify-center shadow-lg shadow-black/10">
                      <Car className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">CleanRide Express</h4>
                      <p className="text-xs text-white/75">Premium Wash & Coating</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400 text-emerald-950">
                    Live Status
                  </span>
                </div>

                {/* Progress Mini Bar */}
                <div className="bg-black/20 rounded-xl p-3 border border-white/10 space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="flex items-center gap-1.5 text-white/90">
                      <Droplets className="w-3.5 h-3.5 text-blue-200" />
                      Tahap Pengerjaan
                    </span>
                    <span className="text-amber-200 font-semibold">Sedang Dicuci (65%)</span>
                  </div>
                  <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-300 to-emerald-300 h-full w-[65%] rounded-full animate-pulse" />
                  </div>
                </div>

                {/* Floating Micro Highlights */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-white/10 rounded-lg p-2 flex items-center gap-2 text-xs">
                    <Clock className="w-4 h-4 text-amber-200 flex-shrink-0" />
                    <span className="truncate text-white/90">Estimasi 25 Mnt</span>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2 flex items-center gap-2 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-200 flex-shrink-0" />
                    <span className="truncate text-white/90">100% Bergaransi</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Footer Note */}
            <div className="relative z-10 flex items-center justify-between text-xs text-white/75 pt-2 border-t border-white/15">
              <span>© {new Date().getFullYear()} CleanRideNeo App</span>
              <span className="flex items-center gap-1 font-medium text-white">
                <Sparkles className="w-3 h-3 text-amber-200" /> Shine Every Ride
              </span>
            </div>

          </div>
        </div>

        {/* RIGHT SIDE: Clean Login Form */}
        <div className="lg:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto space-y-7">
            
            {/* Header / Brand Logo */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF5412] to-[#FF8548] flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
                  <Car className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-extrabold text-lg tracking-tight text-slate-900 leading-tight">
                    CleanRide<span className="text-[#FF5412]">Neo</span>
                  </h2>
                  <p className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                    Customer Portal
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Welcome Back 
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Silakan masukkan email dan password untuk masuk ke akun Anda.
                </p>
              </div>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50/90 p-3.5 text-sm text-red-600 flex items-start gap-2.5 animate-in fade-in duration-200">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="h-12 pl-10 pr-4 bg-slate-50/80 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#FF5412] focus:ring-4 focus:ring-orange-500/10 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                    Password
                  </Label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Silakan hubungi admin atau kasir untuk mereset password akun Anda.");
                    }}
                    className="text-xs font-medium text-slate-500 hover:text-[#FF5412] transition-colors"
                  >
                    Lupa password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan kata sandi"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="h-12 pl-10 pr-11 bg-slate-50/80 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#FF5412] focus:ring-4 focus:ring-orange-500/10 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-[#FF5412] hover:bg-[#E33D00] text-white font-semibold shadow-lg shadow-orange-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memproses Masuk...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Akun</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Bottom Signup Link */}
            <div className="pt-2 text-center">
              <p className="text-sm text-slate-500">
                Belum punya akun?{" "}
                <Link
                  to="/register"
                  className="font-bold text-[#FF5412] hover:text-[#E33D00] hover:underline transition-colors"
                >
                  Daftar Sekarang
                </Link>
              </p>
            </div>

            {/* Mobile Feature Highlight Pill (Visible on small screens) */}
            <div className="md:hidden pt-4 border-t border-slate-100 flex items-center justify-center gap-4 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#FF5412]" /> Booking Praktis
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Droplets className="w-3 h-3 text-blue-500" /> Live Tracker
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}