import { z } from "zod";

export const eligibilityCheckSchema = z.object({
  licenseNumber: z.string().min(1, "License number is required"),
});

export const dispenseSchema = z.object({
  licenseNumber: z.string().min(1, "License number is required"),
  litersDispensed: z
    .number()
    .positive("Must be greater than 0")
    .max(200, "Unrealistic value"),
});

export type EligibilityCheckInput = z.infer<typeof eligibilityCheckSchema>;
export type DispenseInput = z.infer<typeof dispenseSchema>;
