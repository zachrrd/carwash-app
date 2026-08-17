import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { successResponse, errorResponse } from "../utils/response";

export const getAllServices = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const [services, total] = await Promise.all([
      prisma.services.findMany({
        skip,
        take: limit,
        orderBy: {
          id: "asc",
        },
      }),

      prisma.services.count(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return successResponse(
      res,
      {
        services,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
      "Services retrieved successfully",
    );
  } catch (err) {
    next(err);
  }
};

export const getServiceById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return errorResponse(res, "Invalid service id", 400);
    }

    const service = await prisma.services.findUnique({
      where: {
        id,
      },
    });

    if (!service) {
      return errorResponse(res, "Service not found", 404);
    }

    return successResponse(res, service, "Service retrieved successfully");
  } catch (err) {
    next(err);
  }
};

export const createService = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, duration, price, status } = req.body;

    if (!name || !duration || !price) {
      return errorResponse(res, "Name, duration and price are required", 400);
    }

    const service = await prisma.services.create({
      data: {
        name,
        duration,
        price,
        status,
      },
    });

    return successResponse(res, service, "Service created successfully", 201);
  } catch (err) {
    next(err);
  }
};

export const updateService = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return errorResponse(res, "Invalid service id", 400);
    }

    const existingService = await prisma.services.findUnique({
      where: {
        id,
      },
    });

    if (!existingService) {
      return errorResponse(res, "Service not found", 404);
    }

    const { name, duration, price, status } = req.body;

    const service = await prisma.services.update({
      where: {
        id,
      },
      data: {
        name,
        duration,
        price,
        status,
      },
    });

    return successResponse(res, service, "Service updated successfully");
  } catch (err) {
    next(err);
  }
};

export const deleteService = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return errorResponse(res, "Invalid service id", 400);
    }

    const existingService = await prisma.services.findUnique({
      where: {
        id,
      },
    });

    if (!existingService) {
      return errorResponse(res, "Service not found", 404);
    }

    await prisma.services.delete({
      where: {
        id,
      },
    });

    return successResponse(res, null, "Service deleted successfully");
  } catch (err) {
    next(err);
  }
};
