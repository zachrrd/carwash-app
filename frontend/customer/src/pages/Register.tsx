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
  User, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
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
      await register(form);
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
        "Registrasi akun gagal. Pastikan email dan nomor telepon belum terdaftar.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F6FA] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-orange-500 selection:text-white">
      {/* Master Container Card */}
      <div className="w-full max-w-5xl bg-white rounded-[28px] sm:rounded-[36px] shadow-2xl shadow-slate-200/80 border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[680px] transition-all">
        
        {/* LEFT SIDE: Hero / Branding Panel (Desktop & Tablet) */}
        <div className="lg:col-span-5 p-4 sm:p-5 hidden md:flex flex-col">
          <div className="relative flex-1 rounded-[24px] sm:rounded-[30px] bg-gradient-to-br from-[#FF7336] via-[#FF5412] to-[#E33D00] p-8 text-white flex flex-col justify-between overflow-hidden shadow-inner">
            
            {/* Background Decorative Circles */}
            <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-56 h-56 rounded-full bg-black/10 blur-2xl pointer-events-none" />
            <div className="absolute right-8 bottom-1/3 w-24 h-24 rounded-full border border-white/15 pointer-events-none" />

            {/* Top Tagline & Headline */}
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide text-white border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Mulai Pengalaman Cuci Terbaik</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-[1.2]">
                Daftar sekali, nikmati kemudahan cuci kapan saja.
              </h1>

              <p className="text-white/85 text-xs sm:text-sm leading-relaxed font-normal">
                Bergabunglah dengan ribuan customer yang menikmati antrean teratur, transparansi harga, dan tracking live status.
              </p>
            </div>

            {/* Benefit Checkpoints */}
            <div className="relative z-10 my-6 space-y-3">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-white">Kelola Banyak Kendaraan</p>
                  <p className="text-white/75">Simpan plat mobil & motor tanpa input ulang</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center flex-shrink-0">
                  <Car className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-white">Live Status Tracker</p>
                  <p className="text-white/75">Pantau tahapan cuci langsung dari HP</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-400/20 text-blue-300 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-white">Riwayat & Struk Digital</p>
                  <p className="text-white/75">Semua invoice tersimpan rapi dan aman</p>
                </div>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="relative z-10 flex items-center justify-between text-xs text-white/75 pt-2 border-t border-white/15">
              <span>© {new Date().getFullYear()} CleanRideNeo</span>
              <span className="font-medium text-white">100% Free Account</span>
            </div>

          </div>
        </div>

        {/* RIGHT SIDE: Clean Register Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto space-y-6">
            
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
                    Customer Registration
                  </p>
                </div>
              </div>

              <div className="pt-1">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Buat Akun Baru 
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Lengkapi data berikut untuk mulai menikmati layanan booking carwash.
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
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Nama Lengkap */}
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
                  Nama Lengkap *
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Contoh: Budi Santoso"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="h-11 pl-10 pr-4 bg-slate-50/80 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#FF5412] focus:ring-4 focus:ring-orange-500/10 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                  Email Address *
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
                    className="h-11 pl-10 pr-4 bg-slate-50/80 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#FF5412] focus:ring-4 focus:ring-orange-500/10 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Nomor Telepon / WhatsApp */}
              <div className="space-y-1">
                <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">
                  Nomor WhatsApp / HP *
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="081234567890"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    className="h-11 pl-10 pr-4 bg-slate-50/80 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#FF5412] focus:ring-4 focus:ring-orange-500/10 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-700">
                  Password * (Min. 6 Karakter)
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Buat kata sandi aman"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="h-11 pl-10 pr-11 bg-slate-50/80 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#FF5412] focus:ring-4 focus:ring-orange-500/10 transition-all text-sm"
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
                      <span>Mendaftarkan Akun...</span>
                    </>
                  ) : (
                    <>
                      <span>Daftar Sekarang</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Bottom Login Link */}
            <div className="pt-1 text-center">
              <p className="text-sm text-slate-500">
                Sudah memiliki akun?{" "}
                <Link
                  to="/login"
                  className="font-bold text-[#FF5412] hover:text-[#E33D00] hover:underline transition-colors"
                >
                  Masuk di sini
                </Link>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
