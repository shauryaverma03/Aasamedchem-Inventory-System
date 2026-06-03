import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Tbody, Th, Td, Tr } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { formatCurrency, formatDate, formatBaseQuantity } from "@/lib/utils";
import type { Order } from "@/types";
import { toast } from "sonner";

export const AdminOrders = () => {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", statusFilter],
    queryFn: () => orderApi.getAll({ status: statusFilter || undefined, limit: 100 }).then((r) => r.data),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status, adminNotes }: { id: string; status: string; adminNotes?: string }) =>
      orderApi.updateStatus(id, { status, adminNotes }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      setSelected(null);
      toast.success("Order status updated");
    },
    onError: () => toast.error("Failed to update order"),
  });

  const orders: Order[] = data?.orders || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Orders</h1>
          <p className="text-muted-foreground mt-1">{orders.length} orders</p>
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: "", label: "All Statuses" },
            { value: "PENDING", label: "Pending" },
            { value: "APPROVED", label: "Approved" },
            { value: "REJECTED", label: "Rejected" },
            { value: "COMPLETED", label: "Completed" },
          ]}
          className="w-44"
        />
      </div>

      <Card className="p-0">
        {isLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary" /></div>
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Buyer</Th>
                <Th>Product</Th>
                <Th>Quantity</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
                <Th>Date</Th>
                <Th>Actions</Th>
              </tr>
            </Thead>
            <Tbody>
              {orders.map((o) => (
                <Tr key={o.id}>
                  <Td><p className="font-medium">{o.buyer?.name}</p><p className="text-xs text-muted-foreground">{o.buyer?.email}</p></Td>
                  <Td><p className="font-medium">{o.product?.name}</p><p className="text-xs text-muted-foreground">{o.product?.sku}</p></Td>
                  <Td>
                    {Number(o.enteredQuantity).toFixed(2)} {o.enteredUnit}
                    <p className="text-xs text-muted-foreground">{formatBaseQuantity(Number(o.convertedQuantityBase), o.product?.baseUnit || "COUNT")}</p>
                  </Td>
                  <Td className="font-semibold">{formatCurrency(o.totalAmount)}</Td>
                  <Td><StatusBadge status={o.status} /></Td>
                  <Td>{formatDate(o.createdAt)}</Td>
                  <Td>
                    <Button size="sm" variant="outline" onClick={() => { setSelected(o); setNewStatus(o.status); setAdminNotes(o.adminNotes || ""); }}>
                      Update
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Update Order Status">
        <div className="space-y-4">
          <Select
            label="Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={[
              { value: "PENDING", label: "Pending" },
              { value: "APPROVED", label: "Approved" },
              { value: "REJECTED", label: "Rejected" },
              { value: "COMPLETED", label: "Completed" },
            ]}
          />
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Admin Notes</label>
            <textarea
              className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
              rows={3}
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Optional notes..."
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => setSelected(null)}>Cancel</Button>
            <Button
              variant="gradient"
              loading={updateStatus.isPending}
              onClick={() => selected && updateStatus.mutate({ id: selected.id, status: newStatus, adminNotes })}
            >
              Update Status
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
