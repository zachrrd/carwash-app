import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { successResponse, errorResponse } from "../utils/response";

export const getAllVehicles = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const vehicles = await prisma.vehicles.findMany({
      skip,
      take: limit,
      include: {
        customers: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    const total = await prisma.vehicles.count();

    const totalPages = Math.ceil(total / limit);

    return successResponse(
      res,
      {
        vehicles,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
      "Vehicles retrieved successfully",
    );
  } catch (err) {
    next(err);
  }
};

export const getVehicleById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return errorResponse(res, "Invalid vehicle id", 400);
    }

    const vehicle = await prisma.vehicles.findUnique({
      where: {
        id,
      },
      include: {
        customers: true,
      },
    });

    if (!vehicle) {
      return errorResponse(res, "Vehicle not found", 404);
    }

    return successResponse(res, vehicle, "Vehicle retrieved successfully");
  } catch (err) {
    next(err);
  }
};

export const createVehicle = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { plate_number, brand, model, customer_id } = req.body;

    if (!plate_number || !brand || !model || !customer_id) {
      return errorResponse(res, "All fields are required", 400);
    }

    const customer = await prisma.customers.findUnique({
      where: {
        id: Number(customer_id),
      },
    });

    if (!customer) {
      return errorResponse(res, "Customer not found", 404);
    }

    const vehicle = await prisma.vehicles.create({
      data: {
        plate_number,
        brand,
        model,
        customers: {
          connect: {
            id: Number(customer_id),
          },
        },
      },
      include: {
        customers: true,
      },
    });

    return successResponse(res, vehicle, "Vehicle created successfully", 201);
  } catch (err) {
    next(err);
  }
};

export const updateVehicle = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return errorResponse(res, "Invalid vehicle id", 400);
    }

    const existingVehicle = await prisma.vehicles.findUnique({
      where: {
        id,
      },
    });

    if (!existingVehicle) {
      return errorResponse(res, "Vehicle not found", 404);
    }

    const { plate_number, brand, model, customer_id } = req.body;

    const customer = await prisma.customers.findUnique({
      where: {
        id: Number(customer_id),
      },
    });

    if (!customer) {
      return errorResponse(res, "Customer not found", 404);
    }

    const vehicle = await prisma.vehicles.update({
      where: {
        id,
      },
      data: {
        plate_number,
        brand,
        model,
        customers: {
          connect: {
            id: Number(customer_id),
          },
        },
      },
      include: {
        customers: true,
      },
    });

    return successResponse(res, vehicle, "Vehicle updated successfully");
  } catch (err) {
    next(err);
  }
};

export const deleteVehicle = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return errorResponse(res, "Invalid vehicle id", 400);
    }

    const existingVehicle = await prisma.vehicles.findUnique({
      where: {
        id,
      },
    });

    if (!existingVehicle) {
      return errorResponse(res, "Vehicle not found", 404);
    }

    await prisma.vehicles.delete({
      where: {
        id,
      },
    });

    return successResponse(res, null, "Vehicle deleted successfully");
  } catch (err) {
    next(err);
  }
};
