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

type User = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  operatorProfile?: { pumpName: string; district: string } | null;
  _count: { transactions: number };
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
                  ? `${u.operatorProfile.pumpName} · ${u.operatorProfile.district}`
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

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

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
