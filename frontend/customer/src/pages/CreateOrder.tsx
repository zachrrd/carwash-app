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
import { createOrder, getActiveOrder } from "@/services/order.service";

import type { ActiveOrder } from "@/services/order.service";
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
}

const formatRupiah = (value: number | string) => {
  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return "Rp 0";
  }

  return `Rp ${amount.toLocaleString("id-ID")}`;
};

const getErrorMessage = (err: unknown, fallback: string) => {
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

    return response?.data?.message || fallback;
  }

  if (err instanceof Error) {
    return err.message || fallback;
  }

  return fallback;
};

const getActiveStatusLabel = (status: ActiveOrder["service_status"]) => {
  switch (status) {
    case "WAITING":
      return "Menunggu Konfirmasi";
    case "CONFIRMED":
      return "Dikonfirmasi";
    case "IN_PROGRESS":
      return "Sedang Dicuci";
    default:
      return status || "-";
  }
};

const getActiveStatusClass = (status: ActiveOrder["service_status"]) => {
  switch (status) {
    case "WAITING":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "CONFIRMED":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "IN_PROGRESS":
      return "border-orange-200 bg-orange-50 text-[#FF5412]";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
};

export default function CreateOrder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedServiceId = searchParams.get("service_id");

  const { user } = useAuth();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);

  const [loadingData, setLoadingData] = useState(true);

  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(
    null,
  );

  const [selectedItems, setSelectedItems] = useState<SelectedServiceItem[]>([]);

  const [checkInTime, setCheckInTime] = useState<string>("");

  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [newPlateNumber, setNewPlateNumber] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newModel, setNewModel] = useState("");
  const [savingVehicle, setSavingVehicle] = useState(false);
  const [vehicleError, setVehicleError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setLoadingData(true);
      setFormError(null);

      try {
        const currentActiveOrder = await getActiveOrder();

        if (cancelled) {
          return;
        }

        if (currentActiveOrder) {
          setActiveOrder(currentActiveOrder);
          setLoadingData(false);
          return;
        }

        const [fetchedVehicles, servicesRes] = await Promise.all([
          getMyVehicles(),
          getServices({
            status: "ACTIVE",
            limit: 100,
          }),
        ]);

        if (cancelled) {
          return;
        }

        setVehicles(fetchedVehicles);

        if (fetchedVehicles.length > 0) {
          setSelectedVehicleId(fetchedVehicles[0].id);
        }

        const activeServices = servicesRes.services || [];

        setServices(activeServices);

        if (preselectedServiceId) {
          const targetService = activeServices.find(
            (service) => service.id === Number(preselectedServiceId),
          );

          if (targetService) {
            setSelectedItems([
              {
                service: targetService,
              },
            ]);
          }
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setFormError(getErrorMessage(err, "Gagal memuat data pemesanan."));
        }
      } finally {
        if (!cancelled) {
          setLoadingData(false);
        }
      }
    };

    void fetchData();

    return () => {
      cancelled = true;
    };
  }, [preselectedServiceId]);

  const selectedVehicle = vehicles.find(
    (vehicle) => vehicle.id === selectedVehicleId,
  );

  const handleToggleService = (service: Service) => {
    setSelectedItems((prev) => {
      const existing = prev.some((item) => item.service.id === service.id);

      if (existing) {
        return prev.filter((item) => item.service.id !== service.id);
      }

      return [
        ...prev,
        {
          service,
        },
      ];
    });

    setFormError(null);
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();

    setVehicleError(null);

    if (!newPlateNumber.trim() || !newBrand.trim() || !newModel.trim()) {
      setVehicleError("Semua data kendaraan wajib diisi.");
      return;
    }

    setSavingVehicle(true);

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
      setVehicleError(null);
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Gagal menambahkan kendaraan.");

      setVehicleError(message);
    } finally {
      setSavingVehicle(false);
    }
  };

  const totalAmount = selectedItems.reduce(
    (sum, item) => sum + Number(item.service.price),
    0,
  );

  const totalDuration = selectedItems.reduce(
    (sum, item) => sum + item.service.duration,
    0,
  );

  const handleSubmitOrder = async () => {
    setFormError(null);

    if (activeOrder) {
      setFormError(`Anda masih memiliki pesanan aktif #${activeOrder.id}.`);
      return;
    }

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
          qty: 1,
        })),
        ...(checkInTime
          ? {
              check_in_time: checkInTime,
            }
          : {}),
      };

      const createdOrder = await createOrder(payload);

      navigate(`/orders/${createdOrder.id}`);
    } catch (err: unknown) {
      const message = getErrorMessage(
        err,
        "Gagal membuat pesanan. Silakan coba lagi.",
      );

      setFormError(message);
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

  if (activeOrder) {
    return (
      <div className="space-y-8 pb-12">
        <div>
          <Badge
            variant="outline"
            className="mb-2 border-orange-200 bg-orange-50 text-[#FF5412]"
          >
            Pesanan Aktif
          </Badge>

          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Kamu Masih Memiliki Pesanan Aktif
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Selesaikan pesanan sebelumnya sebelum membuat pesanan baru.
          </p>
        </div>

        <Card className="mx-auto max-w-2xl overflow-hidden rounded-2xl border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/60 p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Booking ID
                </span>

                <h2 className="text-2xl font-extrabold text-slate-900">
                  #{activeOrder.id}
                </h2>
              </div>

              <Badge
                variant="outline"
                className={`w-fit font-bold ${getActiveStatusClass(
                  activeOrder.service_status,
                )}`}
              >
                {getActiveStatusLabel(activeOrder.service_status)}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-5 sm:p-6">
            {activeOrder.vehicles && (
              <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#FF5412] shadow-sm">
                  <Car className="h-6 w-6" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Kendaraan
                  </p>

                  <p className="mt-1 text-base font-bold text-slate-900">
                    {activeOrder.vehicles.brand} {activeOrder.vehicles.model}
                  </p>

                  <p className="text-sm font-semibold text-slate-500">
                    {activeOrder.vehicles.plate_number}
                  </p>
                </div>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="h-4 w-4" />

                  <span className="text-xs font-semibold">Check-In</span>
                </div>

                <p className="mt-2 text-sm font-bold text-slate-900">
                  {activeOrder.check_in_time || "Tidak ditentukan"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <ShieldCheck className="h-4 w-4" />

                  <span className="text-xs font-semibold">Pembayaran</span>
                </div>

                <p className="mt-2 text-sm font-bold text-slate-900">
                  {activeOrder.payment_status === "PAID"
                    ? "Sudah Dibayar"
                    : "Belum Dibayar"}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-[#FF5412]">
                  <AlertCircle className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Belum bisa membuat pesanan baru
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    Kamu hanya dapat memiliki satu pesanan aktif dalam satu
                    waktu. Setelah pesanan #{activeOrder.id} selesai atau
                    dibatalkan, kamu dapat membuat pesanan baru.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                onClick={() => navigate(`/orders/${activeOrder.id}`)}
                className="h-11 flex-1 rounded-xl bg-slate-900 text-sm font-bold text-white hover:bg-[#FF5412]"
              >
                Lihat Detail Pesanan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/orders")}
                className="h-11 flex-1 rounded-xl border-slate-200 text-sm font-bold"
              >
                Lihat Semua Pesanan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
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
        <div className="space-y-6 lg:col-span-2">
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
                  onClick={() => {
                    setVehicleError(null);
                    setIsAddVehicleOpen(true);
                  }}
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
                    onClick={() => {
                      setVehicleError(null);
                      setIsAddVehicleOpen(true);
                    }}
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
                        onClick={() => {
                          setSelectedVehicleId(v.id);
                          setFormError(null);
                        }}
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
                    Pilih satu atau lebih layanan yang dibutuhkan
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
                    const isSelected = selectedItems.some(
                      (item) => item.service.id === s.id,
                    );

                    return (
                      <div
                        key={s.id}
                        onClick={() => handleToggleService(s)}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                          isSelected
                            ? "border-[#FF5412] bg-orange-50/40 shadow-sm ring-2 ring-[#FF5412]/20"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
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

                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-sm font-extrabold text-[#FF5412]">
                            {formatRupiah(s.price)}
                          </p>

                          {isSelected && (
                            <Badge
                              variant="outline"
                              className="border-orange-200 bg-orange-50 text-[10px] font-bold text-[#FF5412]"
                            >
                              Dipilih · 1x
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500">
                <p className="font-semibold text-slate-700">
                  Informasi layanan
                </p>

                <p className="mt-0.5 leading-relaxed">
                  Setiap layanan hanya dapat dipilih satu kali dalam satu
                  pesanan. Jika layanan sudah dipilih, klik kembali untuk
                  membatalkannya.
                </p>
              </div>
            </CardContent>
          </Card>

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
                  Jam operasional carwash: 08:00 - 18:00 WIB
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

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
                <div className="rounded-xl bg-slate-50 p-3 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Pemesan:</span>

                    <span className="font-bold text-slate-900">
                      {user?.name || "Customer"}
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

                {selectedVehicle ? (
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF5412]">
                      <Car className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-slate-900">
                        {selectedVehicle.brand} {selectedVehicle.model}
                      </p>

                      <p className="text-[11px] font-semibold text-slate-500">
                        {selectedVehicle.plate_number}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs italic text-slate-400">
                    Belum memilih kendaraan
                  </p>
                )}

                <Separator />

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
                            1x @ {formatRupiah(item.service.price)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {formatRupiah(item.service.price)}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleToggleService(item.service)}
                            className="text-slate-400 hover:text-red-500"
                            title="Hapus layanan"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <Separator />

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

      <Dialog
        open={isAddVehicleOpen}
        onOpenChange={(open) => {
          setIsAddVehicleOpen(open);

          if (!open) {
            setVehicleError(null);
            setNewPlateNumber("");
            setNewBrand("");
            setNewModel("");
          }
        }}
      >
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
