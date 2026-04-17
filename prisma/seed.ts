import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { subDays, subHours } from "date-fns";

const prisma = new PrismaClient();

// ─── Owner account fullName — must match Vehicle.ownerName for the three
//     vehicles visible on the owner dashboard.
const OWNER_FULL_NAME = "Rahim Uddin";

async function main() {
  console.log("🌱 Seeding database...");

  // ─── 1. BRTA reference vehicles ────────────────────────────────────────
  const brtaVehicles = [
    { licenseNumber: "DHA-GA-11-1001", ownerNid: "NID-101", ownerName: OWNER_FULL_NAME, vehicleType: "MOTORCYCLE", make: "Bajaj", model: "Pulsar 150", year: 2019 },
    { licenseNumber: "DHA-GA-11-1002", ownerNid: "NID-102", ownerName: "Karim Hossain", vehicleType: "MOTORCYCLE", make: "Hero", model: "Splendor Plus", year: 2020 },
    { licenseNumber: "CHA-GA-11-2001", ownerNid: "NID-103", ownerName: "Nadia Begum", vehicleType: "MOTORCYCLE", make: "Yamaha", model: "FZS V3", year: 2021 },
    { licenseNumber: "DHA-GA-11-3001", ownerNid: "NID-201", ownerName: "Jalal Ahmed", vehicleType: "CNG_AUTO_RICKSHAW", make: "Bajaj", model: "RE CNG", year: 2018 },
    { licenseNumber: "CHA-GA-11-3002", ownerNid: "NID-202", ownerName: "Faruk Miah", vehicleType: "CNG_AUTO_RICKSHAW", make: "TVS", model: "King CNG", year: 2017 },
    { licenseNumber: "DHA-GA-11-4001", ownerNid: "NID-301", ownerName: OWNER_FULL_NAME, vehicleType: "CAR", make: "Toyota", model: "Corolla", year: 2020 },
    { licenseNumber: "DHA-GA-11-4002", ownerNid: "NID-302", ownerName: "Monir Chowdhury", vehicleType: "CAR", make: "Honda", model: "Civic", year: 2019 },
    { licenseNumber: "SYL-GA-11-4003", ownerNid: "NID-303", ownerName: "Roksana Islam", vehicleType: "CAR", make: "Suzuki", model: "Swift", year: 2022 },
    { licenseNumber: "DHA-GA-11-4004", ownerNid: "NID-304", ownerName: "Tanvir Rahman", vehicleType: "CAR", make: "Hyundai", model: "Tucson", year: 2021 },
    { licenseNumber: "DHA-GA-11-5001", ownerNid: "NID-401", ownerName: OWNER_FULL_NAME, vehicleType: "MICROBUS", make: "Toyota", model: "HiAce", year: 2017 },
    { licenseNumber: "DHA-GA-11-5002", ownerNid: "NID-402", ownerName: "Mina Transport", vehicleType: "MICROBUS", make: "Mitsubishi", model: "L300", year: 2016 },
    { licenseNumber: "DHA-GA-11-6001", ownerNid: "NID-501", ownerName: "Selim Transport Ltd", vehicleType: "TRUCK", make: "Tata", model: "407", year: 2016 },
    { licenseNumber: "CHA-GA-11-6002", ownerNid: "NID-502", ownerName: "Alam Brothers Logistics", vehicleType: "TRUCK", make: "Ashok Leyland", model: "Dost", year: 2018 },
    { licenseNumber: "DHA-GA-11-6003", ownerNid: "NID-503", ownerName: "Rapid Cargo Ltd", vehicleType: "TRUCK", make: "Eicher", model: "Pro 1049", year: 2020 },
    { licenseNumber: "DHA-GA-11-7001", ownerNid: "NID-601", ownerName: "Green Line Paribahan", vehicleType: "BUS", make: "Hino", model: "AK1JRKA", year: 2019 },
    { licenseNumber: "SYL-GA-11-7002", ownerNid: "NID-602", ownerName: "Ena Transport", vehicleType: "BUS", make: "Tata", model: "LPO 1512", year: 2020 },
    { licenseNumber: "DHA-GA-11-1003", ownerNid: "NID-104", ownerName: "Salma Akter", vehicleType: "MOTORCYCLE", make: "Suzuki", model: "Gixxer", year: 2022 },
    { licenseNumber: "DHA-GA-11-4005", ownerNid: "NID-305", ownerName: "Shahidul Khan", vehicleType: "CAR", make: "Nissan", model: "Sunny", year: 2020 },
    { licenseNumber: "DHA-GA-11-6004", ownerNid: "NID-504", ownerName: "Anwar Logistics", vehicleType: "TRUCK", make: "Isuzu", model: "NPR", year: 2019 },
    { licenseNumber: "CHA-GA-11-1004", ownerNid: "NID-105", ownerName: "Rubel Ahmed", vehicleType: "MOTORCYCLE", make: "Honda", model: "CB Hornet", year: 2021 },
    { licenseNumber: "DHA-GA-11-3003", ownerNid: "NID-203", ownerName: "Habib Miah", vehicleType: "CNG_AUTO_RICKSHAW", make: "Bajaj", model: "RE CNG", year: 2019 },
    { licenseNumber: "SYL-GA-11-5003", ownerNid: "NID-403", ownerName: "Dhaka Express", vehicleType: "MICROBUS", make: "Nissan", model: "Urvan", year: 2018 },
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

  await prisma.user.upsert({
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

  await prisma.user.upsert({
    where: { email: "owner@fuel.bd" },
    update: { fullName: OWNER_FULL_NAME },
    create: {
      email: "owner@fuel.bd",
      passwordHash: await bcrypt.hash("Owner@1234", saltRounds),
      fullName: OWNER_FULL_NAME,
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

  // ─── 5. Vehicles ─────────────────────────────────────────────────────────
  // Three vehicles are owned by the demo owner (matched via ownerName).
  // The rest exist so operators can dispense to them and admins see varied
  // activity, but they won't appear on the owner dashboard.
  const vehicleData = [
    // Owner's vehicles (shown on owner dashboard)
    { licenseNumber: "DHA-GA-11-1001", vehicleType: "MOTORCYCLE", make: "Bajaj", model: "Pulsar 150", year: 2019, ownerName: OWNER_FULL_NAME },
    { licenseNumber: "DHA-GA-11-4001", vehicleType: "CAR", make: "Toyota", model: "Corolla", year: 2020, ownerName: OWNER_FULL_NAME },
    { licenseNumber: "DHA-GA-11-5001", vehicleType: "MICROBUS", make: "Toyota", model: "HiAce", year: 2017, ownerName: OWNER_FULL_NAME },

    // Other vehicles (for operator/admin views)
    { licenseNumber: "DHA-GA-11-1002", vehicleType: "MOTORCYCLE", make: "Hero", model: "Splendor Plus", year: 2020, ownerName: "Karim Hossain" },
    { licenseNumber: "CHA-GA-11-2001", vehicleType: "MOTORCYCLE", make: "Yamaha", model: "FZS V3", year: 2021, ownerName: "Nadia Begum" },
    { licenseNumber: "DHA-GA-11-3001", vehicleType: "CNG_AUTO_RICKSHAW", make: "Bajaj", model: "RE CNG", year: 2018, ownerName: "Jalal Ahmed" },
    { licenseNumber: "CHA-GA-11-3002", vehicleType: "CNG_AUTO_RICKSHAW", make: "TVS", model: "King CNG", year: 2017, ownerName: "Faruk Miah" },
    { licenseNumber: "DHA-GA-11-4002", vehicleType: "CAR", make: "Honda", model: "Civic", year: 2019, ownerName: "Monir Chowdhury" },
    { licenseNumber: "SYL-GA-11-4003", vehicleType: "CAR", make: "Suzuki", model: "Swift", year: 2022, ownerName: "Roksana Islam" },
    { licenseNumber: "DHA-GA-11-4004", vehicleType: "CAR", make: "Hyundai", model: "Tucson", year: 2021, ownerName: "Tanvir Rahman" },
    { licenseNumber: "DHA-GA-11-5002", vehicleType: "MICROBUS", make: "Mitsubishi", model: "L300", year: 2016, ownerName: "Mina Transport" },
    { licenseNumber: "DHA-GA-11-6001", vehicleType: "TRUCK", make: "Tata", model: "407", year: 2016, ownerName: "Selim Transport Ltd" },
    { licenseNumber: "CHA-GA-11-6002", vehicleType: "TRUCK", make: "Ashok Leyland", model: "Dost", year: 2018, ownerName: "Alam Brothers Logistics" },
    { licenseNumber: "DHA-GA-11-6003", vehicleType: "TRUCK", make: "Eicher", model: "Pro 1049", year: 2020, ownerName: "Rapid Cargo Ltd" },
    { licenseNumber: "DHA-GA-11-7001", vehicleType: "BUS", make: "Hino", model: "AK1JRKA", year: 2019, ownerName: "Green Line Paribahan" },
    { licenseNumber: "SYL-GA-11-7002", vehicleType: "BUS", make: "Tata", model: "LPO 1512", year: 2020, ownerName: "Ena Transport" },
    { licenseNumber: "DHA-GA-11-1003", vehicleType: "MOTORCYCLE", make: "Suzuki", model: "Gixxer", year: 2022, ownerName: "Salma Akter" },
    { licenseNumber: "DHA-GA-11-4005", vehicleType: "CAR", make: "Nissan", model: "Sunny", year: 2020, ownerName: "Shahidul Khan" },
    { licenseNumber: "DHA-GA-11-6004", vehicleType: "TRUCK", make: "Isuzu", model: "NPR", year: 2019, ownerName: "Anwar Logistics" },
    { licenseNumber: "CHA-GA-11-1004", vehicleType: "MOTORCYCLE", make: "Honda", model: "CB Hornet", year: 2021, ownerName: "Rubel Ahmed" },
    { licenseNumber: "DHA-GA-11-3003", vehicleType: "CNG_AUTO_RICKSHAW", make: "Bajaj", model: "RE CNG", year: 2019, ownerName: "Habib Miah" },
    { licenseNumber: "SYL-GA-11-5003", vehicleType: "MICROBUS", make: "Nissan", model: "Urvan", year: 2018, ownerName: "Dhaka Express" },
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

  const vByLicense = (license: string) => vehicles.find((v) => v.licenseNumber === license)!;

  // ─── 6. Historical transactions ─────────────────────────────────────────
  // Wipe old transactions + schedules first so eligibility states are predictable.
  await prisma.fuelSchedule.deleteMany({});
  await prisma.fuelTransaction.deleteMany({});

  // Day-one eligibility states (motorcycle=4L/3d, CNG=3L/2d, car=10L/3d,
  // microbus=15L/3d, truck=20L/2d, bus=30L/2d):
  //
  //   BLOCKED (full-cap fill within the restriction window):
  //     DHA-GA-11-1001 — motorcycle, 1 day ago
  //     DHA-GA-11-5001 — microbus, 1 day ago
  //     DHA-GA-11-7001 — bus, 1 day ago
  //     CHA-GA-11-3002 — CNG, 1 day ago
  //     DHA-GA-11-4002 — car, 1 day ago
  //     DHA-GA-11-1003 — motorcycle, 1 day ago
  //     DHA-GA-11-4005 — car, 2 days ago
  //     DHA-GA-11-6004 — truck, 1 day ago
  //
  //   ELIGIBLE (no recent fill or fill outside the window):
  //     DHA-GA-11-4001 — car, last fill 5 days ago
  //     DHA-GA-11-1002 — motorcycle, last fill 4 days ago
  //     CHA-GA-11-2001 — motorcycle, no history
  //     DHA-GA-11-3001 — CNG, last fill 3 days ago
  //     SYL-GA-11-4003 — car, no history
  //     DHA-GA-11-4004 — car, last fill 6 days ago
  //     DHA-GA-11-5002 — microbus, no history
  //     DHA-GA-11-6001 — truck, last fill 3 days ago
  //     CHA-GA-11-6002 — truck, no history
  //     DHA-GA-11-6003 — truck, last fill 4 days ago
  //     SYL-GA-11-7002 — bus, last fill 3 days ago
  //     CHA-GA-11-1004 — motorcycle, no history
  //     DHA-GA-11-3003 — CNG, last fill 3 days ago
  //     SYL-GA-11-5003 — microbus, last fill 5 days ago

  const transactionSeed = [
    // Owner's vehicles
    { vehicle: "DHA-GA-11-1001", litersRequested: 4, litersDispensed: 4, status: "APPROVED", daysAgo: 1 },
    { vehicle: "DHA-GA-11-4001", litersRequested: 10, litersDispensed: 10, status: "APPROVED", daysAgo: 5 },
    { vehicle: "DHA-GA-11-5001", litersRequested: 15, litersDispensed: 15, status: "APPROVED", daysAgo: 1 },

    // Blocked (full-cap fill within restriction window)
    { vehicle: "DHA-GA-11-7001", litersRequested: 30, litersDispensed: 30, status: "APPROVED", daysAgo: 1 },
    { vehicle: "CHA-GA-11-3002", litersRequested: 3, litersDispensed: 3, status: "APPROVED", daysAgo: 1 },
    { vehicle: "DHA-GA-11-4002", litersRequested: 10, litersDispensed: 10, status: "APPROVED", daysAgo: 1 },

    // Additional blocked
    { vehicle: "DHA-GA-11-1003", litersRequested: 4, litersDispensed: 4, status: "APPROVED", daysAgo: 1 },
    { vehicle: "DHA-GA-11-4005", litersRequested: 10, litersDispensed: 10, status: "APPROVED", daysAgo: 2 },
    { vehicle: "DHA-GA-11-6004", litersRequested: 20, litersDispensed: 20, status: "APPROVED", daysAgo: 1 },

    // Eligible — last fill clearly outside the restriction window
    { vehicle: "DHA-GA-11-1002", litersRequested: 4, litersDispensed: 4, status: "APPROVED", daysAgo: 4 },
    { vehicle: "DHA-GA-11-3001", litersRequested: 3, litersDispensed: 3, status: "APPROVED", daysAgo: 3 },
    { vehicle: "DHA-GA-11-4004", litersRequested: 10, litersDispensed: 10, status: "APPROVED", daysAgo: 6 },
    { vehicle: "DHA-GA-11-6001", litersRequested: 20, litersDispensed: 20, status: "APPROVED", daysAgo: 3 },
    { vehicle: "DHA-GA-11-6003", litersRequested: 20, litersDispensed: 20, status: "APPROVED", daysAgo: 4 },
    { vehicle: "SYL-GA-11-7002", litersRequested: 30, litersDispensed: 30, status: "APPROVED", daysAgo: 3 },
    { vehicle: "DHA-GA-11-3003", litersRequested: 3, litersDispensed: 3, status: "APPROVED", daysAgo: 3 },
    { vehicle: "SYL-GA-11-5003", litersRequested: 15, litersDispensed: 15, status: "APPROVED", daysAgo: 5 },
  ];

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

  // ─── 7. Upcoming schedules for currently-blocked vehicles ────────────────
  const timeSlots = ["08:00-09:00", "09:00-10:00", "10:00-11:00", "11:00-12:00", "14:00-15:00", "15:00-16:00"];

  const scheduleSeed = [
    { vehicle: "DHA-GA-11-1001", daysUntilEligible: 2, slotIndex: 0, pump: "Padma Filling Station", district: "Dhaka" },
    { vehicle: "DHA-GA-11-5001", daysUntilEligible: 2, slotIndex: 1, pump: "Padma Filling Station", district: "Dhaka" },
    { vehicle: "DHA-GA-11-7001", daysUntilEligible: 1, slotIndex: 2, pump: "Padma Filling Station", district: "Dhaka" },
    { vehicle: "CHA-GA-11-3002", daysUntilEligible: 1, slotIndex: 3, pump: "Meghna Fuel Center", district: "Gazipur" },
    { vehicle: "DHA-GA-11-4002", daysUntilEligible: 2, slotIndex: 4, pump: "Padma Filling Station", district: "Dhaka" },
    { vehicle: "DHA-GA-11-1003", daysUntilEligible: 2, slotIndex: 5, pump: "Padma Filling Station", district: "Dhaka" },
    { vehicle: "DHA-GA-11-4005", daysUntilEligible: 1, slotIndex: 0, pump: "Padma Filling Station", district: "Dhaka" },
    { vehicle: "DHA-GA-11-6004", daysUntilEligible: 1, slotIndex: 1, pump: "Meghna Fuel Center", district: "Gazipur" },
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
  console.log("\nDay-one states:");
  console.log("  BLOCKED (8): DHA-GA-11-1001, DHA-GA-11-5001, DHA-GA-11-7001, CHA-GA-11-3002, DHA-GA-11-4002,");
  console.log("               DHA-GA-11-1003, DHA-GA-11-4005, DHA-GA-11-6004");
  console.log("  ELIGIBLE (14): DHA-GA-11-4001, DHA-GA-11-1002, CHA-GA-11-2001, DHA-GA-11-3001, SYL-GA-11-4003,");
  console.log("                 DHA-GA-11-4004, DHA-GA-11-5002, DHA-GA-11-6001, CHA-GA-11-6002, DHA-GA-11-6003,");
  console.log("                 SYL-GA-11-7002, CHA-GA-11-1004, DHA-GA-11-3003, SYL-GA-11-5003");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
