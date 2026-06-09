"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import QRCode from "react-qr-code";
import { addDays, format } from "date-fns";

interface Vehicle {
  licenseNumber: string;
  vehicleType: string;
  make: string;
  model: string;
  fuelCardNumber: string;
  isGovernment: boolean;
}

// Deterministic expiry: 2 years + hash offset (0–89 days) so the same card always prints the same date
function computeExpiry(cardNumber: string): string {
  const offset = [...cardNumber].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 90;
  return format(addDays(new Date(), 365 * 2 + offset), "MM/yyyy");
}

const VEHICLE_TYPE_LABEL: Record<string, string> = {
  MOTORCYCLE: "Motorcycle",
  CNG_AUTO_RICKSHAW: "CNG Auto Rickshaw",
  CAR: "Car",
  MICROBUS: "Microbus",
  TRUCK: "Truck",
  BUS: "Bus",
};

export default function FuelCardPrintPage() {
  const [input, setInput] = useState("");
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setVehicle(null);
    try {
      const res = await fetch(
        `/api/admin/vehicles/lookup?cardNumber=${encodeURIComponent(input.trim().toUpperCase())}`
      );
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Lookup failed"); return; }
      setVehicle(data);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  const expiry = vehicle ? computeExpiry(vehicle.fuelCardNumber) : "";

  return (
    <>
      {/* Print-only: hide everything except the card */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #print-card, #print-card * { visibility: visible !important; }
          #print-card {
            position: fixed !important;
            inset: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: white !important;
          }
        }
      `}</style>

      <div className="p-6 max-w-xl">
        {/* Header row */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold mb-0.5">Fuel Card Printer</h1>
            <p className="text-sm text-muted-foreground">
              Enter a fuel card number to preview and print the physical card.
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-md border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shrink-0 ml-4"
          >
            Sign Out
          </button>
        </div>

        {/* Lookup form */}
        <form onSubmit={handleLookup} className="flex gap-2 mb-6">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="FC-GOVT-0001"
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-ring"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {loading ? "Looking up…" : "Look Up"}
          </button>
        </form>

        {error && <p className="text-sm text-destructive mb-4">{error}</p>}

        {vehicle && (
          <div className="space-y-4">
            {/* Print area */}
            <div id="print-card" className="flex items-center justify-center bg-white p-4">
              {/* Card — ISO/IEC 7810 ID-1: 85.6 × 54 mm */}
              <div
                className="relative flex overflow-hidden"
                style={{
                  width: "85.6mm",
                  height: "54mm",
                  background: "#ffffff",
                  border: "0.5mm solid #111111",
                  borderRadius: "3mm",
                  fontFamily: "'Arial', sans-serif",
                  color: "#111111",
                }}
              >
                {/* Left: QR code */}
                <div
                  style={{
                    width: "38mm",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    padding: "3mm",
                    borderRight: "0.3mm solid #dddddd",
                  }}
                >
                  <QRCode
                    value={vehicle.fuelCardNumber}
                    size={108}
                    bgColor="#ffffff"
                    fgColor="#111111"
                    style={{ display: "block" }}
                  />
                </div>

                {/* Right: Card info */}
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "3.5mm 3.5mm 3.5mm 3mm",
                  }}
                >
                  {/* Header */}
                  <div>
                    <div
                      style={{
                        fontSize: "3.8pt",
                        letterSpacing: "0.15em",
                        color: "#555",
                        textTransform: "uppercase",
                        marginBottom: "1mm",
                      }}
                    >
                      People's Republic of Bangladesh
                    </div>
                    <div style={{ fontSize: "7.5pt", fontWeight: 800, letterSpacing: "0.04em", lineHeight: 1.1 }}>
                      FUEL CARD
                    </div>
                    {vehicle.isGovernment && (
                      <div
                        style={{
                          fontSize: "4pt",
                          background: "#111",
                          color: "#fff",
                          borderRadius: "0.8mm",
                          padding: "0.6mm 1.5mm",
                          display: "inline-block",
                          marginTop: "1mm",
                          letterSpacing: "0.12em",
                        }}
                      >
                        GOVERNMENT
                      </div>
                    )}
                  </div>

                  {/* Card number */}
                  <div>
                    <div style={{ fontSize: "3pt", color: "#888", letterSpacing: "0.1em", marginBottom: "0.8mm" }}>
                      CARD NUMBER
                    </div>
                    <div style={{ fontSize: "7.5pt", fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.08em" }}>
                      {vehicle.fuelCardNumber}
                    </div>
                  </div>

                  {/* Vehicle & validity */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                      <div style={{ fontSize: "3pt", color: "#888", letterSpacing: "0.1em", marginBottom: "0.8mm" }}>
                        VEHICLE
                      </div>
                      <div style={{ fontSize: "6.5pt", fontWeight: 700, letterSpacing: "0.03em" }}>
                        {vehicle.licenseNumber}
                      </div>
                      <div style={{ fontSize: "3.8pt", color: "#555", marginTop: "0.5mm" }}>
                        {VEHICLE_TYPE_LABEL[vehicle.vehicleType] ?? vehicle.vehicleType}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "3pt", color: "#888", letterSpacing: "0.1em", marginBottom: "0.8mm" }}>
                        VALID THRU
                      </div>
                      <div style={{ fontSize: "7pt", fontWeight: 700, fontFamily: "monospace" }}>
                        {expiry}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setVehicle(null); setInput(""); }}
                className="rounded-md border px-4 py-2 text-sm"
              >
                Clear
              </button>
              <button
                onClick={() => window.print()}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              >
                Print Card
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
