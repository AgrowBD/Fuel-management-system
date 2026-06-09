// Operator main page: fuel dispensing screen.
import { Topbar } from "@/components/layout/Topbar";
import { EligibilityChecker } from "@/components/operator/EligibilityChecker";

export default function OperatorPage() {
  return (
    <div className="flex flex-col h-full">
      <Topbar title="Dispense Fuel" />
      <div className="flex-1 p-4 md:p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Vehicle Eligibility Check</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Look up a vehicle by license plate, fuel card number, or QR scan to check eligibility and record a dispense.
          </p>
        </div>
        <EligibilityChecker />
      </div>
    </div>
  );
}
