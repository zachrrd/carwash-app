import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Car,
  CheckCircle2,
  Clock,
  Droplets,
  Plus,
  ShieldCheck,
  Trash2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { getMyVehicles, createMyVehicle } from "@/services/vehicle.service";
import { getServices } from "@/services/service.service";
import { createOrder } from "@/services/order.service";

import type { Vehicle } from "@/types/vehicle";
import type { Service } from "@/types/service";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

interface SelectedServiceItem {
  service: Service;
  qty: number;
}

const formatRupiah = (value: number | string) => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return "Rp 0";
  return `Rp ${amount.toLocaleString("id-ID")}`;
};

export default function CreateOrder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedServiceId = searchParams.get("service_id");

  const { user } = useAuth();

  // Data states
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form states
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
    null,
  );
  const [selectedItems, setSelectedItems] = useState<SelectedServiceItem[]>([]);
  const [checkInTime, setCheckInTime] = useState<string>("");

  // Add vehicle modal states
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [newPlateNumber, setNewPlateNumber] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newModel, setNewModel] = useState("");
  const [savingVehicle, setSavingVehicle] = useState(false);
  const [vehicleError, setVehicleError] = useState<string | null>(null);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Load initial vehicles and services
  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [fetchedVehicles, servicesRes] = await Promise.all([
          getMyVehicles(),
          getServices({ status: "ACTIVE", limit: 100 }),
        ]);

        setVehicles(fetchedVehicles);
        if (fetchedVehicles.length > 0) {
          setSelectedVehicleId(fetchedVehicles[0].id);
        }

        const activeServices = servicesRes.services || [];
        setServices(activeServices);

        // Pre-select service from URL query if provided
        if (preselectedServiceId) {
          const targetService = activeServices.find(
            (s) => s.id === Number(preselectedServiceId),
          );
          if (targetService) {
            setSelectedItems([{ service: targetService, qty: 1 }]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch order prerequisites:", err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [preselectedServiceId]);

  // Handle service selection toggle / qty update
  const handleToggleService = (service: Service) => {
    setSelectedItems((prev) => {
      const existing = prev.find((item) => item.service.id === service.id);
      if (existing) {
        return prev.filter((item) => item.service.id !== service.id);
      } else {
        return [...prev, { service, qty: 1 }];
      }
    });
  };

  const handleUpdateQty = (serviceId: number, delta: number) => {
    setSelectedItems((prev) =>
      prev
        .map((item) => {
          if (item.service.id === serviceId) {
            const nextQty = item.qty + delta;
            return nextQty > 0 ? { ...item, qty: nextQty } : null;
          }
          return item;
        })
        .filter((item): item is SelectedServiceItem => item !== null),
    );
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlateNumber.trim() || !newBrand.trim() || !newModel.trim()) {
      setVehicleError("Semua data kendaraan wajib diisi.");
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
      setSelectedVehicleId(created.id);
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

        console.error(message);
      }
    } finally {
      setSavingVehicle(false);
    }
  };

  // Calculations
  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + Number(item.service.price) * item.qty,
    0,
  );

  const totalDuration = selectedItems.reduce(
    (sum, item) => sum + item.service.duration * item.qty,
    0,
  );

  // Submit order handler
  const handleSubmitOrder = async () => {
    setFormError(null);

    if (!selectedVehicleId) {
      setFormError("Silakan pilih kendaraan terlebih dahulu.");
      return;
    }

    if (selectedItems.length === 0) {
      setFormError("Silakan pilih minimal satu layanan cuci.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        vehicle_id: selectedVehicleId,
        items: selectedItems.map((item) => ({
          service_id: item.service.id,
          qty: item.qty,
        })),
        ...(checkInTime ? { check_in_time: checkInTime } : {}),
      };

      const createdOrder = await createOrder(payload);

      // Redirect to Order Detail of newly created order
      navigate(`/orders/${createdOrder.id}`);
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

        console.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-72 w-full rounded-2xl" />
          </div>
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <Badge
          variant="outline"
          className="mb-2 border-orange-200 bg-orange-50 text-[#FF5412]"
        >
          Booking Online
        </Badge>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Buat Pesanan Cuci Mobil
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Pilih kendaraan dan layanan yang kamu inginkan, lalu konfirmasi
          pesanan dengan cepat.
        </p>
      </div>

      {formError && (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
          <p className="font-medium">{formError}</p>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* ========================================================
            LEFT COLUMN (Steps 1, 2, 3)
        ======================================================== */}
        <div className="space-y-6 lg:col-span-2">
          {/* STEP 1: Pilih Kendaraan */}
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="p-5 pb-3 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-[#FF5412]">
                    <Car className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold text-slate-900">
                      1. Pilih Kendaraan
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Pilih mobil yang akan dicuci
                    </CardDescription>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddVehicleOpen(true)}
                  className="rounded-xl border-slate-200 text-xs font-semibold hover:border-orange-200 hover:bg-orange-50 hover:text-[#FF5412]"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Tambah Kendaraan
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
              {vehicles.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                  <Car className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    Belum ada kendaraan tersimpan
                  </p>
                  <p className="text-xs text-slate-500">
                    Tambahkan kendaraan kamu untuk melanjutkan pemesanan.
                  </p>
                  <Button
                    type="button"
                    onClick={() => setIsAddVehicleOpen(true)}
                    className="mt-4 rounded-xl bg-[#FF5412] px-4 text-xs font-bold text-white hover:bg-orange-600"
                  >
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Tambah Kendaraan Pertama
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {vehicles.map((v) => {
                    const isSelected = selectedVehicleId === v.id;
                    return (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVehicleId(v.id)}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                          isSelected
                            ? "border-[#FF5412] bg-orange-50/40 shadow-sm ring-2 ring-[#FF5412]/20"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="inline-block rounded-lg bg-slate-900 px-2 py-0.5 text-xs font-bold tracking-wider text-white">
                              {v.plate_number}
                            </span>
                            <h4 className="mt-2 text-sm font-bold text-slate-900">
                              {v.brand} {v.model}
                            </h4>
                          </div>

                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
                              isSelected
                                ? "border-[#FF5412] bg-[#FF5412] text-white"
                                : "border-slate-300 bg-white"
                            }`}
                          >
                            {isSelected && (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* STEP 2: Pilih Layanan */}
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="p-5 pb-3 sm:p-6 sm:pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-[#FF5412]">
                  <Droplets className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    2. Pilih Layanan Cuci
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Pilih satu atau lebih paket layanan yang dibutuhkan
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
              {services.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  Tidak ada layanan cuci yang tersedia saat ini.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {services.map((s) => {
                    const selected = selectedItems.find(
                      (i) => i.service.id === s.id,
                    );
                    const isSelected = !!selected;

                    return (
                      <div
                        key={s.id}
                        className={`flex flex-col justify-between rounded-2xl border p-4 transition-all duration-200 ${
                          isSelected
                            ? "border-[#FF5412] bg-orange-50/40 shadow-sm ring-2 ring-[#FF5412]/20"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        <div
                          className="cursor-pointer"
                          onClick={() => handleToggleService(s)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">
                                {s.name}
                              </h4>
                              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-slate-400" />
                                  {s.duration} mnt
                                </span>
                              </div>
                            </div>

                            <div
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                                isSelected
                                  ? "border-[#FF5412] bg-[#FF5412] text-white"
                                  : "border-slate-300 bg-white"
                              }`}
                            >
                              {isSelected && (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              )}
                            </div>
                          </div>

                          <p className="mt-3 text-sm font-extrabold text-[#FF5412]">
                            {formatRupiah(s.price)}
                          </p>
                        </div>

                        {/* Quantity Counter if selected */}
                        {isSelected && (
                          <div className="mt-3 flex items-center justify-between border-t border-orange-200/60 pt-3">
                            <span className="text-xs font-semibold text-slate-600">
                              Jumlah
                            </span>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => handleUpdateQty(s.id, -1)}
                                className="h-7 w-7 rounded-lg border-slate-200 text-xs"
                              >
                                -
                              </Button>
                              <span className="min-w-5 text-center text-xs font-bold text-slate-900">
                                {selected.qty}
                              </span>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => handleUpdateQty(s.id, 1)}
                                className="h-7 w-7 rounded-lg border-slate-200 text-xs"
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* STEP 3: Estimasi Waktu Kedatangan (Check-in) */}
          <Card className="rounded-2xl border-slate-200 shadow-sm">
            <CardHeader className="p-5 pb-3 sm:p-6 sm:pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-[#FF5412]">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    3. Estimasi Waktu Kedatangan (Opsional)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Beri tahu staf kami jam berapa kamu berencana datang
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
              <div className="max-w-xs space-y-2">
                <Label
                  htmlFor="checkInTime"
                  className="text-xs font-semibold text-slate-700"
                >
                  Jam Check-In (Format 24 Jam e.g. 14:30)
                </Label>
                <Input
                  id="checkInTime"
                  type="time"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  className="rounded-xl border-slate-200 text-sm focus-visible:ring-[#FF5412]"
                />
                <p className="text-[11px] text-slate-400">
                  Jam operasional bengkel: 08:00 - 18:00 WIB
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ========================================================
            RIGHT COLUMN: Ringkasan Pesanan (Order Summary)
        ======================================================== */}
        <div>
          <div className="sticky top-24 space-y-4">
            <Card className="rounded-2xl border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-5">
                <CardTitle className="text-base font-bold text-slate-900">
                  Ringkasan Pesanan
                </CardTitle>
                <CardDescription className="text-xs">
                  Periksa rincian pemesanan kamu
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 p-5">
                {/* Selected Customer Info */}
                <div className="rounded-xl bg-slate-50 p-3 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Pemesan:</span>
                    <span className="font-bold text-slate-900">
                      {user?.name}
                    </span>
                  </div>
                  {user?.customer?.phone && (
                    <div className="mt-1 flex items-center justify-between text-slate-500">
                      <span>No. Telepon:</span>
                      <span className="font-semibold text-slate-700">
                        {user.customer.phone}
                      </span>
                    </div>
                  )}
                </div>

                {/* Selected Vehicle Info */}
                {selectedVehicleId ? (
                  (() => {
                    const sel = vehicles.find(
                      (v) => v.id === selectedVehicleId,
                    );
                    return sel ? (
                      <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF5412]">
                          <Car className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-slate-900">
                            {sel.brand} {sel.model}
                          </p>
                          <p className="text-[11px] font-semibold text-slate-500">
                            {sel.plate_number}
                          </p>
                        </div>
                      </div>
                    ) : null;
                  })()
                ) : (
                  <p className="text-xs italic text-slate-400">
                    Belum memilih kendaraan
                  </p>
                )}

                <Separator />

                {/* Selected Services List */}
                <div className="space-y-2.5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Layanan Dipilih ({selectedItems.length})
                  </p>

                  {selectedItems.length === 0 ? (
                    <div className="py-4 text-center text-xs text-slate-400">
                      Belum ada layanan yang dipilih
                    </div>
                  ) : (
                    selectedItems.map((item) => (
                      <div
                        key={item.service.id}
                        className="flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-slate-800">
                            {item.service.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {item.qty}x @ {formatRupiah(item.service.price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {formatRupiah(
                              Number(item.service.price) * item.qty,
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleService(item.service)}
                            className="text-slate-400 hover:text-red-500"
                            title="Hapus"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      Estimasi Durasi Total:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {totalDuration} Menit
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Status Awal:</span>
                    <Badge
                      variant="outline"
                      className="border-orange-200 bg-orange-50 text-[10px] font-bold text-[#FF5412]"
                    >
                      Menunggu Konfirmasi
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-bold text-slate-900">
                      Total Pembayaran:
                    </span>
                    <span className="text-lg font-extrabold text-[#FF5412]">
                      {formatRupiah(totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Submit button */}
                <Button
                  type="button"
                  onClick={handleSubmitOrder}
                  disabled={
                    submitting ||
                    selectedItems.length === 0 ||
                    !selectedVehicleId
                  }
                  className="h-11 w-full rounded-xl bg-slate-900 text-sm font-bold text-white shadow-lg transition hover:bg-[#FF5412] disabled:opacity-50"
                >
                  {submitting ? (
                    "Memproses Pesanan..."
                  ) : (
                    <>
                      Konfirmasi Booking
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-500">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>
                    Pembayaran dapat dilakukan setelah pesanan dikonfirmasi oleh
                    kasir.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal / Dialog Tambah Kendaraan Baru */}
      <Dialog open={isAddVehicleOpen} onOpenChange={setIsAddVehicleOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSaveVehicle}>
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-slate-900">
                Tambah Kendaraan Baru
              </DialogTitle>
              <DialogDescription className="text-xs">
                Masukkan identitas mobil yang ingin kamu daftarkan ke akun.
              </DialogDescription>
            </DialogHeader>

            {vehicleError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {vehicleError}
              </div>
            )}

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="plateNumber" className="text-xs font-semibold">
                  Nomor Plat (e.g. B 1234 ABC) *
                </Label>
                <Input
                  id="plateNumber"
                  placeholder="B 1234 ABC"
                  value={newPlateNumber}
                  onChange={(e) =>
                    setNewPlateNumber(e.target.value.toUpperCase())
                  }
                  required
                  className="rounded-xl border-slate-200 uppercase text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="brand" className="text-xs font-semibold">
                  Merek / Brand (e.g. Toyota, Honda) *
                </Label>
                <Input
                  id="brand"
                  placeholder="Toyota"
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  required
                  className="rounded-xl border-slate-200 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="model" className="text-xs font-semibold">
                  Model / Seri (e.g. Avanza, Civic) *
                </Label>
                <Input
                  id="model"
                  placeholder="Avanza"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  required
                  className="rounded-xl border-slate-200 text-sm"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
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
