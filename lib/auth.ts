import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/types";

// Extend NextAuth types to include role and id on the session user
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      ownerId?: string | null;
    };
  }
  interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
    ownerId?: string | null;
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    ownerId?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.isActive) return null;

          const passwordMatch = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!passwordMatch) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.fullName,
            role: user.role as Role,
            ownerId: user.ownerId,
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    // Persist role and id into the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.ownerId = user.ownerId;
      } else if (token.role === "VEHICLE_OWNER" && token.id && !token.ownerId) {
        const owner = await prisma.user.findUnique({
          where: { id: token.id },
          select: { ownerId: true },
        });
        token.ownerId = owner?.ownerId;
      }
      return token;
    },
    // Expose id and role on the session object available to client components
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.ownerId = token.ownerId;
      return session;
    },
  },
};
