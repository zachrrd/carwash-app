import {
  getService,
  createService,
  deleteService,
  updateService,
} from "@/services/service.service";

import { useEffect, useState, type FormEvent } from "react";
import type { Service } from "@/types/service";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

import { Plus, Pencil, Trash2, Clock, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // =========================
// PAGINATION
// =========================

const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [totalServices, setTotalServices] = useState(0);

  // ADD
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState("Active");

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // EDIT
  const [editService, setEditService] = useState<Service | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // DELETE
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // =========================
  // FETCH DATA
  // =========================

const fetchData = async (page: number) => {
  try {
    setLoading(true);
    setError(null);

    const response = await getService(page, 10);

    setServices(response.data.data.services);
    setTotalPages(response.data.data.pagination.totalPages);
    setTotalServices(response.data.data.pagination.total);
  } catch (error) {
    console.error(error);
    setError("Service data failed to fetch.");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  let cancelled = false;

  const loadData = async () => {
    try {
      const response = await getService(currentPage, 10);

      if (cancelled) return;

      setServices(response.data.data.services);
      setTotalPages(response.data.data.pagination.totalPages);
      setTotalServices(response.data.data.pagination.total);
      setError(null);
    } catch (error) {
      if (cancelled) return;

      console.error(error);
      setError("Service data failed to fetch.");
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  loadData();

  return () => {
    cancelled = true;
  };
}, [currentPage]);

  // =========================
  // ADD SERVICE
  // =========================

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSubmitting(true);

    try {
      await createService({
        name,
        duration: Number(duration),
        price: Number(price),
        status,
      });

      await fetchData(currentPage);

      setName("");
      setDuration("");
      setPrice("");
      setStatus("Active");

      setOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // EDIT SERVICE
  // =========================

  const handleEdit = (service: Service) => {
    setEditService(service);
    setEditOpen(true);
  };

  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editService) return;

    setSubmitting(true);

    try {
      await updateService(editService.id, {
        name: editService.name,
        duration: Number(editService.duration),
        price: Number(editService.price),
        status: editService.status,
      });

      await fetchData(currentPage);

      setEditOpen(false);
      setEditService(null);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // DELETE SERVICE
  // =========================

  const handleDelete = async (id: number) => {
    try {
      await deleteService(id);

      setDeleteOpen(false);
      setDeleteId(null);

      if (services.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        await fetchData(currentPage);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // =========================
  // FORMAT PRICE
  // =========================

  const formatPrice = (price: number | string) => {
    return `Rp ${Number(price).toLocaleString("id-ID")}`;
  };

  // =========================
  // STATUS BADGE
  // =========================

  const renderStatus = (status?: string | null) => {
    if (status === "Active") {
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
          Active
        </Badge>
      );
    }

    return (
      <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100">
        Inactive
      </Badge>
    );
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-3 h-6 w-6 animate-spin text-muted-foreground" />

          <p className="text-sm text-muted-foreground">Loading services...</p>
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

        <Button variant="outline" onClick={() => fetchData(currentPage)}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Services</h1>

          <p className="text-sm text-muted-foreground">
            Manage car wash services and pricing.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Service</DialogTitle>

              <DialogDescription>
                Add a new service to your car wash.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* NAME */}

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Service Name
                </label>

                <Input
                  id="name"
                  placeholder="Example: Premium Wash"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* DURATION */}

              <div className="space-y-2">
                <label htmlFor="duration" className="text-sm font-medium">
                  Duration
                </label>

                <div className="relative">
                  <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    placeholder="30"
                    className="pl-9 pr-20"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    required
                  />

                  <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                    minutes
                  </span>
                </div>
              </div>

              {/* PRICE */}

              <div className="space-y-2">
                <label htmlFor="price" className="text-sm font-medium">
                  Price
                </label>

                <Input
                  id="price"
                  type="number"
                  min="0"
                  placeholder="30000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              {/* STATUS */}

              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Status
                </label>

                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-md border bg-background p-2 text-sm"
                >
                  <option value="Active">Active</option>

                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Saving..." : "Save Service"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ================= SUMMARY ================= */}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Services</p>

            <p className="mt-2 text-2xl font-bold">{totalServices}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">
  Active Services (This Page)
</p>

<p className="mt-2 text-2xl font-bold text-green-600">
  {services.filter((service) => service.status === "Active").length}
</p>
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

                  <TableHead>Service</TableHead>

                  <TableHead>Duration</TableHead>

                  <TableHead>Price</TableHead>

                  <TableHead>Status</TableHead>

                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {services.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      No services found.
                    </TableCell>
                  </TableRow>
                ) : (
                  services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">
                        #{service.id}
                      </TableCell>

                      <TableCell>
                        <div>
                          <p className="font-medium">{service.name}</p>

                          <p className="text-xs text-muted-foreground">
                            Car Wash Service
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {service.duration} min
                        </div>
                      </TableCell>

                      <TableCell className="font-medium">
                        {formatPrice(service.price)}
                      </TableCell>

                      <TableCell>{renderStatus(service.status)}</TableCell>

                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(service)}
                          >
                            <Pencil className="mr-1 h-4 w-4" />
                            Edit
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setDeleteId(service.id);
                              setDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* =========================
    PAGINATION
========================= */}

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

      {Array.from({ length: totalPages }, (_, index) => {
        const page = index + 1;

        return (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </Button>
        );
      })}

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

      {/* ================= EDIT DIALOG ================= */}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>

            <DialogDescription>Update service information.</DialogDescription>
          </DialogHeader>

          {editService && (
            <form onSubmit={handleUpdate} className="space-y-4">
              {/* NAME */}

              <div className="space-y-2">
                <label className="text-sm font-medium">Service Name</label>

                <Input
                  value={editService.name}
                  onChange={(e) =>
                    setEditService({
                      ...editService,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>

              {/* DURATION */}

              <div className="space-y-2">
                <label className="text-sm font-medium">Duration</label>

                <Input
                  type="number"
                  min="1"
                  value={editService.duration}
                  onChange={(e) =>
                    setEditService({
                      ...editService,
                      duration: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>

              {/* PRICE */}

              <div className="space-y-2">
                <label className="text-sm font-medium">Price</label>

                <Input
                  type="number"
                  min="0"
                  value={editService.price}
                  onChange={(e) =>
                    setEditService({
                      ...editService,
                      price: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>

              {/* STATUS */}

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>

                <select
                  value={editService.status ?? ""}
                  onChange={(e) =>
                    setEditService({
                      ...editService,
                      status: e.target.value,
                    })
                  }
                  className="w-full rounded-md border bg-background p-2 text-sm"
                >
                  <option value="Active">Active</option>

                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Updating..." : "Update Service"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ================= DELETE DIALOG ================= */}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>

            <DialogDescription>
              Are you sure you want to delete this service? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
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
    </div>
  );
}
