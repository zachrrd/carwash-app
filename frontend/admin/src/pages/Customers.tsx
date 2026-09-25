import { useEffect, useState, type FormEvent } from "react";
import {
  createCustomer,
  getCustomers,
  deleteCustomer,
  updateCustomer,
  createCustomerAccount,
  getDeletedCustomers,
  restoreCustomer,
} from "@/services/customer.service";

import type { Customer, CreateCustomerAccount } from "@/types/customer";
import type { AxiosError } from "axios";

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
  Mail,
  ArchiveRestore,
} from "lucide-react";

import { toast } from "sonner";

const PAGE_SIZE = 10;

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [open, setOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const [accountCustomer, setAccountCustomer] = useState<Customer | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [accountSubmitting, setAccountSubmitting] = useState(false);

  const [trashOpen, setTrashOpen] = useState(false);
  const [deletedCustomers, setDeletedCustomers] = useState<Customer[]>([]);
  const [trashLoading, setTrashLoading] = useState(false);
  const [restoreSubmitting, setRestoreSubmitting] = useState<number | null>(
    null,
  );
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getCustomers(currentPage, PAGE_SIZE);

        if (cancelled) return;

        const data = response.data.data;

        setCustomers(data.customers);
        setTotalPages(data.pagination.totalPages);
        setTotalCustomers(data.pagination.total);
      } catch (err) {
        if (cancelled) return;

        console.error("Failed to fetch customers:", err);
        setError("Customer data failed to fetch.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [currentPage]);

  const loadCustomers = async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getCustomers(page, PAGE_SIZE);
      const data = response.data.data;

      setCustomers(data.customers);
      setTotalPages(data.pagination.totalPages);
      setTotalCustomers(data.pagination.total);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      setError("Customer data failed to fetch.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = (customer: Customer) => {
    setAccountCustomer(customer);
    setAccountEmail("");
    setAccountPassword("");
    setAccountOpen(true);
  };

  const handleAccountSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!accountCustomer) return;

    const email = accountEmail.trim().toLowerCase();
    const password = accountPassword.trim();

    if (!email) {
      toast.error("Email wajib diisi");
      return;
    }

    if (password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    setAccountSubmitting(true);

    try {
      const data: CreateCustomerAccount = {
        email,
        password,
      };

      await createCustomerAccount(accountCustomer.id, data);

      setAccountOpen(false);
      setAccountCustomer(null);
      setAccountEmail("");
      setAccountPassword("");

      toast.success("Akun customer berhasil dibuat");

      await loadCustomers(currentPage);
    } catch (err) {
      console.error("Failed to create customer account:", err);

      const axiosError = err as AxiosError<{ message?: string }>;

      const message =
        axiosError.response?.data?.message ?? "Gagal membuat akun customer";

      toast.error(message);
    } finally {
      setAccountSubmitting(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      toast.error("Nama customer wajib diisi");
      return;
    }

    if (!trimmedPhone) {
      toast.error("Nomor telepon wajib diisi");
      return;
    }

    setSubmitting(true);

    try {
      await createCustomer({
        name: trimmedName,
        phone: trimmedPhone,
      });

      setName("");
      setPhone("");
      setOpen(false);

      toast.success("Customer berhasil ditambahkan");

      await loadCustomers(currentPage);
    } catch (err) {
      console.error("Failed to create customer:", err);
      toast.error("Gagal menambahkan customer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleteSubmitting(true);

    try {
      await deleteCustomer(id);

      setDeleteOpen(false);
      setDeleteId(null);

      toast.success("Customer berhasil dihapus");

      if (customers.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        await loadCustomers(currentPage);
      }
    } catch (err) {
      console.error("Failed to delete customer:", err);
      toast.error("Gagal menghapus customer");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditCustomer({ ...customer });
    setEditOpen(true);
  };

  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editCustomer) return;

    const trimmedName = editCustomer.name.trim();
    const trimmedPhone = editCustomer.phone?.trim() ?? "";

    if (!trimmedName) {
      toast.error("Nama customer wajib diisi");
      return;
    }

    if (!trimmedPhone) {
      toast.error("Nomor telepon wajib diisi");
      return;
    }

    setSubmitting(true);

    try {
      await updateCustomer(editCustomer.id, {
        name: trimmedName,
        phone: trimmedPhone,
      });

      setEditOpen(false);
      setEditCustomer(null);

      toast.success("Customer berhasil diperbarui");

      await loadCustomers(currentPage);
    } catch (err) {
      console.error("Failed to update customer:", err);
      toast.error("Gagal memperbarui customer");
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

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const handleAddDialogChange = (value: boolean) => {
    if (submitting) return;

    setOpen(value);

    if (!value) {
      setName("");
      setPhone("");
    }
  };

  const handleEditDialogChange = (value: boolean) => {
    if (submitting) return;

    setEditOpen(value);

    if (!value) {
      setEditCustomer(null);
    }
  };

  const handleDeleteDialogChange = (value: boolean) => {
    if (deleteSubmitting) return;

    setDeleteOpen(value);

    if (!value) {
      setDeleteId(null);
    }
  };

  const handleOpenTrash = async () => {
    setTrashOpen(true);
    setTrashLoading(true);

    try {
      const response = await getDeletedCustomers();

      setDeletedCustomers(response.data.data);
    } catch (err) {
      console.error("Failed to fetch deleted customers:", err);

      const axiosError = err as AxiosError<{ message?: string }>;

      const message =
        axiosError.response?.data?.message ??
        "Gagal mengambil data customer yang dihapus";

      toast.error(message);
    } finally {
      setTrashLoading(false);
    }
  };
  const handleRestore = async (id: number) => {
    if (restoreSubmitting !== null) return;

    setRestoreSubmitting(id);

    try {
      await restoreCustomer(id);

      toast.success("Customer berhasil dipulihkan");

      setDeletedCustomers((prev) =>
        prev.filter((customer) => customer.id !== id),
      );

      await loadCustomers(currentPage);
    } catch (err) {
      console.error("Failed to restore customer:", err);

      const axiosError = err as AxiosError<{ message?: string }>;

      const message =
        axiosError.response?.data?.message ?? "Gagal memulihkan customer";

      toast.error(message);
    } finally {
      setRestoreSubmitting(null);
    }
  };
  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-3 h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading customers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center gap-4">
        <p className="text-sm text-destructive">{error}</p>

        <Button
          variant="outline"
          onClick={() => void loadCustomers(currentPage)}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>

          <p className="text-sm text-muted-foreground">
            Manage your car wash customers.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void handleOpenTrash()}>
            <Trash2 className="mr-2 h-4 w-4" />
            Trash
          </Button>
          <Dialog open={open} onOpenChange={handleAddDialogChange}>
            <Button onClick={() => setOpen(true)} disabled={submitting}>
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
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Customer Name
                  </label>

                  <Input
                    id="name"
                    placeholder="Example: John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={submitting}
                    required
                  />
                </div>

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
                    disabled={submitting}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Customer"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Customers</p>

                <p className="mt-2 text-2xl font-bold">{totalCustomers}</p>
              </div>

              <div className="rounded-lg bg-primary/10 p-3">
                <Users className="h-5 w-5 text-primary" />
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
                  <TableHead>Customer</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
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
                      <TableCell className="font-medium">
                        #{customer.id}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-sm font-semibold text-primary">
                              {customer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>

                          <div>
                            <p className="font-medium">{customer.name}</p>

                            <p className="text-xs text-muted-foreground">
                              Customer
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {customer.user?.email ? (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{customer.user.email}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            No account
                          </span>
                        )}
                      </TableCell>

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

                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(customer)}
                            disabled={submitting}
                          >
                            <Pencil className="mr-1 h-4 w-4" />
                            Edit
                          </Button>

                          {!customer.user && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCreateAccount(customer)}
                              disabled={accountSubmitting}
                            >
                              Create Account
                            </Button>
                          )}

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setDeleteId(customer.id);
                              setDeleteOpen(true);
                            }}
                            disabled={deleteSubmitting}
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

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ),
            )}

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

      <Dialog open={editOpen} onOpenChange={handleEditDialogChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>

            <DialogDescription>Update customer information.</DialogDescription>
          </DialogHeader>

          {editCustomer && (
            <form onSubmit={handleUpdate} className="space-y-4">
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
                  disabled={submitting}
                  required
                />
              </div>

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
                  disabled={submitting}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Updating..." : "Update Customer"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={accountOpen}
        onOpenChange={(value) => {
          if (accountSubmitting) return;

          setAccountOpen(value);

          if (!value) {
            setAccountCustomer(null);
            setAccountEmail("");
            setAccountPassword("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Customer Account</DialogTitle>

            <DialogDescription>
              Create a login account for {accountCustomer?.name}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAccountSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="account-email" className="text-sm font-medium">
                Email
              </label>

              <Input
                id="account-email"
                type="email"
                placeholder="customer@example.com"
                value={accountEmail}
                onChange={(e) => setAccountEmail(e.target.value)}
                required
                disabled={accountSubmitting}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="account-password" className="text-sm font-medium">
                Password
              </label>

              <Input
                id="account-password"
                type="password"
                placeholder="Minimum 6 characters"
                value={accountPassword}
                onChange={(e) => setAccountPassword(e.target.value)}
                required
                minLength={6}
                disabled={accountSubmitting}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={accountSubmitting}
            >
              {accountSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={handleDeleteDialogChange}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Customer</DialogTitle>

            <DialogDescription>
              Are you sure you want to delete this customer? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleteSubmitting}
            >
              Cancel
            </Button>

            <Button
              variant="destructive"
              disabled={deleteSubmitting}
              onClick={() => {
                if (deleteId !== null) {
                  void handleDelete(deleteId);
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />

              {deleteSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={trashOpen} onOpenChange={setTrashOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Customer Trash</DialogTitle>

            <DialogDescription>
              Customer yang sudah dihapus dapat dipulihkan kembali.
            </DialogDescription>
          </DialogHeader>

          {trashLoading ? (
            <div className="flex min-h-32 items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : deletedCustomers.length === 0 ? (
            <div className="flex min-h-32 flex-col items-center justify-center gap-2">
              <Trash2 className="h-8 w-8 text-muted-foreground" />

              <p className="text-sm text-muted-foreground">Trash is empty.</p>
            </div>
          ) : (
            <div className="max-h-100 overflow-y-auto">
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
                  {deletedCustomers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        #{customer.id}
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                            <span className="text-sm font-semibold">
                              {customer.name.charAt(0).toUpperCase()}
                            </span>
                          </div>

                          <div>
                            <p className="font-medium">{customer.name}</p>

                            <p className="text-xs text-muted-foreground">
                              Deleted customer
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>{customer.phone ?? "-"}</TableCell>

                      <TableCell>
                        <div className="flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void handleRestore(customer.id)}
                            disabled={restoreSubmitting === customer.id}
                          >
                            <ArchiveRestore className="mr-1 h-4 w-4" />

                            {restoreSubmitting === customer.id
                              ? "Restoring..."
                              : "Restore"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
