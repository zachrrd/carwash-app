import { Router } from "express";

import {
    getAllServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
} from "../controllers/service.controller";

import { authenticateToken } from "../middlewares/auth.middleware";
import { authorizeRoles } from "../middlewares/role.middleware";

const router = Router();

router.get("/",authenticateToken, authorizeRoles("Admin", "Cashier"), getAllServices);
router.get("/:id",authenticateToken, authorizeRoles("Admin", "Cashier"), getServiceById);
router.post("/",authenticateToken, authorizeRoles("Admin"), createService);
router.put("/:id",authenticateToken, authorizeRoles("Admin"), updateService);
router.delete("/:id",authenticateToken, authorizeRoles("Admin"), deleteService);

export default router;