import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { subDays, subHours } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── 1. BRTA reference vehicles ────────────────────────────────────────
  const brtaVehicles = [
    { licenseNumber: "DHA-GA-11-1001", ownerNid: "NID-101", ownerName: "Rahim Uddin", vehicleType: "MOTORCYCLE", make: "Bajaj", model: "Pulsar 150", year: 2019 },
    { licenseNumber: "DHA-GA-11-1002", ownerNid: "NID-102", ownerName: "Karim Hossain", vehicleType: "MOTORCYCLE", make: "Hero", model: "Splendor Plus", year: 2020 },
    { licenseNumber: "CHA-GA-11-2001", ownerNid: "NID-103", ownerName: "Nadia Begum", vehicleType: "MOTORCYCLE", make: "Yamaha", model: "FZS V3", year: 2021 },
    { licenseNumber: "DHA-GA-11-3001", ownerNid: "NID-201", ownerName: "Jalal Ahmed", vehicleType: "CNG_AUTO_RICKSHAW", make: "Bajaj", model: "RE CNG", year: 2018 },
    { licenseNumber: "CHA-GA-11-3002", ownerNid: "NID-202", ownerName: "Faruk Miah", vehicleType: "CNG_AUTO_RICKSHAW", make: "TVS", model: "King CNG", year: 2017 },
    { licenseNumber: "DHA-GA-11-4001", ownerNid: "NID-301", ownerName: "Dr. Shirin Akter", vehicleType: "CAR", make: "Toyota", model: "Corolla", year: 2020 },
    { licenseNumber: "DHA-GA-11-4002", ownerNid: "NID-302", ownerName: "Monir Chowdhury", vehicleType: "CAR", make: "Honda", model: "Civic", year: 2019 },
    { licenseNumber: "SYL-GA-11-4003", ownerNid: "NID-303", ownerName: "Roksana Islam", vehicleType: "CAR", make: "Suzuki", model: "Swift", year: 2022 },
    { licenseNumber: "DHA-GA-11-5001", ownerNid: "NID-401", ownerName: "Hasan Mahmud", vehicleType: "MICROBUS", make: "Toyota", model: "HiAce", year: 2017 },
    { licenseNumber: "DHA-GA-11-5002", ownerNid: "NID-402", ownerName: "Mina Transport", vehicleType: "MICROBUS", make: "Mitsubishi", model: "L300", year: 2016 },
    { licenseNumber: "DHA-GA-11-6001", ownerNid: "NID-501", ownerName: "Selim Transport Ltd", vehicleType: "TRUCK", make: "Tata", model: "407", year: 2016 },
    { licenseNumber: "CHA-GA-11-6002", ownerNid: "NID-502", ownerName: "Alam Brothers Logistics", vehicleType: "TRUCK", make: "Ashok Leyland", model: "Dost", year: 2018 },
    { licenseNumber: "DHA-GA-11-7001", ownerNid: "NID-601", ownerName: "Green Line Paribahan", vehicleType: "BUS", make: "Hino", model: "AK1JRKA", year: 2019 },
    { licenseNumber: "SYL-GA-11-7002", ownerNid: "NID-602", ownerName: "Ena Transport", vehicleType: "BUS", make: "Tata", model: "LPO 1512", year: 2020 },
  ];

  for (const v of brtaVehicles) {
    await prisma.brtaVehicle.upsert({ where: { licenseNumber: v.licenseNumber }, update: {}, create: v });
  }
  console.log(`  ✓ ${brtaVehicles.length} BRTA vehicles`);

  // ─── 2. Pump registry ───────────────────────────────────────────────────
  const pumps = [
    { tradeLicenseNo: "TL-2020-00101", pumpName: "Padma Filling Station", ownerName: "Abdur Rahman", division: "Dhaka", district: "Dhaka", address: "Mirpur 10, Dhaka" },
    { tradeLicenseNo: "TL-2019-00205", pumpName: "Meghna Fuel Center", ownerName: "Jahanara Khatun", division: "Dhaka", district: "Gazipur", address: "Tongi, Gazipur" },
    { tradeLicenseNo: "TL-2021-00312", pumpName: "Surma Petroleum", ownerName: "Kamal Uddin", division: "Sylhet", district: "Sylhet", address: "Zindabazar, Sylhet" },
    { tradeLicenseNo: "TL-2018-00418", pumpName: "Karnaphuli Filling Station", ownerName: "Rina Begum", division: "Chattogram", district: "Chattogram", address: "Agrabad, Chattogram" },
    { tradeLicenseNo: "TL-2022-00521", pumpName: "Buriganga Petro Point", ownerName: "Shahidul Islam", division: "Dhaka", district: "Narayanganj", address: "Fatullah, Narayanganj" },
  ];

  for (const p of pumps) {
    await prisma.pumpRegistry.upsert({ where: { tradeLicenseNo: p.tradeLicenseNo }, update: {}, create: p });
  }
  console.log(`  ✓ ${pumps.length} pump registry entries`);

  // ─── 3. Distribution rules ──────────────────────────────────────────────
  const rules = [
    { vehicleType: "MOTORCYCLE", maxLitersPerCycle: 4, restrictionDays: 3, description: "4L covers typical urban daily commute for 3 days." },
    { vehicleType: "CNG_AUTO_RICKSHAW", maxLitersPerCycle: 3, restrictionDays: 2, description: "CNGs are commercial; higher frequency needed." },
    { vehicleType: "CAR", maxLitersPerCycle: 10, restrictionDays: 3, description: "10L is roughly 100–120km range." },
    { vehicleType: "MICROBUS", maxLitersPerCycle: 15, restrictionDays: 3, description: "Larger commercial use; more volume, same frequency as cars." },
    { vehicleType: "TRUCK", maxLitersPerCycle: 20, restrictionDays: 2, description: "Commercial goods transport; critical to keep moving." },
    { vehicleType: "BUS", maxLitersPerCycle: 30, restrictionDays: 2, description: "Public transport; highest priority and volume." },
  ];

  for (const r of rules) {
    await prisma.distributionRule.upsert({ where: { vehicleType: r.vehicleType }, update: {}, create: r });
  }
  console.log(`  ✓ ${rules.length} distribution rules`);

  // ─── 4. Users ────────────────────────────────────────────────────────────
  const saltRounds = 12;

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@fuel.bd" },
    update: {},
    create: {
      email: "admin@fuel.bd",
      passwordHash: await bcrypt.hash("Admin@1234", saltRounds),
      fullName: "BPC Administrator",
      phone: "01700000001",
      role: "ADMIN",
    },
  });

  const ownerUser = await prisma.user.upsert({
    where: { email: "owner@fuel.bd" },
    update: {},
    create: {
      email: "owner@fuel.bd",
      passwordHash: await bcrypt.hash("Owner@1234", saltRounds),
      fullName: "Rahim Uddin",
      phone: "01700000002",
      role: "VEHICLE_OWNER",
    },
  });

  const operatorUser = await prisma.user.upsert({
    where: { email: "operator@fuel.bd" },
    update: {},
    create: {
      email: "operator@fuel.bd",
      passwordHash: await bcrypt.hash("Operator@1234", saltRounds),
      fullName: "Pump Operator (Padma)",
      phone: "01700000003",
      role: "OPERATOR",
    },
  });

  // Operator profile linked to Padma Filling Station
  await prisma.operatorProfile.upsert({
    where: { userId: operatorUser.id },
    update: {},
    create: {
      userId: operatorUser.id,
      tradeLicenseNo: "TL-2020-00101",
      pumpName: "Padma Filling Station",
      pumpAddress: "Mirpur 10, Dhaka",
      division: "Dhaka",
      district: "Dhaka",
    },
  });

  console.log("  ✓ 3 users (admin, owner, operator)");

  // ─── 5. Vehicles (pre-seeded, linked to owner account conceptually) ─────
  const vehicleData = [
    { licenseNumber: "DHA-GA-11-1001", vehicleType: "MOTORCYCLE", make: "Bajaj", model: "Pulsar 150", year: 2019, ownerName: "Rahim Uddin" },
    { licenseNumber: "DHA-GA-11-4001", vehicleType: "CAR", make: "Toyota", model: "Corolla", year: 2020, ownerName: "Dr. Shirin Akter" },
    { licenseNumber: "DHA-GA-11-3001", vehicleType: "CNG_AUTO_RICKSHAW", make: "Bajaj", model: "RE CNG", year: 2018, ownerName: "Jalal Ahmed" },
    { licenseNumber: "DHA-GA-11-5001", vehicleType: "MICROBUS", make: "Toyota", model: "HiAce", year: 2017, ownerName: "Hasan Mahmud" },
    { licenseNumber: "DHA-GA-11-6001", vehicleType: "TRUCK", make: "Tata", model: "407", year: 2016, ownerName: "Selim Transport Ltd" },
    { licenseNumber: "DHA-GA-11-7001", vehicleType: "BUS", make: "Hino", model: "AK1JRKA", year: 2019, ownerName: "Green Line Paribahan" },
  ];

  const vehicles: { id: string; licenseNumber: string; vehicleType: string }[] = [];
  for (const v of vehicleData) {
    const vehicle = await prisma.vehicle.upsert({
      where: { licenseNumber: v.licenseNumber },
      update: {},
      create: v,
    });
    vehicles.push(vehicle);
  }
  console.log(`  ✓ ${vehicles.length} vehicles`);

  // Helper to find vehicle by license
  const vByLicense = (license: string) => vehicles.find((v) => v.licenseNumber === license)!;

  // ─── 6. Historical transactions ─────────────────────────────────────────
  // Motorcycle: fuelled 1 day ago → IN RESTRICTION (3-day window)
  // Car: fuelled 5 days ago → ELIGIBLE (3-day restriction passed)
  // CNG: fuelled 3 days ago → just became eligible
  // Microbus: fuelled 10 days ago → ELIGIBLE
  // Truck: no recent transaction → ELIGIBLE
  // Bus: fuelled 1 day ago → IN RESTRICTION (2-day window)

  const transactionSeed = [
    // Motorcycle — restricted (fuelled 1 day ago)
    { vehicle: "DHA-GA-11-1001", litersRequested: 4, litersDispensed: 4, status: "APPROVED", daysAgo: 1 },
    { vehicle: "DHA-GA-11-1001", litersRequested: 4, litersDispensed: 4, status: "APPROVED", daysAgo: 5 },
    { vehicle: "DHA-GA-11-1001", litersRequested: 4, litersDispensed: 4, status: "APPROVED", daysAgo: 9 },

    // Car — eligible (last fill 5 days ago)
    { vehicle: "DHA-GA-11-4001", litersRequested: 10, litersDispensed: 10, status: "APPROVED", daysAgo: 5 },
    { vehicle: "DHA-GA-11-4001", litersRequested: 12, litersDispensed: 10, status: "PARTIAL", daysAgo: 9 },
    { vehicle: "DHA-GA-11-4001", litersRequested: 10, litersDispensed: 10, status: "APPROVED", daysAgo: 13 },

    // CNG — just became eligible (last fill 2 days ago, restriction is 2 days)
    { vehicle: "DHA-GA-11-3001", litersRequested: 3, litersDispensed: 3, status: "APPROVED", daysAgo: 2 },
    { vehicle: "DHA-GA-11-3001", litersRequested: 3, litersDispensed: 3, status: "APPROVED", daysAgo: 5 },

    // Microbus — eligible (last fill 10 days ago)
    { vehicle: "DHA-GA-11-5001", litersRequested: 15, litersDispensed: 15, status: "APPROVED", daysAgo: 10 },
    { vehicle: "DHA-GA-11-5001", litersRequested: 15, litersDispensed: 15, status: "APPROVED", daysAgo: 14 },

    // Truck — eligible (no recent, last fill 8 days ago)
    { vehicle: "DHA-GA-11-6001", litersRequested: 20, litersDispensed: 20, status: "APPROVED", daysAgo: 8 },
    { vehicle: "DHA-GA-11-6001", litersRequested: 20, litersDispensed: 20, status: "APPROVED", daysAgo: 12 },

    // Bus — restricted (fuelled 1 day ago, 2-day restriction)
    { vehicle: "DHA-GA-11-7001", litersRequested: 30, litersDispensed: 30, status: "APPROVED", daysAgo: 1 },
    { vehicle: "DHA-GA-11-7001", litersRequested: 30, litersDispensed: 30, status: "APPROVED", daysAgo: 4 },
  ];

  // Clear existing transactions and schedules before re-seeding to stay idempotent
  await prisma.fuelSchedule.deleteMany({});
  await prisma.fuelTransaction.deleteMany({});

  for (const t of transactionSeed) {
    const vehicle = vByLicense(t.vehicle);
    await prisma.fuelTransaction.create({
      data: {
        vehicleId: vehicle.id,
        operatorId: operatorUser.id,
        litersRequested: t.litersRequested,
        litersDispensed: t.litersDispensed,
        status: t.status,
        pumpName: "Padma Filling Station",
        pumpDistrict: "Dhaka",
        transactedAt: subHours(subDays(new Date(), t.daysAgo), 2),
      },
    });
  }
  console.log(`  ✓ ${transactionSeed.length} historical transactions`);

  // ─── 7. Upcoming schedules ───────────────────────────────────────────────
  // Create schedules for vehicles currently in restriction period
  const timeSlots = ["08:00-09:00", "09:00-10:00", "10:00-11:00", "11:00-12:00", "14:00-15:00", "15:00-16:00"];

  const scheduleSeed = [
    // Motorcycle restricted 1 day ago, 3-day rule → eligible in 2 more days
    { vehicle: "DHA-GA-11-1001", daysUntilEligible: 2, slotIndex: 0, pump: "Padma Filling Station", district: "Dhaka" },
    // Bus restricted 1 day ago, 2-day rule → eligible tomorrow
    { vehicle: "DHA-GA-11-7001", daysUntilEligible: 1, slotIndex: 2, pump: "Padma Filling Station", district: "Dhaka" },
    // Car — eligible, schedule a future one
    { vehicle: "DHA-GA-11-4001", daysUntilEligible: 0, slotIndex: 4, pump: "Meghna Fuel Center", district: "Gazipur" },
  ];

  for (const s of scheduleSeed) {
    const vehicle = vByLicense(s.vehicle);
    const scheduledDate = subDays(new Date(), -s.daysUntilEligible);
    scheduledDate.setHours(8, 0, 0, 0);
    await prisma.fuelSchedule.create({
      data: {
        vehicleId: vehicle.id,
        pumpName: s.pump,
        pumpDistrict: s.district,
        scheduledDate,
        timeSlot: timeSlots[s.slotIndex],
      },
    });
  }
  console.log(`  ✓ ${scheduleSeed.length} upcoming schedules`);

  console.log("\n✅ Seeding complete!");
  console.log("\nLogin credentials:");
  console.log("  Admin:    admin@fuel.bd      / Admin@1234");
  console.log("  Owner:    owner@fuel.bd      / Owner@1234");
  console.log("  Operator: operator@fuel.bd   / Operator@1234");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
