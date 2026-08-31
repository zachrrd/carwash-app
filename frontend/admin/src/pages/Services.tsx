import { useEffect, useState, type FormEvent } from "react";

import {
  getServices,
  createService,
  updateService,
  deleteService,
  getDeletedServices,
  restoreService,
} from "@/services/service.service";

import type { Service, CreateService, ActiveStatus } from "@/types/service";

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
import { Badge } from "@/components/ui/badge";

import {
  Plus,
  Pencil,
  Trash2,
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";

const ITEMS_PER_PAGE = 10;

const emptyForm: CreateService = {
  name: "",
  duration: 0,
  price: 0,
  status: "ACTIVE",
};

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [deletedServices, setDeletedServices] = useState<Service[]>([]);

  const [loading, setLoading] = useState(true);
  const [trashLoading, setTrashLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [trashError, setTrashError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [isTrash, setIsTrash] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalServices, setTotalServices] = useState(0);

  const [form, setForm] = useState<CreateService>(emptyForm);
  const [imageFile, setImageFile] = useState<File | undefined>();

  const [addOpen, setAddOpen] = useState(false);

  const [editService, setEditService] = useState<Service | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | undefined>();
  const [editOpen, setEditOpen] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [restoreId, setRestoreId] = useState<number | null>(null);
  const [restoreOpen, setRestoreOpen] = useState(false);

  useEffect(() => {
    if (isTrash) return;

    let cancelled = false;

    const loadServices = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getServices(currentPage, ITEMS_PER_PAGE);
        const data = response.data.data;

        if (cancelled) return;

        setServices(data.services);
        setTotalPages(data.pagination.totalPages);
        setTotalServices(data.pagination.total);
      } catch (err) {
        if (cancelled) return;

        console.error("Failed to fetch services:", err);
        setError("Service data failed to fetch.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadServices();

    return () => {
      cancelled = true;
    };
  }, [currentPage, isTrash]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getServices(currentPage, ITEMS_PER_PAGE);
      const data = response.data.data;

      setServices(data.services);
      setTotalPages(data.pagination.totalPages);
      setTotalServices(data.pagination.total);
    } catch (err) {
      console.error("Failed to fetch services:", err);
      setError("Service data failed to fetch.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedServices = async () => {
    try {
      setTrashLoading(true);
      setTrashError(null);

      const response = await getDeletedServices();

      setDeletedServices(response.data.data);
    } catch (err) {
      console.error("Failed to fetch deleted services:", err);
      setTrashError("Deleted service data failed to fetch.");
    } finally {
      setTrashLoading(false);
    }
  };

  const handleOpenTrash = async () => {
    setIsTrash(true);
    setTrashError(null);
    await fetchDeletedServices();
  };

  const handleBackToServices = () => {
    setIsTrash(false);
    setCurrentPage(1);
  };

  const resetAddForm = () => {
    setForm({ ...emptyForm });
    setImageFile(undefined);
    setFormError(null);
  };

  const handleOpenAdd = () => {
    resetAddForm();
    setAddOpen(true);
  };

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setFormError("Service name is required.");
      return;
    }

    if (form.duration <= 0) {
      setFormError("Duration must be greater than 0.");
      return;
    }

    if (form.price <= 0) {
      setFormError("Price must be greater than 0.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      await createService(
        {
          name: form.name.trim(),
          duration: Number(form.duration),
          price: Number(form.price),
          status: form.status,
        },
        imageFile,
      );

      if (currentPage !== 1 && services.length === 0) {
        setCurrentPage(1);
      } else {
        await fetchServices();
      }

      resetAddForm();
      setAddOpen(false);
    } catch (err) {
      console.error("Failed to create service:", err);
      setFormError("Failed to create service. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (service: Service) => {
    setFormError(null);
    setEditImageFile(undefined);
    setEditService({ ...service });
    setEditOpen(true);
  };

  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editService) return;

    if (!editService.name.trim()) {
      setFormError("Service name is required.");
      return;
    }

    if (editService.duration <= 0) {
      setFormError("Duration must be greater than 0.");
      return;
    }

    if (Number(editService.price) <= 0) {
      setFormError("Price must be greater than 0.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    try {
      await updateService(
        editService.id,
        {
          name: editService.name.trim(),
          duration: Number(editService.duration),
          price: Number(editService.price),
          status: editService.status ?? "ACTIVE",
        },
        editImageFile,
      );

      await fetchServices();

      setEditService(null);
      setEditImageFile(undefined);
      setEditOpen(false);
    } catch (err) {
      console.error("Failed to update service:", err);
      setFormError("Failed to update service. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (deleteId === null) return;

    setSubmitting(true);
    setFormError(null);

    try {
      await deleteService(deleteId);

      setDeleteOpen(false);
      setDeleteId(null);

      if (services.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        await fetchServices();
      }
    } catch (err) {
      console.error("Failed to delete service:", err);
      setFormError("Failed to delete service. Please try again.");
      setDeleteOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestore = async () => {
    if (restoreId === null) return;

    setSubmitting(true);

    try {
      await restoreService(restoreId);

      setDeletedServices((prev) =>
        prev.filter((service) => service.id !== restoreId),
      );

      setRestoreOpen(false);
      setRestoreId(null);
    } catch (err) {
      console.error("Failed to restore service:", err);
      setTrashError("Failed to restore service. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

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

  const formatPrice = (price: number | string) => {
    return `Rp ${Number(price).toLocaleString("id-ID")}`;
  };

  const renderStatus = (status: ActiveStatus | null) => {
    if (status === "ACTIVE") {
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

  const activeServices = services.filter(
    (service) => service.status === "ACTIVE",
  ).length;

  if (!isTrash && loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-3 h-6 w-6 animate-spin text-muted-foreground" />

          <p className="text-sm text-muted-foreground">Loading services...</p>
        </div>
      </div>
    );
  }

  if (!isTrash && error) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center gap-4">
        <p className="text-sm text-destructive">{error}</p>

        <Button variant="outline" onClick={() => void fetchServices()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  if (isTrash) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToServices}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>

              <h1 className="text-2xl font-bold tracking-tight">
                Service Trash
              </h1>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Restore deleted services.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => void fetchDeletedServices()}
            disabled={trashLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${trashLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {trashError && (
          <div className="flex items-center justify-between rounded-md bg-destructive/10 px-4 py-3">
            <p className="text-sm text-destructive">{trashError}</p>

            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchDeletedServices()}
            >
              Try Again
            </Button>
          </div>
        )}

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
                  {trashLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <RefreshCw className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : deletedServices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Trash2 className="h-8 w-8 text-muted-foreground" />

                          <p className="text-sm text-muted-foreground">
                            Trash is empty.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    deletedServices.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-medium">
                          #{service.id}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-3">
                            {service.image_url ? (
                              <img
                                src={service.image_url}
                                alt={service.name}
                                className="h-10 w-10 rounded-md object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}

                            <div>
                              <p className="font-medium">{service.name}</p>

                              <p className="text-xs text-muted-foreground">
                                Deleted service
                              </p>
                            </div>
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
                          <div className="flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setRestoreId(service.id);
                                setRestoreOpen(true);
                              }}
                            >
                              <RotateCcw className="mr-1 h-4 w-4" />
                              Restore
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
              <DialogTitle>Restore Service</DialogTitle>

              <DialogDescription>
                Are you sure you want to restore this service? It will appear
                again in the service list.
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

              <Button
                onClick={() => void handleRestore()}
                disabled={submitting}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                {submitting ? "Restoring..." : "Restore"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Services</h1>

          <p className="text-sm text-muted-foreground">
            Manage car wash services and pricing.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleOpenTrash}>
            <Trash2 className="mr-2 h-4 w-4" />
            Trash
          </Button>

          <Dialog
            open={addOpen}
            onOpenChange={(open) => {
              setAddOpen(open);

              if (!open) {
                resetAddForm();
              }
            }}
          >
            <Button onClick={handleOpenAdd}>
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

              <form onSubmit={handleCreate} className="space-y-4">
                {formError && (
                  <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    {formError}
                  </p>
                )}

                <div className="space-y-2">
                  <label htmlFor="service-name" className="text-sm font-medium">
                    Service Name
                  </label>

                  <Input
                    id="service-name"
                    placeholder="Example: Premium Wash"
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="service-duration"
                    className="text-sm font-medium"
                  >
                    Duration
                  </label>

                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />

                    <Input
                      id="service-duration"
                      type="number"
                      min="1"
                      placeholder="30"
                      className="pl-9 pr-20"
                      value={form.duration || ""}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          duration: Number(e.target.value),
                        }))
                      }
                      required
                    />

                    <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                      minutes
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="service-price"
                    className="text-sm font-medium"
                  >
                    Price
                  </label>

                  <Input
                    id="service-price"
                    type="number"
                    min="1"
                    placeholder="30000"
                    value={form.price || ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        price: Number(e.target.value),
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="service-status"
                    className="text-sm font-medium"
                  >
                    Status
                  </label>

                  <select
                    id="service-status"
                    value={form.status}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        status: e.target.value as ActiveStatus,
                      }))
                    }
                    className="w-full rounded-md border bg-background p-2 text-sm"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="service-image"
                    className="text-sm font-medium"
                  >
                    Image
                  </label>

                  <Input
                    id="service-image"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) =>
                      setImageFile(e.target.files?.[0] ?? undefined)
                    }
                  />

                  <p className="text-xs text-muted-foreground">
                    JPG, JPEG, PNG, or WEBP. Maximum 5 MB.
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Service"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {formError && (
        <p className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {formError}
        </p>
      )}

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
              {activeServices}
            </p>
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
                      <div className="flex flex-col items-center gap-2">
                        <Clock className="h-8 w-8 text-muted-foreground" />

                        <p className="text-sm text-muted-foreground">
                          No services found.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell className="font-medium">
                        #{service.id}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-3">
                          {service.image_url ? (
                            <img
                              src={service.image_url}
                              alt={service.name}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                              <ImageIcon className="h-4 w-4 text-primary" />
                            </div>
                          )}

                          <div>
                            <p className="font-medium">{service.name}</p>

                            <p className="text-xs text-muted-foreground">
                              Car Wash Service
                            </p>
                          </div>
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
                            onClick={() => handleOpenEdit(service)}
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

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);

          if (!open) {
            setEditService(null);
            setEditImageFile(undefined);
            setFormError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>

            <DialogDescription>Update service information.</DialogDescription>
          </DialogHeader>

          {editService && (
            <form onSubmit={handleUpdate} className="space-y-4">
              {formError && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {formError}
                </p>
              )}

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

              <div className="space-y-2">
                <label className="text-sm font-medium">Price</label>

                <Input
                  type="number"
                  min="1"
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>

                <select
                  value={editService.status ?? "ACTIVE"}
                  onChange={(e) =>
                    setEditService({
                      ...editService,
                      status: e.target.value as ActiveStatus,
                    })
                  }
                  className="w-full rounded-md border bg-background p-2 text-sm"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="edit-service-image"
                  className="text-sm font-medium"
                >
                  Replace Image
                </label>

                {editService.image_url && (
                  <img
                    src={editService.image_url}
                    alt={editService.name}
                    className="h-24 w-24 rounded-md object-cover"
                  />
                )}

                <Input
                  id="edit-service-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) =>
                    setEditImageFile(e.target.files?.[0] ?? undefined)
                  }
                />

                <p className="text-xs text-muted-foreground">
                  Leave empty to keep the current image.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Updating..." : "Update Service"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

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
            <DialogTitle>Delete Service</DialogTitle>

            <DialogDescription>
              Are you sure you want to delete this service? The service will be
              moved to trash and can be restored later.
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
              onClick={() => void handleDelete()}
              disabled={submitting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {submitting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
