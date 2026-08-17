import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { successResponse, errorResponse } from "../utils/response";

export const getAllCustomers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const customers = await prisma.customers.findMany({
      skip,
      take: limit,
      include: {
        vehicles: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    const total = await prisma.customers.count();

    const totalPages = Math.ceil(total / limit);

    return successResponse(
      res,
      {
        customers,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
      "Customers retrieved successfully",
    );
  } catch (err) {
    next(err);
  }
};

export const getCustomerById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return errorResponse(res, "Invalid customer id", 400);
    }

    const customer = await prisma.customers.findUnique({
      where: { id },
      include: {
        vehicles: true,
      },
    });

    if (!customer) {
      return errorResponse(res, "Customer not found", 404);
    }

    return successResponse(res, customer);
  } catch (err) {
    next(err);
  }
};

export const createCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return errorResponse(res, "Name and phone are required", 400);
    }

    const customer = await prisma.customers.create({
      data: {
        name,
        phone,
      },
    });

    return successResponse(res, customer, "Customer created successfully", 201);
  } catch (err) {
    next(err);
  }
};

export const updateCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return errorResponse(res, "Invalid customer id", 400);
    }

    const { name, phone } = req.body;

    const existingCustomer = await prisma.customers.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      return errorResponse(res, "Customer not found", 404);
    }

    const customer = await prisma.customers.update({
      where: { id },
      data: {
        name,
        phone,
      },
    });

    return successResponse(res, customer, "Customer updated successfully");
  } catch (err) {
    next(err);
  }
};

export const deleteCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return errorResponse(res, "Invalid customer id", 400);
    }

    const existingCustomer = await prisma.customers.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      return errorResponse(res, "Customer not found", 404);
    }

    await prisma.customers.delete({
      where: { id },
    });

    return successResponse(res, null, "Customer deleted successfully");
  } catch (err) {
    next(err);
  }
};
