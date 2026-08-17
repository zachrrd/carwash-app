import { useEffect, useState, type FormEvent } from "react";

import {
  getVehicles,
  createVehicle,
  deleteVehicle,
  updateVehicle,
} from "@/services/vehicle.service";

import { getCustomers } from "@/services/customer.service";

import type { Customer } from "@/types/customer";
import type { Vehicle } from "@/types/vehicle";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

import { Card, CardContent } from "@/components/ui/card";

import {
  Plus,
  Pencil,
  Trash2,
  Car,
  User,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =========================
  // PAGINATION
  // =========================

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVehicles, setTotalVehicles] = useState(0);

  // =========================
  // ADD FORM
  // =========================

  const [customerId, setCustomerId] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // =========================
  // DELETE
  // =========================

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // =========================
  // EDIT
  // =========================

  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);

  const [editOpen, setEditOpen] = useState(false);

  // =========================
  // FETCH VEHICLES
  // =========================

  const fetchVehicles = async (page: number) => {
    try {
      setError(null);

      const response = await getVehicles(page, 10);

      setVehicles(response.data.data.vehicles);
      setTotalPages(response.data.data.pagination.totalPages);
      setTotalVehicles(response.data.data.pagination.total);
    } catch (error) {
      console.error(error);
      setError("Vehicle data failed to fetch.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FETCH CUSTOMERS
  // =========================

  const fetchCustomers = async () => {
    try {
      const response = await getCustomers();

      setCustomers(response.data.data);
    } catch (error) {
      console.error(error);
      setError("Customer data failed to fetch.");
    }
  };

  // =========================
  // INITIAL FETCH
  // =========================

useEffect(() => {
  let cancelled = false;

  const loadVehicles = async () => {
    try {
      const response = await getVehicles(currentPage, 10);

      if (cancelled) return;

      setVehicles(response.data.data.vehicles);
      setTotalPages(response.data.data.pagination.totalPages);
      setTotalVehicles(response.data.data.pagination.total);
      setError(null);
    } catch (error) {
      if (cancelled) return;

      console.error(error);
      setError("Vehicle data failed to fetch.");
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  loadVehicles();

  return () => {
    cancelled = true;
  };
}, [currentPage]);

useEffect(() => {
  let cancelled = false;

const loadCustomers = async () => {
  try {
    const response = await getCustomers(1, 1000);

    if (cancelled) return;

    setCustomers(response.data.data.customers);
  } catch (error) {
    if (cancelled) return;

    console.error(error);
    setError("Customer data failed to fetch.");
  }
};

  loadCustomers();

  return () => {
    cancelled = true;
  };
}, []);
  // =========================
  // ADD VEHICLE
  // =========================

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSubmitting(true);

    try {
      await createVehicle({
        customer_id: Number(customerId),
        plate_number: plateNumber,
        brand,
        model,
      });

      await fetchVehicles(currentPage);

      setCustomerId("");
      setPlateNumber("");
      setBrand("");
      setModel("");

      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // DELETE VEHICLE
  // =========================

  const handleDelete = async (id: number) => {
    try {
      await deleteVehicle(id);

      setDeleteOpen(false);
      setDeleteId(null);

      // Jika halaman terakhir menjadi kosong setelah delete,
      // pindah ke halaman sebelumnya.
      if (vehicles.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        await fetchVehicles(currentPage);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // =========================
  // EDIT VEHICLE
  // =========================

  const handleEdit = (vehicle: Vehicle) => {
    setEditVehicle(vehicle);
    setEditOpen(true);
  };

  // =========================
  // UPDATE VEHICLE
  // =========================

  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editVehicle) return;

    setSubmitting(true);

    try {
      await updateVehicle(editVehicle.id, {
        customer_id: editVehicle.customer_id,
        plate_number: editVehicle.plate_number,
        brand: editVehicle.brand,
        model: editVehicle.model,
      });

      await fetchVehicles(currentPage);

      setEditOpen(false);
      setEditVehicle(null);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // PAGINATION
  // =========================

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-3 h-6 w-6 animate-spin text-muted-foreground" />

          <p className="text-sm text-muted-foreground">
            Loading vehicles...
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center gap-4">
        <p className="text-sm text-destructive">{error}</p>

        <Button
          variant="outline"
          onClick={() => {
            fetchVehicles(currentPage);
            fetchCustomers();
          }}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vehicles</h1>

          <p className="text-sm text-muted-foreground">
            Manage registered vehicles and their owners.
          </p>
        </div>

        {/* ADD BUTTON */}

        <Dialog open={open} onOpenChange={setOpen}>
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Vehicle</DialogTitle>

              <DialogDescription>
                Register a vehicle and assign it to a customer.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* CUSTOMER */}

              <div className="space-y-2">
                <label htmlFor="customer" className="text-sm font-medium">
                  Customer
                </label>

                <select
                  id="customer"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select Customer</option>

                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                      {customer.phone ? ` — ${customer.phone}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* PLATE */}

              <div className="space-y-2">
                <label
                  htmlFor="plateNumber"
                  className="text-sm font-medium"
                >
                  Plate Number
                </label>

                <Input
                  id="plateNumber"
                  placeholder="Example: B 1234 ABC"
                  value={plateNumber}
                  onChange={(e) =>
                    setPlateNumber(e.target.value.toUpperCase())
                  }
                  required
                />
              </div>

              {/* BRAND */}

              <div className="space-y-2">
                <label htmlFor="brand" className="text-sm font-medium">
                  Brand
                </label>

                <Input
                  id="brand"
                  placeholder="Example: Toyota"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  required
                />
              </div>

              {/* MODEL */}

              <div className="space-y-2">
                <label htmlFor="model" className="text-sm font-medium">
                  Model
                </label>

                <Input
                  id="model"
                  placeholder="Example: Avanza"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save Vehicle"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ================= SUMMARY ================= */}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Vehicles
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {totalVehicles}
                </p>
              </div>

              <div className="rounded-lg bg-primary/10 p-3">
                <Car className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================= TABLE ================= */}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>

                  <TableHead>Vehicle</TableHead>

                  <TableHead>Owner</TableHead>

                  <TableHead>Brand</TableHead>

                  <TableHead>Model</TableHead>

                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {vehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Car className="h-8 w-8 text-muted-foreground" />

                        <p className="text-sm text-muted-foreground">
                          No vehicles found.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  vehicles.map((vehicle) => {
                    const owner = customers.find(
                      (customer) =>
                        customer.id === vehicle.customer_id,
                    );

                    return (
                      <TableRow key={vehicle.id}>
                        {/* ID */}

                        <TableCell className="font-medium">
                          #{vehicle.id}
                        </TableCell>

                        {/* VEHICLE */}

                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                              <Car className="h-4 w-4 text-primary" />
                            </div>

                            <div>
                              <p className="font-semibold">
                                {vehicle.plate_number}
                              </p>

                              <p className="text-xs text-muted-foreground">
                                {vehicle.brand} {vehicle.model}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* OWNER */}

                        <TableCell>
                          {owner ? (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />

                              <div>
                                <p className="font-medium">
                                  {owner.name}
                                </p>

                                {owner.phone && (
                                  <p className="text-xs text-muted-foreground">
                                    {owner.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Unknown owner
                            </span>
                          )}
                        </TableCell>

                        {/* BRAND */}

                        <TableCell>{vehicle.brand}</TableCell>

                        {/* MODEL */}

                        <TableCell>{vehicle.model}</TableCell>

                        {/* ACTION */}

                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(vehicle)}
                            >
                              <Pencil className="mr-1 h-4 w-4" />
                              Edit
                            </Button>

                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setDeleteId(vehicle.id);
                                setDeleteOpen(true);
                              }}
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ================= PAGINATION ================= */}

      {totalPages > 1 && (
        <>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevious}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>

            {Array.from({ length: totalPages }, (_, index) => {
              const page = index + 1;

              return (
                <Button
                  key={page}
                  variant={
                    currentPage === page ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
        </>
      )}

      {/* ================= DELETE DIALOG ================= */}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Vehicle</DialogTitle>

            <DialogDescription>
              Are you sure you want to delete this vehicle? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={() => {
                if (deleteId !== null) {
                  handleDelete(deleteId);
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ================= EDIT DIALOG ================= */}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>

            <DialogDescription>
              Update vehicle information and owner.
            </DialogDescription>
          </DialogHeader>

          {editVehicle && (
            <form onSubmit={handleUpdate} className="space-y-4">
              {/* CUSTOMER */}

              <div className="space-y-2">
                <label
                  htmlFor="edit-customer"
                  className="text-sm font-medium"
                >
                  Customer
                </label>

                <select
                  id="edit-customer"
                  value={editVehicle.customer_id}
                  onChange={(e) =>
                    setEditVehicle({
                      ...editVehicle,
                      customer_id: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select Customer</option>

                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                      {customer.phone ? ` — ${customer.phone}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* PLATE */}

              <div className="space-y-2">
                <label
                  htmlFor="edit-plate"
                  className="text-sm font-medium"
                >
                  Plate Number
                </label>

                <Input
                  id="edit-plate"
                  value={editVehicle.plate_number}
                  onChange={(e) =>
                    setEditVehicle({
                      ...editVehicle,
                      plate_number:
                        e.target.value.toUpperCase(),
                    })
                  }
                  required
                />
              </div>

              {/* BRAND */}

              <div className="space-y-2">
                <label
                  htmlFor="edit-brand"
                  className="text-sm font-medium"
                >
                  Brand
                </label>

                <Input
                  id="edit-brand"
                  value={editVehicle.brand}
                  onChange={(e) =>
                    setEditVehicle({
                      ...editVehicle,
                      brand: e.target.value,
                    })
                  }
                  required
                />
              </div>

              {/* MODEL */}

              <div className="space-y-2">
                <label
                  htmlFor="edit-model"
                  className="text-sm font-medium"
                >
                  Model
                </label>

                <Input
                  id="edit-model"
                  value={editVehicle.model}
                  onChange={(e) =>
                    setEditVehicle({
                      ...editVehicle,
                      model: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? "Updating..." : "Update Vehicle"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}