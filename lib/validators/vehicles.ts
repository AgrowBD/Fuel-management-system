import { z } from "zod";

const nidSchema = z.string().regex(/^\d{10}$/, "NID must contain exactly 10 digits");

export const ownerLookupSchema = z.object({
  nid: nidSchema,
});

export const createVehicleSchema = z.object({
  ownerNid: nidSchema,
  licenseNumber: z.string().trim().min(1, "License number is required").max(30),
  vehicleType: z.string().trim().min(1, "Vehicle type is required"),
  make: z.string().trim().min(1, "Make is required").max(80),
  model: z.string().trim().min(1, "Model is required").max(80),
  year: z.number().int().min(1950).max(new Date().getFullYear() + 1),
  isGovernment: z.boolean().default(false),
  fuelCardNumber: z.string().trim().max(40).optional().nullable(),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;