import {
  getStaffs,
  createStaff,
  deleteStaff,
  updateStaff,
  getDeletedStaffs,
  restoreStaff,
} from "@/services/staff.service";

import { useCallback, useEffect, useState, type FormEvent } from "react";

import type { Staff, StaffStatus } from "@/types/staff";

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
  Pencil,
  Plus,
  Trash2,
  RefreshCw,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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

export default function Staffs() {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [deletedStaffs, setDeletedStaffs] = useState<Staff[]>([]);

  const [loading, setLoading] = useState(true);
  const [trashLoading, setTrashLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStaffs, setTotalStaffs] = useState(0);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<StaffStatus>("ACTIVE");
  const [open, setOpen] = useState(false);

  const [editStaff, setEditStaff] = useState<Staff | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [restoreId, setRestoreId] = useState<number | null>(null);
  const [restoreOpen, setRestoreOpen] = useState(false);

  const [trashOpen, setTrashOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const fetchStaffs = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getStaffs(page, 10);
      const data = response.data.data;

      setStaffs(data.staffs);
      setTotalPages(data.pagination.totalPages);
      setTotalStaffs(data.pagination.total);

      if (data.pagination.totalPages > 0 && page > data.pagination.totalPages) {
        setCurrentPage(data.pagination.totalPages);
      }
    } catch (error) {
      console.error(error);
      setError("Staff data failed to fetch.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDeletedStaffs = useCallback(async () => {
    try {
      setTrashLoading(true);

      const response = await getDeletedStaffs();

      setDeletedStaffs(response.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setTrashLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchStaffs(currentPage);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [currentPage, fetchStaffs]);

  const handleTrashOpenChange = (value: boolean) => {
    setTrashOpen(value);

    if (value) {
      void fetchDeletedStaffs();
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    setSubmitting(true);

    try {
      await createStaff({
        name: name.trim(),
        phone: phone.trim(),
        status,
      });

      setName("");
      setPhone("");
      setStatus("ACTIVE");
      setOpen(false);

      await fetchStaffs(currentPage);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (staff: Staff) => {
    setEditStaff(staff);
    setEditOpen(true);
  };

  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editStaff) {
      return;
    }

    if (!editStaff.name.trim()) {
      return;
    }

    setSubmitting(true);

    try {
      await updateStaff(editStaff.id, {
        name: editStaff.name.trim(),
        phone: editStaff.phone?.trim() ?? "",
        status: editStaff.status,
      });

      setEditOpen(false);
      setEditStaff(null);

      await fetchStaffs(currentPage);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setSubmitting(true);

    try {
      await deleteStaff(id);

      setDeleteOpen(false);
      setDeleteId(null);

      await fetchDeletedStaffs();

      if (staffs.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        await fetchStaffs(currentPage);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestore = async (id: number) => {
    setSubmitting(true);

    try {
      await restoreStaff(id);

      setRestoreOpen(false);
      setRestoreId(null);

      await fetchDeletedStaffs();
      await fetchStaffs(currentPage);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStatus = (staffStatus: StaffStatus | null) => {
    if (staffStatus === "ACTIVE") {
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

  if (loading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto mb-3 h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading staff...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center gap-4">
        <p className="text-sm text-destructive">{error}</p>

        <Button
          type="button"
          variant="outline"
          onClick={() => void fetchStaffs(currentPage)}
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
          <h1 className="text-2xl font-bold tracking-tight">Staff</h1>

          <p className="text-sm text-muted-foreground">
            Manage car wash staff.
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog open={trashOpen} onOpenChange={handleTrashOpenChange}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setTrashOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Trash
              {deletedStaffs.length > 0 && (
                <Badge className="ml-2">{deletedStaffs.length}</Badge>
              )}
            </Button>

            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Staff Trash</DialogTitle>

                <DialogDescription>
                  Restore deleted staff members.
                </DialogDescription>
              </DialogHeader>

              {trashLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                </div>
              ) : deletedStaffs.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No deleted staff.
                </div>
              ) : (
                <div className="max-h-100 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {deletedStaffs.map((staff) => (
                        <TableRow key={staff.id}>
                          <TableCell>#{staff.id}</TableCell>

                          <TableCell>{staff.name}</TableCell>

                          <TableCell>{staff.phone ?? "-"}</TableCell>

                          <TableCell>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setRestoreId(staff.id);
                                setRestoreOpen(true);
                              }}
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

          <Dialog open={open} onOpenChange={setOpen}>
            <Button type="button" onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Staff
            </Button>

            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Staff</DialogTitle>

                <DialogDescription>Add a new staff member.</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Name
                  </label>

                  <Input
                    id="name"
                    placeholder="Staff name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Phone
                  </label>

                  <Input
                    id="phone"
                    placeholder="08123456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm font-medium">
                    Status
                  </label>

                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as StaffStatus)}
                    className="w-full rounded-md border bg-background p-2 text-sm"
                  >
                    <option value="ACTIVE">Active</option>

                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Staff"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Staff</p>

            <p className="mt-2 text-2xl font-bold">{totalStaffs}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Active Staff</p>

            <p className="mt-2 text-2xl font-bold text-green-600">
              {staffs.filter((staff) => staff.status === "ACTIVE").length}
            </p>

            <p className="text-xs text-muted-foreground">This page</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Deleted Staff</p>

            <p className="mt-2 text-2xl font-bold text-destructive">
              {deletedStaffs.length}
            </p>

            <p className="text-xs text-muted-foreground">Loaded from Trash</p>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {staffs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center">
                      No staff found.
                    </TableCell>
                  </TableRow>
                ) : (
                  staffs.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell className="font-medium">#{staff.id}</TableCell>

                      <TableCell>
                        <p className="font-medium">{staff.name}</p>

                        <p className="text-xs text-muted-foreground">
                          Car Wash Staff
                        </p>
                      </TableCell>

                      <TableCell>{staff.phone ?? "-"}</TableCell>

                      <TableCell>{renderStatus(staff.status)}</TableCell>

                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(staff)}
                          >
                            <Pencil className="mr-1 h-4 w-4" />
                            Edit
                          </Button>

                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setDeleteId(staff.id);
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
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (page) => (
              <Button
                type="button"
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ),
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </p>

      <Dialog
        open={editOpen}
        onOpenChange={(value) => {
          setEditOpen(value);

          if (!value) {
            setEditStaff(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Staff</DialogTitle>

            <DialogDescription>Update staff information.</DialogDescription>
          </DialogHeader>

          {editStaff && (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="edit-name" className="text-sm font-medium">
                  Name
                </label>

                <Input
                  id="edit-name"
                  value={editStaff.name}
                  onChange={(e) =>
                    setEditStaff({
                      ...editStaff,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-phone" className="text-sm font-medium">
                  Phone
                </label>

                <Input
                  id="edit-phone"
                  value={editStaff.phone ?? ""}
                  onChange={(e) =>
                    setEditStaff({
                      ...editStaff,
                      phone: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-status" className="text-sm font-medium">
                  Status
                </label>

                <select
                  id="edit-status"
                  value={editStaff.status ?? "ACTIVE"}
                  onChange={(e) =>
                    setEditStaff({
                      ...editStaff,
                      status: e.target.value as StaffStatus,
                    })
                  }
                  className="w-full rounded-md border bg-background p-2 text-sm"
                >
                  <option value="ACTIVE">Active</option>

                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Updating..." : "Update Staff"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onOpenChange={(value) => {
          setDeleteOpen(value);

          if (!value) {
            setDeleteId(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Staff</DialogTitle>

            <DialogDescription>
              Are you sure you want to delete this staff? The staff will be
              moved to Trash and can be restored later.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => {
                setDeleteOpen(false);
                setDeleteId(null);
              }}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              disabled={submitting || deleteId === null}
              onClick={() => {
                if (deleteId !== null) {
                  void handleDelete(deleteId);
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />

              {submitting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={restoreOpen}
        onOpenChange={(value) => {
          setRestoreOpen(value);

          if (!value) {
            setRestoreId(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Restore Staff</DialogTitle>

            <DialogDescription>
              Are you sure you want to restore this staff?
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={() => {
                setRestoreOpen(false);
                setRestoreId(null);
              }}
            >
              Cancel
            </Button>

            <Button
              type="button"
              disabled={submitting || restoreId === null}
              onClick={() => {
                if (restoreId !== null) {
                  void handleRestore(restoreId);
                }
              }}
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
