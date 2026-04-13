"use client";
// Main operator form: license number input → eligibility check → dispense confirmation.
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EligibilityResult } from "@/components/operator/EligibilityResult";
import type { EligibilityResult as EligibilityResultType } from "@/types";

const checkSchema = z.object({
  licenseNumber: z.string().min(1, "Enter a license number"),
});
type CheckForm = z.infer<typeof checkSchema>;

export function EligibilityChecker() {
  const [eligibility, setEligibility] = useState<EligibilityResultType | null>(null);
  const [checking, setChecking] = useState(false);
  const [dispensing, setDispensing] = useState(false);
  const [liters, setLiters] = useState<string>("");
  const [lastLicense, setLastLicense] = useState("");

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CheckForm>({
    resolver: zodResolver(checkSchema),
  });

  async function onCheck(data: CheckForm) {
    setChecking(true);
    setEligibility(null);
    try {
      const res = await fetch("/api/operator/eligibility-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseNumber: data.licenseNumber }),
      });
      const result = await res.json();
      setEligibility(result);
      setLastLicense(data.licenseNumber);
      setLiters(result.eligible ? String(result.maxLiters) : "");
    } catch {
      toast.error("Failed to check eligibility");
    } finally {
      setChecking(false);
    }
  }

  async function onDispense() {
    const litersNum = parseFloat(liters);
    if (!litersNum || litersNum <= 0) {
      toast.error("Enter a valid liters amount");
      return;
    }
    setDispensing(true);
    try {
      const res = await fetch("/api/operator/dispense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ licenseNumber: lastLicense, litersDispensed: litersNum }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error ?? "Dispense failed");
        return;
      }
      toast.success(`Dispensed ${result.litersDispensed}L — Transaction recorded`);
      reset();
      setEligibility(null);
      setLiters("");
      setLastLicense("");
    } catch {
      toast.error("Failed to dispense fuel");
    } finally {
      setDispensing(false);
    }
  }

  return (
    <div className="space-y-6 w-full max-w-lg">
      {/* License number lookup */}
      <form onSubmit={handleSubmit(onCheck)} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="licenseNumber">Vehicle License Number</Label>
          <div className="flex gap-2">
            <Input
              id="licenseNumber"
              placeholder="e.g. DHA-GA-11-1001"
              className="uppercase"
              {...register("licenseNumber")}
            />
            <Button type="submit" disabled={checking} className="shrink-0">
              {checking ? "Checking…" : "Check"}
            </Button>
          </div>
          {errors.licenseNumber && (
            <p className="text-xs text-destructive">{errors.licenseNumber.message}</p>
          )}
        </div>
      </form>

      {/* Eligibility result card */}
      {eligibility && (
        <EligibilityResult
          result={eligibility}
          liters={liters}
          onLitersChange={setLiters}
          onDispense={onDispense}
          dispensing={dispensing}
        />
      )}
    </div>
  );
}
