import { z } from "zod";

export const createOperatorSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  fullName: z.string().trim().min(1, "Full name is required").max(100),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  tradeLicenseNo: z.string().trim().min(1, "Trade license is required").max(60),
  pumpName: z.string().trim().min(1, "Pump name is required").max(120),
  pumpAddress: z.string().trim().min(1, "Pump address is required").max(200),
  division: z.string().trim().min(1, "Division is required").max(80),
  district: z.string().trim().min(1, "District is required").max(80),
  companyId: z.string().min(1, "Partner company is required"),
});

export type CreateOperatorInput = z.infer<typeof createOperatorSchema>;
