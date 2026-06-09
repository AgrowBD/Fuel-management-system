import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { subDays, subHours } from "date-fns";

const prisma = new PrismaClient();

const OWNER_FULL_NAME = "Rahim Uddin";

async function main() {
  console.log("🌱 Seeding database...");

  // ─── 1. BRTA reference vehicles ────────────────────────────────────────
  const brtaVehicles = [
    // Civilian
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
    // Government — ministry/department vehicles
    { licenseNumber: "GOVT-DHA-CAR-001", ownerNid: "GOVT-NID-001", ownerName: "Ministry of Finance", vehicleType: "CAR", make: "Toyota", model: "Land Cruiser", year: 2022 },
    { licenseNumber: "GOVT-DHA-CAR-002", ownerNid: "GOVT-NID-002", ownerName: "Ministry of Health", vehicleType: "CAR", make: "Mitsubishi", model: "Pajero", year: 2021 },
    { licenseNumber: "GOVT-DHA-CAR-003", ownerNid: "GOVT-NID-003", ownerName: "Ministry of Education", vehicleType: "CAR", make: "Toyota", model: "Prado", year: 2020 },
    { licenseNumber: "GOVT-DHA-MCB-001", ownerNid: "GOVT-NID-004", ownerName: "Bangladesh Police", vehicleType: "MICROBUS", make: "Toyota", model: "HiAce (Police)", year: 2021 },
    { licenseNumber: "GOVT-DHA-MCB-002", ownerNid: "GOVT-NID-005", ownerName: "Bangladesh Army", vehicleType: "MICROBUS", make: "Mitsubishi", model: "Rosa", year: 2020 },
    { licenseNumber: "GOVT-DHA-TRK-001", ownerNid: "GOVT-NID-006", ownerName: "Bangladesh Army", vehicleType: "TRUCK", make: "Tata", model: "LPT 2518", year: 2019 },
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

  // ─── 3. Distribution rules (civilian) ──────────────────────────────────
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
  console.log(`  ✓ ${rules.length} civilian distribution rules`);

  // ─── 4. Government quota rules ──────────────────────────────────────────
  const govtRules = [
    { vehicleType: "MOTORCYCLE", maxLitersPerCycle: 6, restrictionDays: 2, description: "Govt motorcycles have higher operational demand." },
    { vehicleType: "CNG_AUTO_RICKSHAW", maxLitersPerCycle: 5, restrictionDays: 1, description: "Govt CNGs used for inter-agency transport." },
    { vehicleType: "CAR", maxLitersPerCycle: 20, restrictionDays: 2, description: "Official ministerial vehicles; double civilian quota." },
    { vehicleType: "MICROBUS", maxLitersPerCycle: 30, restrictionDays: 2, description: "Govt transport vehicles for personnel movement." },
    { vehicleType: "TRUCK", maxLitersPerCycle: 40, restrictionDays: 1, description: "Military/logistics trucks; daily operations." },
    { vehicleType: "BUS", maxLitersPerCycle: 50, restrictionDays: 1, description: "Govt buses for public service; daily operations." },
  ];

  for (const r of govtRules) {
    await prisma.governmentQuotaRule.upsert({ where: { vehicleType: r.vehicleType }, update: {}, create: r });
  }
  console.log(`  ✓ ${govtRules.length} government quota rules`);

  // ─── 5. Users ────────────────────────────────────────────────────────────
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

  // ─── 6. Vehicles ─────────────────────────────────────────────────────────
  // Civilian vehicles: most have no fuel card; a handful do for demo.
  // Government vehicles: all must have a fuel card (enforced here).
  const vehicleData = [
    // Owner's vehicles
    { licenseNumber: "DHA-GA-11-1001", vehicleType: "MOTORCYCLE", make: "Bajaj", model: "Pulsar 150", year: 2019, ownerName: OWNER_FULL_NAME, isGovernment: false, fuelCardNumber: null },
    { licenseNumber: "DHA-GA-11-4001", vehicleType: "CAR", make: "Toyota", model: "Corolla", year: 2020, ownerName: OWNER_FULL_NAME, isGovernment: false, fuelCardNumber: "FC-CIV-4001" },
    { licenseNumber: "DHA-GA-11-5001", vehicleType: "MICROBUS", make: "Toyota", model: "HiAce", year: 2017, ownerName: OWNER_FULL_NAME, isGovernment: false, fuelCardNumber: null },

    // Other civilian vehicles
    { licenseNumber: "DHA-GA-11-1002", vehicleType: "MOTORCYCLE", make: "Hero", model: "Splendor Plus", year: 2020, ownerName: "Karim Hossain", isGovernment: false, fuelCardNumber: null },
    { licenseNumber: "CHA-GA-11-2001", vehicleType: "MOTORCYCLE", make: "Yamaha", model: "FZS V3", year: 2021, ownerName: "Nadia Begum", isGovernment: false, fuelCardNumber: null },
    { licenseNumber: "DHA-GA-11-3001", vehicleType: "CNG_AUTO_RICKSHAW", make: "Bajaj", model: "RE CNG", year: 2018, ownerName: "Jalal Ahmed", isGovernment: false, fuelCardNumber: null },
    { licenseNumber: "CHA-GA-11-3002", vehicleType: "CNG_AUTO_RICKSHAW", make: "TVS", model: "King CNG", year: 2017, ownerName: "Faruk Miah", isGovernment: false, fuelCardNumber: null },
    { licenseNumber: "DHA-GA-11-4002", vehicleType: "CAR", make: "Honda", model: "Civic", year: 2019, ownerName: "Monir Chowdhury", isGovernment: false, fuelCardNumber: "FC-CIV-4002" },
    { licenseNumber: "SYL-GA-11-4003", vehicleType: "CAR", make: "Suzuki", model: "Swift", year: 2022, ownerName: "Roksana Islam", isGovernment: false, fuelCardNumber: null },
    { licenseNumber: "DHA-GA-11-4004", vehicleType: "CAR", make: "Hyundai", model: "Tucson", year: 2021, ownerName: "Tanvir Rahman", isGovernment: false, fuelCardNumber: null },
    { licenseNumber: "DHA-GA-11-5002", vehicleType: "MICROBUS", make: "Mitsubishi", model: "L300", year: 2016, ownerName: "Mina Transport", isGovernment: false, fuelCardNumber: null },
    { licenseNumber: "DHA-GA-11-6001", vehicleType: "TRUCK", make: "Tata", model: "407", year: 2016, ownerName: "Selim Transport Ltd", isGovernment: false, fuelCardNumber: "FC-CIV-6001" },
    { licenseNumber: "CHA-GA-11-6002", vehicleType: "TRUCK", make: "Ashok Leyland", model: "Dost", year: 2018, ownerName: "Alam Brothers Logistics", isGovernment: false, fuelCardNumber: null },
    { licenseNumber: "DHA-GA-11-6003", vehicleType: "TRUCK", make: "Eicher", model: "Pro 1049", year: 2020, ownerName: "Rapid Cargo Ltd", isGovernment: false, fuelCardNumber: null },
    { licenseNumber: "DHA-GA-11-7001", vehicleType: "BUS", make: "Hino", model: "AK1JRKA", year: 2019, ownerName: "Green Line Paribahan", isGovernment: false, fuelCardNumber: null },
    { licenseNumber: "SYL-GA-11-7002", vehicleType: "BUS", make: "Tata", model: "LPO 1512", year: 2020, ownerName: "Ena Transport", isGovernment: false, fuelCardNumber: null },
    { licenseNumber: "DHA-GA-11-1003", vehicleType: "MOTORCYCLE", make: "Suzuki", model: "Gixxer", year: 2022, ownerName: "Salma Akter", isGovernment: false, fuelCardNumber: null },
    { licenseNumber: "DHA-GA-11-4005", vehicleType: "CAR", make: "Nissan", model: "Sunny", year: 2020, ownerName: "Shahidul Khan", isGovernment: false, fuelCardNumber: null },
    { licenseNumber: "DHA-GA-11-6004", vehicleType: "TRUCK", make: "Isuzu", model: "NPR", year: 2019, ownerName: "Anwar Logistics", isGovernment: false, fuelCardNumber: null },
    { licenseNumber: "CHA-GA-11-1004", vehicleType: "MOTORCYCLE", make: "Honda", model: "CB Hornet", year: 2021, ownerName: "Rubel Ahmed", isGovernment: false, fuelCardNumber: null },
    { licenseNumber: "DHA-GA-11-3003", vehicleType: "CNG_AUTO_RICKSHAW", make: "Bajaj", model: "RE CNG", year: 2019, ownerName: "Habib Miah", isGovernment: false, fuelCardNumber: null },
    { licenseNumber: "SYL-GA-11-5003", vehicleType: "MICROBUS", make: "Nissan", model: "Urvan", year: 2018, ownerName: "Dhaka Express", isGovernment: false, fuelCardNumber: null },

    // Government vehicles — all have mandatory fuel cards
    { licenseNumber: "GOVT-DHA-CAR-001", vehicleType: "CAR", make: "Toyota", model: "Land Cruiser", year: 2022, ownerName: "Ministry of Finance", isGovernment: true, fuelCardNumber: "FC-GOVT-0001" },
    { licenseNumber: "GOVT-DHA-CAR-002", vehicleType: "CAR", make: "Mitsubishi", model: "Pajero", year: 2021, ownerName: "Ministry of Health", isGovernment: true, fuelCardNumber: "FC-GOVT-0002" },
    { licenseNumber: "GOVT-DHA-CAR-003", vehicleType: "CAR", make: "Toyota", model: "Prado", year: 2020, ownerName: "Ministry of Education", isGovernment: true, fuelCardNumber: "FC-GOVT-0003" },
    { licenseNumber: "GOVT-DHA-MCB-001", vehicleType: "MICROBUS", make: "Toyota", model: "HiAce (Police)", year: 2021, ownerName: "Bangladesh Police", isGovernment: true, fuelCardNumber: "FC-GOVT-0004" },
    { licenseNumber: "GOVT-DHA-MCB-002", vehicleType: "MICROBUS", make: "Mitsubishi", model: "Rosa", year: 2020, ownerName: "Bangladesh Army", isGovernment: true, fuelCardNumber: "FC-GOVT-0005" },
    { licenseNumber: "GOVT-DHA-TRK-001", vehicleType: "TRUCK", make: "Tata", model: "LPT 2518", year: 2019, ownerName: "Bangladesh Army", isGovernment: true, fuelCardNumber: "FC-GOVT-0006" },
  ];

  const vehicles: { id: string; licenseNumber: string; vehicleType: string }[] = [];
  for (const v of vehicleData) {
    const vehicle = await prisma.vehicle.upsert({
      where: { licenseNumber: v.licenseNumber },
      update: { fuelCardNumber: v.fuelCardNumber, isGovernment: v.isGovernment },
      create: v,
    });
    vehicles.push(vehicle);
  }
  console.log(`  ✓ ${vehicles.length} vehicles (${vehicleData.filter(v => v.isGovernment).length} govt, ${vehicleData.filter(v => !v.isGovernment).length} civilian)`);

  const vByLicense = (license: string) => vehicles.find((v) => v.licenseNumber === license)!;

  // ─── 7. Historical transactions ─────────────────────────────────────────
  await prisma.fuelSchedule.deleteMany({});
  await prisma.fuelTransaction.deleteMany({});

  const transactionSeed = [
    // Owner's vehicles
    { vehicle: "DHA-GA-11-1001", litersRequested: 4, litersDispensed: 4, status: "APPROVED", daysAgo: 1 },
    { vehicle: "DHA-GA-11-4001", litersRequested: 10, litersDispensed: 10, status: "APPROVED", daysAgo: 5 },
    { vehicle: "DHA-GA-11-5001", litersRequested: 15, litersDispensed: 15, status: "APPROVED", daysAgo: 1 },

    // Blocked civilian
    { vehicle: "DHA-GA-11-7001", litersRequested: 30, litersDispensed: 30, status: "APPROVED", daysAgo: 1 },
    { vehicle: "CHA-GA-11-3002", litersRequested: 3, litersDispensed: 3, status: "APPROVED", daysAgo: 1 },
    { vehicle: "DHA-GA-11-4002", litersRequested: 10, litersDispensed: 10, status: "APPROVED", daysAgo: 1 },
    { vehicle: "DHA-GA-11-1003", litersRequested: 4, litersDispensed: 4, status: "APPROVED", daysAgo: 1 },
    { vehicle: "DHA-GA-11-4005", litersRequested: 10, litersDispensed: 10, status: "APPROVED", daysAgo: 2 },
    { vehicle: "DHA-GA-11-6004", litersRequested: 20, litersDispensed: 20, status: "APPROVED", daysAgo: 1 },

    // Eligible civilian
    { vehicle: "DHA-GA-11-1002", litersRequested: 4, litersDispensed: 4, status: "APPROVED", daysAgo: 4 },
    { vehicle: "DHA-GA-11-3001", litersRequested: 3, litersDispensed: 3, status: "APPROVED", daysAgo: 3 },
    { vehicle: "DHA-GA-11-4004", litersRequested: 10, litersDispensed: 10, status: "APPROVED", daysAgo: 6 },
    { vehicle: "DHA-GA-11-6001", litersRequested: 20, litersDispensed: 20, status: "APPROVED", daysAgo: 3 },
    { vehicle: "DHA-GA-11-6003", litersRequested: 20, litersDispensed: 20, status: "APPROVED", daysAgo: 4 },
    { vehicle: "SYL-GA-11-7002", litersRequested: 30, litersDispensed: 30, status: "APPROVED", daysAgo: 3 },
    { vehicle: "DHA-GA-11-3003", litersRequested: 3, litersDispensed: 3, status: "APPROVED", daysAgo: 3 },
    { vehicle: "SYL-GA-11-5003", litersRequested: 15, litersDispensed: 15, status: "APPROVED", daysAgo: 5 },

    // Government — mix of blocked and eligible (govt restriction is shorter)
    { vehicle: "GOVT-DHA-CAR-001", litersRequested: 20, litersDispensed: 20, status: "APPROVED", daysAgo: 1 },   // blocked (2-day rule, filled 1d ago)
    { vehicle: "GOVT-DHA-CAR-002", litersRequested: 20, litersDispensed: 20, status: "APPROVED", daysAgo: 3 },   // eligible (2-day rule, filled 3d ago)
    { vehicle: "GOVT-DHA-MCB-001", litersRequested: 30, litersDispensed: 30, status: "APPROVED", daysAgo: 1 },   // blocked
    { vehicle: "GOVT-DHA-TRK-001", litersRequested: 40, litersDispensed: 40, status: "APPROVED", daysAgo: 2 },  // eligible (1-day rule, filled 2d ago)
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

  // ─── 8. Upcoming schedules ───────────────────────────────────────────────
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
    { vehicle: "GOVT-DHA-CAR-001", daysUntilEligible: 1, slotIndex: 2, pump: "Padma Filling Station", district: "Dhaka" },
    { vehicle: "GOVT-DHA-MCB-001", daysUntilEligible: 1, slotIndex: 3, pump: "Padma Filling Station", district: "Dhaka" },
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
  console.log("\nGovernment vehicles + fuel cards:");
  console.log("  GOVT-DHA-CAR-001  → FC-GOVT-0001  (Ministry of Finance)");
  console.log("  GOVT-DHA-CAR-002  → FC-GOVT-0002  (Ministry of Health)");
  console.log("  GOVT-DHA-CAR-003  → FC-GOVT-0003  (Ministry of Education)");
  console.log("  GOVT-DHA-MCB-001  → FC-GOVT-0004  (Bangladesh Police)");
  console.log("  GOVT-DHA-MCB-002  → FC-GOVT-0005  (Bangladesh Army)");
  console.log("  GOVT-DHA-TRK-001  → FC-GOVT-0006  (Bangladesh Army)");
  console.log("\nCivilian vehicles with fuel cards:");
  console.log("  DHA-GA-11-4001  → FC-CIV-4001  (owner's Toyota Corolla)");
  console.log("  DHA-GA-11-4002  → FC-CIV-4002  (Monir Chowdhury's Honda Civic)");
  console.log("  DHA-GA-11-6001  → FC-CIV-6001  (Selim Transport Truck)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
