import { useEffect, useState, type FormEvent } from "react";
import {
  createCustomer,
  getCustomers,
  deleteCustomer,
  updateCustomer,
} from "@/services/customer.service";

import type { Customer } from "@/types/customer";

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
  Users,
  RefreshCw,
  Phone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { toast } from "sonner";

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);

  // ADD
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [open, setOpen] = useState(false);

  // SUBMIT
  const [submitting, setSubmitting] = useState(false);

  // DELETE
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // EDIT
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);

  const [editOpen, setEditOpen] = useState(false);

  // =========================
  // FETCH DATA
  // =========================

// =========================
// FETCH DATA
// =========================

const fetchData = async (page: number) => {
  try {
    setError(null);

    const response = await getCustomers(page, 10);

    setCustomers(response.data.data.customers);
    setTotalPages(response.data.data.pagination.totalPages);
    setTotalCustomers(response.data.data.pagination.total);
  } catch (error) {
    console.error(error);
    setError("Customer data failed to fetch.");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  let cancelled = false;

  const loadCustomers = async () => {
    try {
      const response = await getCustomers(currentPage, 10);

      if (cancelled) return;

      setCustomers(response.data.data.customers);
      setTotalPages(response.data.data.pagination.totalPages);
      setTotalCustomers(response.data.data.pagination.total);
      setError(null);
    } catch (error) {
      if (cancelled) return;

      console.error(error);
      setError("Customer data failed to fetch.");
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  loadCustomers();

  return () => {
    cancelled = true;
  };
}, [currentPage]);
  // =========================
  // ADD CUSTOMER
  // =========================

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSubmitting(true);

    try {
      await createCustomer({
        name,
        phone,
      });

      await fetchData(currentPage);

      setName("");
      setPhone("");

      setOpen(false);

      toast.success("Customer berhasil ditambahkan");
    } catch (error) {
      console.error(error);

      toast.error("Gagal menambahkan customer");
    } finally {
      setSubmitting(false);
    }
  };

  // =========================
  // DELETE CUSTOMER
  // =========================

  const handleDelete = async (id: number) => {
    try {
      await deleteCustomer(id);

      setDeleteOpen(false);
      setDeleteId(null);

      toast.success("Customer berhasil dihapus");

      await fetchData(currentPage);
    } catch (error) {
      console.error(error);

      toast.error("Gagal menghapus customer");
    }
  };

  // =========================
  // EDIT CUSTOMER
  // =========================

  const handleEdit = (customer: Customer) => {
    setEditCustomer(customer);
    setEditOpen(true);
  };

  // =========================
  // UPDATE CUSTOMER
  // =========================

  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editCustomer) return;

    setSubmitting(true);

    try {
      await updateCustomer(editCustomer.id, {
        name: editCustomer.name,
        phone: editCustomer.phone ?? "",
      });

      await fetchData(currentPage);

      setEditOpen(false);
      setEditCustomer(null);

      toast.success("Customer berhasil diperbarui");
    } catch (error) {
      console.error(error);

      toast.error("Gagal memperbarui customer");
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
            Loading customers...
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
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>

          <p className="text-sm text-muted-foreground">
            Manage your car wash customers.
          </p>
        </div>

        {/* ADD CUSTOMER */}

        <Dialog open={open} onOpenChange={setOpen}>
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Customer</DialogTitle>

              <DialogDescription>
                Add a new customer to your car wash.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* NAME */}

              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Customer Name
                </label>

                <Input
                  id="name"
                  placeholder="Example: John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* PHONE */}

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </label>

                <Input
                  id="phone"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save Customer"}
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
                  Total Customers
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {totalCustomers}
                </p>
              </div>

              <div className="rounded-lg bg-primary/10 p-3">
                <Users className="h-5 w-5 text-primary" />
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

                  <TableHead>Customer</TableHead>

                  <TableHead>Phone</TableHead>

                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-muted-foreground" />

                        <p className="text-sm text-muted-foreground">
                          No customers found.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer) => (
                    <TableRow key={customer.id}>
                      {/* ID */}

                      <TableCell className="font-medium">
                        #{customer.id}
                      </TableCell>

                      {/* CUSTOMER */}

                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-sm font-semibold text-primary">
                              {customer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>

                          <div>
                            <p className="font-medium">
                              {customer.name}
                            </p>

                            <p className="text-xs text-muted-foreground">
                              Customer
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* PHONE */}

                      <TableCell>
                        {customer.phone ? (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />

                            <span>{customer.phone}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            No phone number
                          </span>
                        )}
                      </TableCell>

                      {/* ACTION */}

                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(customer)}
                          >
                            <Pencil className="mr-1 h-4 w-4" />
                            Edit
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setDeleteId(customer.id);
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

      {/* ================= PAGINATION ================= */}

      {totalPages > 1 && (
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
      )}

      {/* ================= PAGE INFO ================= */}

      {totalPages > 1 && (
        <p className="text-center text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </p>
      )}

      {/* ================= EDIT DIALOG ================= */}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>

            <DialogDescription>
              Update customer information.
            </DialogDescription>
          </DialogHeader>

          {editCustomer && (
            <form onSubmit={handleUpdate} className="space-y-4">
              {/* NAME */}

              <div className="space-y-2">
                <label htmlFor="edit-name" className="text-sm font-medium">
                  Customer Name
                </label>

                <Input
                  id="edit-name"
                  value={editCustomer.name}
                  onChange={(e) =>
                    setEditCustomer({
                      ...editCustomer,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>

              {/* PHONE */}

              <div className="space-y-2">
                <label htmlFor="edit-phone" className="text-sm font-medium">
                  Phone Number
                </label>

                <Input
                  id="edit-phone"
                  type="tel"
                  value={editCustomer.phone ?? ""}
                  onChange={(e) =>
                    setEditCustomer({
                      ...editCustomer,
                      phone: e.target.value,
                    })
                  }
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? "Updating..." : "Update Customer"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ================= DELETE DIALOG ================= */}

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>

            <DialogDescription>
              Are you sure you want to delete this customer? This action
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
    </div>
  );
}