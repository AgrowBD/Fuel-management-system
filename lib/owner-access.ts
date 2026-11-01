import { prisma } from "@/lib/prisma";
import type { Session } from "next-auth";

export async function getSessionOwnerId(session: Session): Promise<string | null> {
  if (session.user.ownerId) return session.user.ownerId;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { ownerId: true },
  });

  return user?.ownerId ?? null;
}
