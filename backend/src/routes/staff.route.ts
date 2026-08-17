import { Router } from "express";

import {
    getAllStaffs,
    getStaffById,
    createStaff,
    updateStaff,
    deleteStaff,
} from "../controllers/staff.controller";

import { authenticateToken } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.get("/",authenticateToken, authorizeRoles("Admin", "Cashier"), getAllStaffs);
router.get("/:id",authenticateToken, authorizeRoles("Admin", "Cashier"), getStaffById);
router.post("/",authenticateToken, authorizeRoles("Admin"), createStaff);
router.put("/:id",authenticateToken, authorizeRoles("Admin"), updateStaff);
router.delete("/:id",authenticateToken, authorizeRoles("Admin"), deleteStaff);

export default router;