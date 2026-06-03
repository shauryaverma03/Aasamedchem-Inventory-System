import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Tbody, Th, Td, Tr } from "@/components/ui/Table";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { Users, Shield, ShoppingBag, Store } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@/types";

export const AdminUsers = () => {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => adminApi.getUsers().then((r) => r.data),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminApi.updateUser(id, { isActive }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User updated");
    },
  });

  const roleIcon: Record<string, React.ReactNode> = {
    ADMIN: <Shield size={14} />,
    SELLER: <Store size={14} />,
    BUYER: <ShoppingBag size={14} />,
  };

  const roleBadge: Record<string, string> = {
    ADMIN: "bg-purple-100 text-purple-800",
    SELLER: "bg-blue-100 text-blue-800",
    BUYER: "bg-green-100 text-green-800",
  };

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary" /></div>;

  const users: User[] = data?.users || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Users</h1>
          <p className="text-muted-foreground mt-1">{users.length} registered users</p>
        </div>
        <div className="flex gap-3">
          {["ADMIN", "SELLER", "BUYER"].map((role) => {
            const count = users.filter((u) => u.role === role).length;
            return (
              <div key={role} className="text-center bg-white rounded-xl border border-border px-4 py-2">
                <p className="text-lg font-bold text-primary">{count}</p>
                <p className="text-xs text-muted-foreground">{role}s</p>
              </div>
            );
          })}
        </div>
      </div>

      <Card className="p-0">
        <Table>
          <Thead>
            <tr>
              <Th>User</Th>
              <Th>Role</Th>
              <Th>Products</Th>
              <Th>Orders</Th>
              <Th>Status</Th>
              <Th>Joined</Th>
              <Th>Actions</Th>
            </tr>
          </Thead>
          <Tbody>
            {users.map((u) => (
              <Tr key={u.id}>
                <Td>
                  <div>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </Td>
                <Td>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleBadge[u.role]}`}>
                    {roleIcon[u.role]} {u.role}
                  </span>
                </Td>
                <Td>{u._count?.products ?? 0}</Td>
                <Td>{u._count?.orders ?? 0}</Td>
                <Td>
                  <Badge variant={u.isActive ? "success" : "danger"}>
                    {u.isActive ? "Active" : "Inactive"}
                  </Badge>
                </Td>
                <Td>{formatDate(u.createdAt)}</Td>
                <Td>
                  <Button
                    size="sm"
                    variant={u.isActive ? "danger" : "outline"}
                    onClick={() => toggleActive.mutate({ id: u.id, isActive: !u.isActive })}
                  >
                    {u.isActive ? "Deactivate" : "Activate"}
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>
    </div>
  );
};
