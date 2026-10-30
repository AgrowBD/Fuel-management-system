import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createOperatorSchema } from "@/lib/validators/operators";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const companies = await prisma.fuelCompany.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return NextResponse.json(companies);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = createOperatorSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const input = parsed.data;
  const company = await prisma.fuelCompany.findFirst({ where: { id: input.companyId, isActive: true } });
  if (!company) return NextResponse.json({ error: "Partner company not found" }, { status: 404 });

  try {
    const user = await prisma.user.create({
      data: {
        email: input.email.trim().toLowerCase(),
        passwordHash: await bcrypt.hash(input.password, 12),
        fullName: input.fullName.trim(),
        phone: input.phone?.trim() || null,
        role: "OPERATOR",
        operatorProfile: {
          create: {
            tradeLicenseNo: input.tradeLicenseNo.trim(),
            pumpName: input.pumpName.trim(),
            pumpAddress: input.pumpAddress.trim(),
            division: input.division.trim(),
            district: input.district.trim(),
            companyId: company.id,
          },
        },
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        isActive: true,
        operatorProfile: { select: { pumpName: true, company: { select: { name: true } } } },
      },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Email or trade license already exists" }, { status: 409 });
    }
    throw error;
  }
}
