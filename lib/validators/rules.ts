import { z } from "zod";

export const updateRuleSchema = z.object({
  maxLitersPerCycle: z.number().positive().max(500),
  restrictionDays: z.number().int().min(1).max(30),
  description: z.string().optional(),
});

export type UpdateRuleInput = z.infer<typeof updateRuleSchema>;
