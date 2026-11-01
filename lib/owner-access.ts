import { prisma } from "@/lib/prisma";
import type { Session } from "next-auth";

export async function getSessionOwnerId(session: Session): Promise<string | null> {
  if (session.user.ownerId) return session.user.ownerId;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { ownerId: true, fullName: true },
  });

  if (user?.ownerId) return user.ownerId;

  const owner = user && await prisma.owner.findFirst({
    where: { fullName: user.fullName, isActive: true },
    select: { id: true },
  });

  return owner?.id ?? null;
}
