"use client";
// Operator vehicle lookup: auto-detect toggle + three manual input methods.
// Auto Detect ON  → PlateScanner (camera OCR) → lookup by plate
// Auto Detect OFF → Tab 1: Manual license plate
//                   Tab 2: Fuel card number
//                   Tab 3: QR code scan (reads fuel card number)
// All paths resolve via GET /api/operator/lookup and feed into the same dispense flow.
import { useState, useCallback, lazy, Suspense } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EligibilityResult } from "@/components/operator/EligibilityResult";
import type { EligibilityResult as EligibilityResultType } from "@/types";

const QrScanner = lazy(() =>
  import("@/components/operator/QrScanner").then((m) => ({ default: m.QrScanner }))
);

const PlateScanner = lazy(() =>
  import("@/components/operator/PlateScanner").then((m) => ({ default: m.PlateScanner }))
);

type InputMode = "plate" | "card" | "qr";

export function EligibilityChecker() {
  const [autoDetect, setAutoDetect] = useState(false);
  const [mode, setMode] = useState<InputMode>("plate");
  const [plateInput, setPlateInput] = useState("");
  const [cardInput, setCardInput] = useState("");
  const [eligibility, setEligibility] = useState<EligibilityResultType | null>(null);
  const [resolvedLicense, setResolvedLicense] = useState("");
  const [checking, setChecking] = useState(false);
  const [dispensing, setDispensing] = useState(false);
  const [liters, setLiters] = useState("");
  const [qrActive, setQrActive] = useState(false);

  async function lookup(query: { plate?: string; cardNumber?: string }) {
    setChecking(true);
    setEligibility(null);
    try {
      const params = new URLSearchParams();
      if (query.plate) params.set("plate", query.plate);
      if (query.cardNumber) params.set("cardNumber", query.cardNumber);
      const res = await fetch(`/api/operator/lookup?${params}`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Vehicle not found");
        return;
      }
      setEligibility(data.eligibility);
      setResolvedLicense(data.vehicle.licenseNumber);
      setLiters(data.eligibility.eligible ? String(data.eligibility.maxLiters) : "");
    } catch {
      toast.error("Lookup failed");
    } finally {
      setChecking(false);
    }
  }

  // QrScanner fires exactly once (firedRef gate + self-stop inside the scanner)
  const onQrResult = useCallback((value: string) => {
    setQrActive(false);
    setCardInput(value);
    lookup({ cardNumber: value });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        body: JSON.stringify({ licenseNumber: resolvedLicense, litersDispensed: litersNum }),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error ?? "Dispense failed");
        return;
      }
      toast.success(`Dispensed ${result.litersDispensed}L — Transaction recorded`);
      reset();
    } catch {
      toast.error("Failed to dispense fuel");
    } finally {
      setDispensing(false);
    }
  }

  function reset() {
    setEligibility(null);
    setResolvedLicense("");
    setLiters("");
    setPlateInput("");
    setCardInput("");
    setQrActive(false);
  }

  function toggleAutoDetect() {
    reset();
    setAutoDetect((v) => !v);
  }

  const tabs: { id: InputMode; label: string }[] = [
    { id: "plate", label: "License Plate" },
    { id: "card", label: "Fuel Card No." },
    { id: "qr", label: "QR Scan" },
  ];

  return (
    <div className="space-y-5 w-full max-w-lg">

      {/* ── Auto Detect toggle ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between rounded-xl border bg-muted/30 px-4 py-3">
        <div>
          <p className="text-sm font-semibold leading-tight">Auto Detect</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {autoDetect ? "Camera reads license plate automatically" : "Use manual plate, card, or QR entry"}
          </p>
        </div>
        {/* iOS-style toggle switch */}
        <button
          type="button"
          role="switch"
          aria-checked={autoDetect}
          onClick={toggleAutoDetect}
          className={`relative ml-4 inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            autoDetect ? "bg-primary" : "bg-input"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-lg ring-0 transition-transform ${
              autoDetect ? "translate-x-7" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* ── Auto Detect mode: PlateScanner ─────────────────────────────── */}
      {autoDetect && !eligibility && !checking && (
        <Suspense fallback={<div className="h-52 rounded-lg bg-muted animate-pulse" />}>
          <PlateScanner onResult={(plate) => { setPlateInput(plate); lookup({ plate }); }} />
        </Suspense>
      )}

      {autoDetect && checking && (
        <p className="text-sm text-muted-foreground text-center py-4">Looking up vehicle…</p>
      )}

      {/* ── Manual mode: three tabs ─────────────────────────────────────── */}
      {!autoDetect && (
        <>
          <div className="flex gap-1 border rounded-lg p-1 bg-muted w-fit">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setMode(tab.id); reset(); }}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  mode === tab.id
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* License plate input */}
          {mode === "plate" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="plateInput">Vehicle License Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="plateInput"
                    placeholder="e.g. DHA-GA-11-1001"
                    className="uppercase"
                    value={plateInput}
                    onChange={(e) => setPlateInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && plateInput && lookup({ plate: plateInput })}
                  />
                  <Button
                    onClick={() => lookup({ plate: plateInput })}
                    disabled={checking || !plateInput}
                    className="shrink-0"
                  >
                    {checking ? "Checking…" : "Check"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Fuel card number input */}
          {mode === "card" && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="cardInput">Fuel Card Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="cardInput"
                    placeholder="e.g. FC-GOVT-0001"
                    className="uppercase"
                    value={cardInput}
                    onChange={(e) => setCardInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && cardInput && lookup({ cardNumber: cardInput })}
                  />
                  <Button
                    onClick={() => lookup({ cardNumber: cardInput })}
                    disabled={checking || !cardInput}
                    className="shrink-0"
                  >
                    {checking ? "Checking…" : "Check"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* QR code scanner */}
          {mode === "qr" && (
            <div className="space-y-3">
              {!qrActive && !eligibility && (
                <Button onClick={() => setQrActive(true)} className="w-full">
                  Start Camera / Scan QR
                </Button>
              )}
              {qrActive && (
                <div className="space-y-2">
                  <Suspense fallback={<div className="h-48 rounded-md bg-muted animate-pulse" />}>
                    <QrScanner onResult={onQrResult} onError={(e) => toast.error(`Camera error: ${e}`)} />
                  </Suspense>
                  <p className="text-xs text-center text-muted-foreground">
                    Point camera at the QR code on the fuel card
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setQrActive(false)} className="w-full">
                    Cancel
                  </Button>
                </div>
              )}
              {checking && (
                <p className="text-sm text-muted-foreground text-center">Looking up vehicle…</p>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Eligibility result + dispense (shared by all modes) ─────────── */}
      {eligibility && (
        <div className="space-y-3">
          <EligibilityResult
            result={eligibility}
            liters={liters}
            onLitersChange={setLiters}
            onDispense={onDispense}
            dispensing={dispensing}
          />
          <Button variant="outline" size="sm" onClick={reset} className="w-full">
            Clear / New Vehicle
          </Button>
        </div>
      )}
    </div>
  );
}
