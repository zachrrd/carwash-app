import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car, LogOut, Mail, Phone, Plus, Trash2, Pencil } from "lucide-react";

import { updateMyProfile } from "@/services/customer.service";
import { useAuth } from "@/context/AuthContext";
import {
  getMyVehicles,
  createMyVehicle,
  deleteMyVehicle,
} from "@/services/vehicle.service";
import { getMyOrders } from "@/services/order.service";

import type { Vehicle } from "@/types/vehicle";
import type { Order } from "@/types/order";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Profile() {
  const { user, updateUser, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // ADD VEHICLE
  // =========================
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [newPlateNumber, setNewPlateNumber] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newModel, setNewModel] = useState("");
  const [savingVehicle, setSavingVehicle] = useState(false);
  const [vehicleError, setVehicleError] = useState<string | null>(null);

  // =========================
  // EDIT PROFILE
  // =========================
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // =========================
  // DELETE VEHICLE
  // =========================
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // =========================
  // LOAD PROFILE DATA
  // =========================
  useEffect(() => {
    let cancelled = false;

    const loadProfileData = async () => {
      try {
        setLoading(true);

        const [vehiclesData, ordersData] = await Promise.all([
          getMyVehicles(),
          getMyOrders(),
          refreshUser(),
        ]);

        if (!cancelled) {
          setVehicles(vehiclesData);
          setOrders(ordersData);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          console.error("Failed to load profile data:", err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadProfileData();

    return () => {
      cancelled = true;
    };
  }, []);

  // =========================
  // OPEN EDIT PROFILE
  // =========================
  const handleOpenEditProfile = () => {
    setEditName(user?.name ?? "");
    setEditEmail(user?.email ?? "");
    setEditPhone(user?.customer?.phone ?? "");

    setProfileError(null);
    setIsEditProfileOpen(true);
  };

  // =========================
  // SAVE PROFILE
  // =========================
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = editName.trim();
    const email = editEmail.trim().toLowerCase();
    const phone = editPhone.trim();

    if (!name || !email || !phone) {
      setProfileError("Semua data profil wajib diisi.");
      return;
    }

    setSavingProfile(true);
    setProfileError(null);

    try {
      const updatedProfile = await updateMyProfile({
        name,
        email,
        phone,
      });

      // Update AuthContext + localStorage
      updateUser({
        id: updatedProfile.id,
        name: updatedProfile.name,
        email: updatedProfile.email,
        role: updatedProfile.role,
        customer: updatedProfile.customer
          ? {
              id: updatedProfile.customer.id,
              phone: updatedProfile.customer.phone,
            }
          : null,
      });

      setIsEditProfileOpen(false);
    } catch (err: unknown) {
      console.error("Failed to update profile:", err);

      if (typeof err === "object" && err !== null && "response" in err) {
        const response = (
          err as {
            response?: {
              data?: {
                message?: string;
              };
            };
          }
        ).response;

        setProfileError(response?.data?.message ?? "Gagal memperbarui profil.");
      } else {
        setProfileError("Gagal memperbarui profil.");
      }
    } finally {
      setSavingProfile(false);
    }
  };

  // =========================
  // SAVE VEHICLE
  // =========================
  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPlateNumber.trim() || !newBrand.trim() || !newModel.trim()) {
      setVehicleError("Semua kolom data kendaraan wajib diisi.");
      return;
    }

    setSavingVehicle(true);
    setVehicleError(null);

    try {
      const created = await createMyVehicle({
        plate_number: newPlateNumber.trim().toUpperCase(),
        brand: newBrand.trim(),
        model: newModel.trim(),
      });

      setVehicles((prev) => [created, ...prev]);

      setIsAddVehicleOpen(false);
      setNewPlateNumber("");
      setNewBrand("");
      setNewModel("");
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "response" in err) {
        const response = (
          err as {
            response?: {
              data?: {
                message?: string;
              };
            };
          }
        ).response;

        const message = response?.data?.message;

        setVehicleError(message ?? "Gagal menambahkan kendaraan.");
      } else {
        setVehicleError("Gagal menambahkan kendaraan.");
      }
    } finally {
      setSavingVehicle(false);
    }
  };

  // =========================
  // DELETE VEHICLE
  // =========================
  const handleDeleteVehicle = async (id: number) => {
    if (
      !confirm("Apakah kamu yakin ingin menghapus kendaraan ini dari daftar?")
    ) {
      return;
    }

    setDeletingId(id);

    try {
      await deleteMyVehicle(id);

      setVehicles((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      console.error("Failed to delete vehicle:", err);
      alert("Gagal menghapus kendaraan.");
    } finally {
      setDeletingId(null);
    }
  };

  // =========================
  // LOGOUT
  // =========================
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // =========================
  // STATS
  // =========================
  const userInitial = user?.name?.charAt(0).toUpperCase() ?? "C";

  const completedOrdersCount = orders.filter(
    (o) => o.service_status === "COMPLETED",
  ).length;

  const activeOrdersCount = orders.filter(
    (o) =>
      o.service_status === "WAITING" ||
      o.service_status === "CONFIRMED" ||
      o.service_status === "IN_PROGRESS",
  ).length;

  return (
    <div className="space-y-8 pb-12">
      {/* =========================
          HEADER
      ========================= */}
      <div>
        <Badge
          variant="outline"
          className="mb-1 border-orange-200 bg-orange-50 text-[#FF5412]"
        >
          Akun Saya
        </Badge>

        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Profil Customer
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Kelola informasi akun dan daftar kendaraan milikmu.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* =========================
            LEFT COLUMN
        ========================= */}
        <div className="space-y-6">
          {/* =========================
              USER CARD
          ========================= */}
          <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm">
            <div className="h-24 bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950" />

            <CardContent className="relative px-6 pb-6 pt-0">
              {/* Avatar */}
              <div className="-mt-12 flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-orange-100 text-2xl font-extrabold text-[#FF5412] shadow-md">
                {userInitial}
              </div>

              {/* Name */}
              <div className="mt-4 space-y-1">
                <h3 className="text-lg font-extrabold text-slate-900">
                  {user?.name || "Customer"}
                </h3>

                <Badge
                  variant="outline"
                  className="border-orange-200 bg-orange-50 text-xs font-bold text-[#FF5412]"
                >
                  Customer Member
                </Badge>
              </div>

              <Separator className="my-5" />

              {/* Email & Phone */}
              <div className="space-y-3 text-xs">
                {/* Email */}
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400">Email</p>

                    <p className="truncate font-semibold text-slate-800">
                      {user?.email || "-"}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3 text-slate-600">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <Phone className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-[10px] text-slate-400">Nomor Telepon</p>

                    <p className="font-semibold text-slate-800">
                      {user?.customer?.phone || "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Edit Profile */}
              <Button
                type="button"
                variant="outline"
                onClick={handleOpenEditProfile}
                className="mt-6 w-full rounded-xl border-orange-200 text-xs font-bold text-[#FF5412] hover:bg-orange-50 hover:text-orange-700"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Profil
              </Button>

              {/* Logout */}
              <Button
                type="button"
                variant="outline"
                onClick={handleLogout}
                className="mt-3 w-full rounded-xl border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </CardContent>
          </Card>

          {/* =========================
              QUICK STATS
          ========================= */}
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-sm font-bold text-slate-900">
                Aktivitas Cuci Mobil
              </CardTitle>
            </CardHeader>

            <CardContent className="grid grid-cols-3 gap-2 p-5 pt-0 text-center">
              {/* Vehicles */}
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-lg font-extrabold text-[#FF5412]">
                  {vehicles.length}
                </p>

                <p className="text-[10px] font-semibold text-slate-500">
                  Kendaraan
                </p>
              </div>

              {/* Active Orders */}
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-lg font-extrabold text-blue-600">
                  {activeOrdersCount}
                </p>

                <p className="text-[10px] font-semibold text-slate-500">
                  Aktif
                </p>
              </div>

              {/* Completed Orders */}
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-lg font-extrabold text-emerald-600">
                  {completedOrdersCount}
                </p>

                <p className="text-[10px] font-semibold text-slate-500">
                  Selesai
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* =========================
            RIGHT COLUMN
        ========================= */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-white p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-[#FF5412]">
                    <Car className="h-5 w-5" />
                  </div>

                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      Kendaraan Saya ({vehicles.length})
                    </CardTitle>

                    <CardDescription className="text-xs">
                      Daftar mobil yang didaftarkan untuk pemesanan cepat
                    </CardDescription>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={() => {
                    setVehicleError(null);
                    setIsAddVehicleOpen(true);
                  }}
                  className="rounded-xl bg-[#FF5412] text-xs font-bold text-white shadow-xs hover:bg-orange-600"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Tambah Kendaraan
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-5 sm:p-6">
              {loading ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Skeleton className="h-28 w-full rounded-2xl" />
                  <Skeleton className="h-28 w-full rounded-2xl" />
                </div>
              ) : vehicles.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
                  <Car className="mx-auto h-10 w-10 text-slate-300" />

                  <h4 className="mt-3 text-sm font-bold text-slate-800">
                    Belum Ada Kendaraan Terdaftar
                  </h4>

                  <p className="mt-1 text-xs text-slate-500">
                    Tambahkan mobil kamu sekarang agar memudahkan saat melakukan
                    booking cuci.
                  </p>

                  <Button
                    type="button"
                    onClick={() => {
                      setVehicleError(null);
                      setIsAddVehicleOpen(true);
                    }}
                    className="mt-4 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-[#FF5412]"
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Tambah Kendaraan
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {vehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF5412]">
                          <Car className="h-6 w-6" />
                        </div>

                        <div>
                          <span className="inline-block rounded-lg bg-slate-900 px-2 py-0.5 text-xs font-bold tracking-wider text-white">
                            {vehicle.plate_number}
                          </span>

                          <h4 className="mt-1 text-sm font-bold text-slate-900">
                            {vehicle.brand} {vehicle.model}
                          </h4>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={deletingId === vehicle.id}
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                        className="h-8 w-8 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600"
                        title="Hapus Kendaraan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* =========================
          EDIT PROFILE MODAL
      ========================= */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSaveProfile}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Edit Profil
              </DialogTitle>

              <DialogDescription className="text-xs">
                Perbarui informasi akun kamu di bawah ini.
              </DialogDescription>
            </DialogHeader>

            {profileError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {profileError}
              </div>
            )}

            <div className="space-y-4 py-4">
              {/* Name */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="editProfileName"
                  className="text-xs font-semibold"
                >
                  Nama Lengkap
                </Label>

                <Input
                  id="editProfileName"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={savingProfile}
                  required
                  className="rounded-xl border-slate-200 text-sm"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="editProfileEmail"
                  className="text-xs font-semibold"
                >
                  Email
                </Label>

                <Input
                  id="editProfileEmail"
                  type="email"
                  placeholder="contoh@email.com"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  disabled={savingProfile}
                  required
                  className="rounded-xl border-slate-200 text-sm"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="editProfilePhone"
                  className="text-xs font-semibold"
                >
                  Nomor Telepon
                </Label>

                <Input
                  id="editProfilePhone"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  disabled={savingProfile}
                  required
                  className="rounded-xl border-slate-200 text-sm"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                disabled={savingProfile}
                onClick={() => setIsEditProfileOpen(false)}
                className="rounded-xl text-xs"
              >
                Batal
              </Button>

              <Button
                type="submit"
                disabled={savingProfile}
                className="rounded-xl bg-[#FF5412] text-xs font-bold text-white hover:bg-orange-600"
              >
                {savingProfile ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* =========================
          ADD VEHICLE MODAL
      ========================= */}
      <Dialog open={isAddVehicleOpen} onOpenChange={setIsAddVehicleOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSaveVehicle}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Tambah Kendaraan Baru
              </DialogTitle>

              <DialogDescription className="text-xs">
                Masukkan identitas mobil yang ingin didaftarkan ke akunmu.
              </DialogDescription>
            </DialogHeader>

            {vehicleError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {vehicleError}
              </div>
            )}

            <div className="space-y-4 py-4">
              {/* Plate Number */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="profilePlateNumber"
                  className="text-xs font-semibold"
                >
                  Nomor Plat Kendaraan *
                </Label>

                <Input
                  id="profilePlateNumber"
                  placeholder="e.g. B 1234 ABC"
                  value={newPlateNumber}
                  onChange={(e) =>
                    setNewPlateNumber(e.target.value.toUpperCase())
                  }
                  disabled={savingVehicle}
                  required
                  className="rounded-xl border-slate-200 uppercase text-sm"
                />
              </div>

              {/* Brand */}
              <div className="space-y-1.5">
                <Label htmlFor="profileBrand" className="text-xs font-semibold">
                  Merek / Brand *
                </Label>

                <Input
                  id="profileBrand"
                  placeholder="e.g. Toyota, Honda, Mitsubishi"
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  disabled={savingVehicle}
                  required
                  className="rounded-xl border-slate-200 text-sm"
                />
              </div>

              {/* Model */}
              <div className="space-y-1.5">
                <Label htmlFor="profileModel" className="text-xs font-semibold">
                  Model / Tipe Mobil *
                </Label>

                <Input
                  id="profileModel"
                  placeholder="e.g. Avanza, Civic, Pajero"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  disabled={savingVehicle}
                  required
                  className="rounded-xl border-slate-200 text-sm"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                disabled={savingVehicle}
                onClick={() => setIsAddVehicleOpen(false)}
                className="rounded-xl text-xs"
              >
                Batal
              </Button>

              <Button
                type="submit"
                disabled={savingVehicle}
                className="rounded-xl bg-[#FF5412] text-xs font-bold text-white hover:bg-orange-600"
              >
                {savingVehicle ? "Menyimpan..." : "Simpan Kendaraan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
