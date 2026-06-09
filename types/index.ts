// Shared TypeScript constants and types.
// Enum values are stored as plain strings in the DB; these constants are the source of truth.

export const Role = {
  VEHICLE_OWNER: "VEHICLE_OWNER",
  OPERATOR: "OPERATOR",
  ADMIN: "ADMIN",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const VehicleType = {
  MOTORCYCLE: "MOTORCYCLE",
  CNG_AUTO_RICKSHAW: "CNG_AUTO_RICKSHAW",
  CAR: "CAR",
  MICROBUS: "MICROBUS",
  TRUCK: "TRUCK",
  BUS: "BUS",
} as const;
export type VehicleType = (typeof VehicleType)[keyof typeof VehicleType];

export const TransactionStatus = {
  APPROVED: "APPROVED",
  BLOCKED: "BLOCKED",
  PARTIAL: "PARTIAL",
} as const;
export type TransactionStatus = (typeof TransactionStatus)[keyof typeof TransactionStatus];

// Human-readable labels for vehicle types
export const VehicleTypeLabel: Record<VehicleType, string> = {
  MOTORCYCLE: "Motorcycle",
  CNG_AUTO_RICKSHAW: "CNG Auto-Rickshaw",
  CAR: "Car",
  MICROBUS: "Microbus",
  TRUCK: "Truck",
  BUS: "Bus",
};

// Result shape from the eligibility check
export type EligibilityResult =
  | { eligible: true; maxLiters: number; vehicleType: VehicleType; ownerName: string; licenseNumber: string; isGovernment: boolean; fuelCardNumber: string | null }
  | { eligible: false; reason: "IN_RESTRICTION_PERIOD"; restrictionEndsAt: Date; lastTransactionAt: Date; vehicleType: VehicleType; ownerName: string; licenseNumber: string; isGovernment: boolean; fuelCardNumber: string | null }
  | { eligible: false; reason: "VEHICLE_NOT_REGISTERED" };
