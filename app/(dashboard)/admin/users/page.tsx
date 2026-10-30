"use client";
// Admin users page: view all users by role, toggle active/inactive status.
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Topbar } from "@/components/layout/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type User = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  operatorProfile?: { pumpName: string; district: string; company?: { name: string } | null } | null;
  _count: { transactions: number };
};

type Company = { id: string; name: string };

const emptyOperator = {
  email: "",
  password: "",
  fullName: "",
  phone: "",
  tradeLicenseNo: "",
  pumpName: "",
  pumpAddress: "",
  division: "Dhaka",
  district: "Dhaka",
  companyId: "",
};

function UserTable({ users, onToggle }: { users: User[]; onToggle: (id: string, active: boolean) => void }) {
  if (users.length === 0) {
    return <p className="text-sm text-muted-foreground py-6 text-center">No users found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-2 pr-4 font-medium">Name</th>
            <th className="pb-2 pr-4 font-medium">Email</th>
            <th className="pb-2 pr-4 font-medium">Joined</th>
            <th className="pb-2 pr-4 font-medium">Info</th>
            <th className="pb-2 pr-4 font-medium">Status</th>
            <th className="pb-2 font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {users.map((u) => (
            <tr key={u.id}>
              <td className="py-2.5 pr-4 font-medium">{u.fullName}</td>
              <td className="py-2.5 pr-4 text-muted-foreground">{u.email}</td>
              <td className="py-2.5 pr-4 text-muted-foreground">{format(new Date(u.createdAt), "dd MMM yyyy")}</td>
              <td className="py-2.5 pr-4 text-muted-foreground text-xs">
                {u.operatorProfile
                  ? `${u.operatorProfile.pumpName} · ${u.operatorProfile.company?.name ?? "Unassigned"}`
                  : `${u._count.transactions} transactions`}
              </td>
              <td className="py-2.5 pr-4">
                <Badge variant={u.isActive ? "default" : "secondary"} className={u.isActive ? "bg-green-600 text-white text-xs" : "text-xs"}>
                  {u.isActive ? "Active" : "Inactive"}
                </Badge>
              </td>
              <td className="py-2.5">
                <Button
                  size="sm"
                  variant={u.isActive ? "destructive" : "outline"}
                  className="text-xs h-7"
                  onClick={() => onToggle(u.id, !u.isActive)}
                >
                  {u.isActive ? "Deactivate" : "Activate"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("VEHICLE_OWNER");
  const [companies, setCompanies] = useState<Company[]>([]);
  const [operatorForm, setOperatorForm] = useState(emptyOperator);
  const [creatingOperator, setCreatingOperator] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
    fetch("/api/admin/operators").then((res) => res.json()).then((data) => setCompanies(Array.isArray(data) ? data : []));
  }, [fetchUsers]);

  function updateOperator(field: keyof typeof emptyOperator, value: string) {
    setOperatorForm((current) => ({ ...current, [field]: value }));
  }

  async function createOperator(event: React.FormEvent) {
    event.preventDefault();
    setCreatingOperator(true);
    try {
      const res = await fetch("/api/admin/operators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(operatorForm),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Failed to create operator");
        return;
      }
      toast.success(`${data.fullName} can now sign in as an operator`);
      setOperatorForm(emptyOperator);
      fetchUsers();
    } catch {
      toast.error("Failed to create operator");
    } finally {
      setCreatingOperator(false);
    }
  }

  async function handleToggle(id: string, isActive: boolean) {
    const res = await fetch(`/api/admin/users/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    if (res.ok) {
      toast.success(`User ${isActive ? "activated" : "deactivated"}`);
      fetchUsers();
    } else {
      const err = await res.json();
      toast.error(err.error ?? "Failed to update status");
    }
  }

  const byRole = (role: string) => users.filter((u) => u.role === role);

  return (
    <div className="flex flex-col h-full">
      <Topbar title="User Management" />
      <div className="flex-1 p-4 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="VEHICLE_OWNER">Vehicle Owners ({byRole("VEHICLE_OWNER").length})</TabsTrigger>
            <TabsTrigger value="OPERATOR">Operators ({byRole("OPERATOR").length})</TabsTrigger>
            <TabsTrigger value="ADMIN">Admins ({byRole("ADMIN").length})</TabsTrigger>
          </TabsList>

          {["VEHICLE_OWNER", "OPERATOR", "ADMIN"].map((role) => (
            <TabsContent key={role} value={role}>
              {role === "OPERATOR" && (
                <Card className="mb-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Add pump operator</CardTitle>
                    <p className="text-sm text-muted-foreground">Create credentials and assign the operator&apos;s partner company and pump.</p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={createOperator} className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1.5"><Label htmlFor="operator-name">Full name</Label><Input id="operator-name" value={operatorForm.fullName} onChange={(e) => updateOperator("fullName", e.target.value)} required /></div>
                      <div className="space-y-1.5"><Label htmlFor="operator-email">Email</Label><Input id="operator-email" type="email" value={operatorForm.email} onChange={(e) => updateOperator("email", e.target.value)} required /></div>
                      <div className="space-y-1.5"><Label htmlFor="operator-password">Initial password</Label><Input id="operator-password" type="password" value={operatorForm.password} onChange={(e) => updateOperator("password", e.target.value)} minLength={8} required /></div>
                      <div className="space-y-1.5"><Label htmlFor="operator-phone">Phone</Label><Input id="operator-phone" value={operatorForm.phone} onChange={(e) => updateOperator("phone", e.target.value)} /></div>
                      <div className="space-y-1.5"><Label htmlFor="operator-company">Partner company</Label><select id="operator-company" value={operatorForm.companyId} onChange={(e) => updateOperator("companyId", e.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm" required><option value="">Select company</option>{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select></div>
                      <div className="space-y-1.5"><Label htmlFor="operator-license">Trade license</Label><Input id="operator-license" value={operatorForm.tradeLicenseNo} onChange={(e) => updateOperator("tradeLicenseNo", e.target.value)} required /></div>
                      <div className="space-y-1.5"><Label htmlFor="operator-pump">Pump name</Label><Input id="operator-pump" value={operatorForm.pumpName} onChange={(e) => updateOperator("pumpName", e.target.value)} required /></div>
                      <div className="space-y-1.5"><Label htmlFor="operator-address">Pump address</Label><Input id="operator-address" value={operatorForm.pumpAddress} onChange={(e) => updateOperator("pumpAddress", e.target.value)} required /></div>
                      <div className="space-y-1.5"><Label htmlFor="operator-division">Division</Label><Input id="operator-division" value={operatorForm.division} onChange={(e) => updateOperator("division", e.target.value)} required /></div>
                      <div className="space-y-1.5"><Label htmlFor="operator-district">District</Label><Input id="operator-district" value={operatorForm.district} onChange={(e) => updateOperator("district", e.target.value)} required /></div>
                      <Button type="submit" disabled={creatingOperator || companies.length === 0} className="md:col-span-2">{creatingOperator ? "Creating operator..." : "Create operator account"}</Button>
                    </form>
                  </CardContent>
                </Card>
              )}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {role === "VEHICLE_OWNER" ? "Vehicle Owners" : role === "OPERATOR" ? "Pump Operators" : "Administrators"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
                    </div>
                  ) : (
                    <UserTable users={byRole(role)} onToggle={handleToggle} />
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
