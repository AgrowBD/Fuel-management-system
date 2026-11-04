"use client";
// Login page — credentials form for all three roles.
// On success, NextAuth redirects to the role's dashboard via the callbackUrl.

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Silently wake the Neon compute the moment the login page loads,
  // so the DB is warm before the user submits credentials.
  useEffect(() => { fetch("/api/warmup").catch(() => {}); }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(data: LoginForm) {
    setLoading(true);
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      toast.error("Invalid email or password");
      setLoading(false);
      return;
    }

    // Redirect to root — middleware and root page will route to correct dashboard
    router.push("/");
    router.refresh();
  }

  return (
    <div className="editorial-canvas flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6 page-enter">
        {/* Header */}
        <div className="border-l-4 border-primary pl-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Bangladesh Petroleum Corporation</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Fuel Distribution System</h1>
          <p className="mt-2 text-sm text-muted-foreground">A controlled service for fair, traceable fuel distribution.</p>
        </div>

        <Card className="border-border/80 shadow-[0_16px_40px_rgba(20,50,35,0.08)]">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Enter your account credentials to continue</CardDescription>
          </CardHeader>
          <CardContent className="pt-1">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...register("email")}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register("password")}
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
