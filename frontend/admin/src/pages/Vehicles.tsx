import { useEffect, useState, type FormEvent } from "react";

import {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getDeletedVehicles,
  restoreVehicle,
} from "@/services/vehicle.service";

import { getCustomers } from "@/services/customer.service";

import type { Customer } from "@/types/customer";
import type { Vehicle, VehiclePayload } from "@/types/vehicle";

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
  RotateCcw,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";

const ITEMS_PER_PAGE = 10;

const emptyForm: VehiclePayload = {
  customer_id: 0,
  plate_number: "",
  brand: "",
  model: "",
};

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [deletedVehicles, setDeletedVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [loading, setLoading] = useState(true);
  const [trashLoading, setTrashLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [fetchError, setFetchError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVehicles, setTotalVehicles] = useState(0);

  const [form, setForm] = useState<VehiclePayload>(emptyForm);
  const [addOpen, setAddOpen] = useState(false);

  const [editVehicle, setEditVehicle] = useState<Vehicle | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [restoreId, setRestoreId] = useState<number | null>(null);
  const [restoreOpen, setRestoreOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadVehicles = async () => {
      setLoading(true);
      setFetchError(null);

      try {
        const response = await getVehicles(currentPage, ITEMS_PER_PAGE);

        if (cancelled) return;

        const data = response.data.data;

        setVehicles(data.vehicles);
        setTotalPages(data.pagination.totalPages);
        setTotalVehicles(data.pagination.total);
      } catch (err) {
        if (cancelled) return;

        console.error("Failed to fetch vehicles:", err);
        setFetchError("Vehicle data failed to fetch.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadVehicles();

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
      } catch (err) {
        if (cancelled) return;

        console.error("Failed to fetch customers:", err);
        setActionError("Customer data failed to fetch.");
      }
    };

    void loadCustomers();

    return () => {
      cancelled = true;
    };
  }, []);

  const fetchDeletedVehicles = async () => {
    try {
      setTrashLoading(true);

      const response = await getDeletedVehicles();

      setDeletedVehicles(response.data.data);
    } catch (err) {
      console.error("Failed to fetch deleted vehicles:", err);
      setActionError("Failed to fetch deleted vehicles.");
    } finally {
      setTrashLoading(false);
    }
  };

  const refreshVehicles = async () => {
    try {
      const response = await getVehicles(currentPage, ITEMS_PER_PAGE);

      const data = response.data.data;

      setVehicles(data.vehicles);
      setTotalPages(data.pagination.totalPages);
      setTotalVehicles(data.pagination.total);
    } catch (err) {
      console.error("Failed to refresh vehicles:", err);
      setActionError("Failed to refresh vehicle data.");
    }
  };

  const handleFormChange = (
    field: keyof VehiclePayload,
    value: string | number,
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm({ ...emptyForm });
    setFormError(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setActionError(null);
    setAddOpen(true);
  };

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const plateNumber = form.plate_number.trim().toUpperCase();

    const brand = form.brand.trim();
    const model = form.model.trim();

    if (!form.customer_id) {
      setFormError("Please select a customer.");
      return;
    }

    if (!plateNumber || !brand || !model) {
      setFormError("All fields are required.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      await createVehicle({
        customer_id: form.customer_id,
        plate_number: plateNumber,
        brand,
        model,
      });

      resetForm();
      setAddOpen(false);

      await refreshVehicles();
    } catch (err) {
      console.error("Failed to create vehicle:", err);
      setFormError("Failed to create vehicle. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (vehicle: Vehicle) => {
    setFormError(null);
    setActionError(null);
    setEditVehicle({ ...vehicle });
    setEditOpen(true);
  };

  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editVehicle) return;

    const plateNumber = editVehicle.plate_number.trim().toUpperCase();

    const brand = editVehicle.brand.trim();
    const model = editVehicle.model.trim();

    if (!editVehicle.customer_id) {
      setFormError("Please select a customer.");
      return;
    }

    if (!plateNumber || !brand || !model) {
      setFormError("All fields are required.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      await updateVehicle(editVehicle.id, {
        customer_id: editVehicle.customer_id,
        plate_number: plateNumber,
        brand,
        model,
      });

      setEditVehicle(null);
      setEditOpen(false);

      await refreshVehicles();
    } catch (err) {
      console.error("Failed to update vehicle:", err);
      setFormError("Failed to update vehicle. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (id: number) => {
    setDeleteId(id);
    setActionError(null);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId === null) return;

    setSubmitting(true);
    setActionError(null);

    try {
      await deleteVehicle(deleteId);

      setDeleteOpen(false);
      setDeleteId(null);

      await fetchDeletedVehicles();

      if (vehicles.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        await refreshVehicles();
      }
    } catch (err) {
      console.error("Failed to delete vehicle:", err);
      setActionError("Failed to delete vehicle. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenRestore = (id: number) => {
    setRestoreId(id);
    setActionError(null);
    setRestoreOpen(true);
  };

  const handleRestore = async () => {
    if (restoreId === null) return;

    setSubmitting(true);
    setActionError(null);

    try {
      await restoreVehicle(restoreId);

      setRestoreOpen(false);
      setRestoreId(null);

      await fetchDeletedVehicles();
      await refreshVehicles();
    } catch (err) {
      console.error("Failed to restore vehicle:", err);
      setActionError("Failed to restore vehicle. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setFetchError(null);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        {" "}
        <div className="text-center">
          {" "}
          <RefreshCw className="mx-auto mb-3 h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading vehicles...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center gap-4">
        {" "}
        <p className="text-sm text-destructive">{fetchError} </p>
        <Button variant="outline" onClick={handleRetry}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {" "}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {" "}
        <div>
          {" "}
          <h1 className="text-2xl font-bold tracking-tight">Vehicles </h1>
          <p className="text-sm text-muted-foreground">
            Manage registered vehicles and their owners.
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog
            onOpenChange={(open) => {
              if (open) {
                void fetchDeletedVehicles();
              }
            }}
          >
            <Button variant="outline" onClick={() => fetchDeletedVehicles()}>
              <Trash2 className="mr-2 h-4 w-4" />
              Trash
              {deletedVehicles.length > 0 && (
                <Badge className="ml-2">{deletedVehicles.length}</Badge>
              )}
            </Button>

            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Vehicle Trash</DialogTitle>

                <DialogDescription>Restore deleted vehicles.</DialogDescription>
              </DialogHeader>

              {trashLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                </div>
              ) : deletedVehicles.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No deleted vehicles.
                </div>
              ) : (
                <div className="max-h-100 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {deletedVehicles.map((vehicle) => (
                        <TableRow key={vehicle.id}>
                          <TableCell>#{vehicle.id}</TableCell>

                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {vehicle.plate_number}
                              </p>

                              <p className="text-xs text-muted-foreground">
                                {vehicle.brand} {vehicle.model}
                              </p>
                            </div>
                          </TableCell>

                          <TableCell>
                            {vehicle.customers?.name ?? "-"}
                          </TableCell>

                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenRestore(vehicle.id)}
                            >
                              <RotateCcw className="mr-1 h-4 w-4" />
                              Restore
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog
            open={addOpen}
            onOpenChange={(open) => {
              setAddOpen(open);

              if (!open) {
                resetForm();
              }
            }}
          >
            <Button onClick={handleOpenAdd}>
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

              <form onSubmit={handleCreate} className="space-y-4">
                {formError && (
                  <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {formError}
                  </p>
                )}

                <div className="space-y-2">
                  <label htmlFor="customer" className="text-sm font-medium">
                    Customer
                  </label>

                  <select
                    id="customer"
                    value={form.customer_id || ""}
                    onChange={(e) =>
                      handleFormChange("customer_id", Number(e.target.value))
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

                <div className="space-y-2">
                  <label htmlFor="plateNumber" className="text-sm font-medium">
                    Plate Number
                  </label>

                  <Input
                    id="plateNumber"
                    placeholder="Example: B 1234 ABC"
                    value={form.plate_number}
                    onChange={(e) =>
                      handleFormChange(
                        "plate_number",
                        e.target.value.toUpperCase(),
                      )
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="brand" className="text-sm font-medium">
                    Brand
                  </label>

                  <Input
                    id="brand"
                    placeholder="Example: Toyota"
                    value={form.brand}
                    onChange={(e) => handleFormChange("brand", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="model" className="text-sm font-medium">
                    Model
                  </label>

                  <Input
                    id="model"
                    placeholder="Example: Avanza"
                    value={form.model}
                    onChange={(e) => handleFormChange("model", e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Vehicle"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {actionError && (
        <p className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {actionError}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Vehicles</p>

                <p className="mt-2 text-2xl font-bold">{totalVehicles}</p>
              </div>

              <div className="rounded-lg bg-primary/10 p-3">
                <Car className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Deleted Vehicles
                </p>

                <p className="mt-2 text-2xl font-bold text-destructive">
                  {deletedVehicles.length}
                </p>
              </div>

              <div className="rounded-lg bg-destructive/10 p-3">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
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
                    const owner =
                      vehicle.customers ??
                      customers.find(
                        (customer) => customer.id === vehicle.customer_id,
                      );

                    return (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-medium">
                          #{vehicle.id}
                        </TableCell>

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

                        <TableCell>
                          {owner ? (
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />

                              <div>
                                <p className="font-medium">{owner.name}</p>

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

                        <TableCell>{vehicle.brand}</TableCell>

                        <TableCell>{vehicle.model}</TableCell>

                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEdit(vehicle)}
                            >
                              <Pencil className="mr-1 h-4 w-4" />
                              Edit
                            </Button>

                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleOpenDelete(vehicle.id)}
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
      {totalPages > 1 && (
        <>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>

            {Array.from(
              {
                length: totalPages,
              },
              (_, index) => index + 1,
            ).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => prev + 1)}
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
      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);

          if (!open) {
            setDeleteId(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Vehicle</DialogTitle>

            <DialogDescription>
              Are you sure you want to delete this vehicle? The vehicle will be
              moved to Trash and can be restored later.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={submitting}
            >
              <Trash2 className="mr-2 h-4 w-4" />

              {submitting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={restoreOpen}
        onOpenChange={(open) => {
          setRestoreOpen(open);

          if (!open) {
            setRestoreId(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Restore Vehicle</DialogTitle>

            <DialogDescription>
              Are you sure you want to restore this vehicle?
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setRestoreOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>

            <Button onClick={handleRestore} disabled={submitting}>
              <RotateCcw className="mr-2 h-4 w-4" />

              {submitting ? "Restoring..." : "Restore"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);

          if (!open) {
            setEditVehicle(null);
            setFormError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>

            <DialogDescription>
              Update vehicle information and owner.
            </DialogDescription>
          </DialogHeader>

          {editVehicle && (
            <form onSubmit={handleUpdate} className="space-y-4">
              {formError && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {formError}
                </p>
              )}

              <div className="space-y-2">
                <label htmlFor="edit-customer" className="text-sm font-medium">
                  Customer
                </label>

                <select
                  id="edit-customer"
                  value={editVehicle.customer_id || ""}
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

              <div className="space-y-2">
                <label htmlFor="edit-plate" className="text-sm font-medium">
                  Plate Number
                </label>

                <Input
                  id="edit-plate"
                  value={editVehicle.plate_number}
                  onChange={(e) =>
                    setEditVehicle({
                      ...editVehicle,
                      plate_number: e.target.value.toUpperCase(),
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-brand" className="text-sm font-medium">
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

              <div className="space-y-2">
                <label htmlFor="edit-model" className="text-sm font-medium">
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

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Updating..." : "Update Vehicle"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
