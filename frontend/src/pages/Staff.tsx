import {
  getStaffs,
  createStaff,
  deleteStaff,
  updateStaff,
} from "@/services/staff.service";
import { useState, useEffect, type FormEvent } from "react";
import type { Staff } from "@/types/staff";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Pencil, Plus, Trash2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";

export default function Staffs() {
  const [staffs, setStaffs] = useState<Staff[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("");

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editStaff, setEditStaff] = useState<Staff | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const [refresh, setRefresh] = useState(0);

const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  setSubmitting(true);

  try {
    await createStaff({
      name,
      phone,
      status,
    });

    setRefresh((prev) => prev + 1);

    setName("");
    setPhone("");
    setStatus("");

    setOpen(false);
  } catch (error) {
    console.error(error);
  } finally {
    setSubmitting(false);
  }
};

const handleDelete = async (id: number) => {
  try {
    await deleteStaff(id);

    if (staffs.length === 1 && page > 1) {
      setPage((prev) => prev - 1);
    } else {
    setRefresh((prev) => prev + 1);
    }
  } catch (error) {
    console.error(error);
  }
};
  const handleEdit = (staff: Staff) => {
    setEditStaff(staff);
    setEditOpen(true);
  };

const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (editStaff === null) return;

  try {
    await updateStaff(editStaff.id, {
      name: editStaff.name,
      phone: editStaff.phone ?? "",
      status: editStaff.status,
    });

    setRefresh((prev) => prev + 1);
    
    setEditOpen(false);
    setEditStaff(null);
  } catch (error) {
    console.error(error);
  }
};

useEffect(() => {
  const fetchStaffs = async () => {
    try {
      setLoading(true);

      const response = await getStaffs(page, 10);

      setStaffs(response.data.data.staffs);
      setTotalPages(response.data.data.pagination.totalPages);

      setError(null);
    } catch (error) {
      console.error(error);
      setError("Staff data failed to fetch.");
    } finally {
      setLoading(false);
    }
  };

  fetchStaffs();
}, [page, refresh]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}.</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Staff</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <Button onClick={() => setOpen(true)}>
            <Plus />
            Add Staff
          </Button>

          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader className="p-2 text-lg">
                <DialogTitle className="font-bold">Add Staff</DialogTitle>
              </DialogHeader>

              {/* Name */}
              <div>
                <label htmlFor="name">Name</label>

                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone">Phone</label>

                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status">Status</label>

                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-md border p-2"
                >
                  <option value="">Select Status</option>

                  <option value="Active">Active</option>

                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Submit */}
              <div className="mt-4">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Staff</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete this staff?</p>
            <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              onClick={async () => {
                if (deleteId !== null) {
                  await handleDelete(deleteId);
                  setDeleteOpen(false);
                  setDeleteId(null);
                }
              }}
            >
              Delete
            </Button>
          </DialogContent>
        </Dialog>
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            {editStaff && (
              <form onSubmit={handleUpdate}>
                <DialogHeader className="p-2 text-lg">
                  <DialogTitle className="font-bold">Edit Staff</DialogTitle>
                </DialogHeader>

                {/* Name */}
                <div>
                  <label htmlFor="edit-name">Name</label>

                  <Input
                    id="edit-name"
                    value={editStaff?.name ?? ""}
                    onChange={(e) =>
                      setEditStaff({
                        ...editStaff,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="edit-phone">Phone</label>

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

                {/* Status */}
                <div>
                  <label htmlFor="edit-status">Status</label>

                  <select
                    id="edit-status"
                    value={editStaff.status ?? ""}
                    onChange={(e) =>
                      setEditStaff({
                        ...editStaff,
                        status: e.target.value,
                      })
                    }
                    className="w-full rounded-md border p-2"
                  >
                    <option value="">Select Status</option>

                    <option value="Active">Active</option>

                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Submit */}
                <div className="mt-4">
                  <Button type="submit">Update</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {staffs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>No staff</TableCell>
              </TableRow>
            ) : (
              staffs.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>{staff.id}</TableCell>

                  <TableCell>{staff.name}</TableCell>

                  <TableCell>{staff.phone ?? "-"}</TableCell>

                  <TableCell>{staff.status ?? "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(staff)}
                      >
                        <Pencil className="mr-1 h-4 w-4" /> Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setDeleteId(staff.id);
                          setDeleteOpen(true);
                        }}
                      >
                        {" "}
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
        {totalPages > 1 && (
  <div className="mt-4 flex items-center justify-between">
    <p className="text-sm text-muted-foreground">
      Page {page} of {totalPages}
    </p>

    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={page === 1}
        onClick={() => setPage((prev) => prev - 1)}
      >
        Previous
      </Button>

      <Button
        variant="outline"
        size="sm"
        disabled={page === totalPages}
        onClick={() => setPage((prev) => prev + 1)}
      >
        Next
      </Button>
    </div>
  </div>
)}
      </div>
    </div>
  );
}
