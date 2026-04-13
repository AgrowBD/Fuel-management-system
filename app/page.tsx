// Root page: redirects to the correct dashboard based on session role,
// or to /login if not authenticated.
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  const role = session.user.role;
  if (role === "VEHICLE_OWNER") redirect("/owner");
  if (role === "OPERATOR") redirect("/operator");
  if (role === "ADMIN") redirect("/admin");

  redirect("/login");
}
