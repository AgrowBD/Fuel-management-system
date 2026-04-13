"use client";
// NextAuth SessionProvider must be a Client Component wrapper
// so that useSession() works in child client components.
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
