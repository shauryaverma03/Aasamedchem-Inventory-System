import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { orderApi } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Tbody, Th, Td, Tr } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { formatCurrency, formatDate, formatBaseQuantity } from "@/lib/utils";
import type { Order } from "@/types";
import { ShoppingCart } from "lucide-react";

export const SellerOrders = () => {
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["seller-orders-list", statusFilter],
    queryFn: () => orderApi.getAll({ status: statusFilter || undefined, limit: 100 }).then((r) => r.data),
  });

  const orders: Order[] = data?.orders || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Orders</h1>
          <p className="text-muted-foreground mt-1">{orders.length} orders for your products</p>
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
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No orders yet</p>
            <p className="text-sm mt-1">Orders for your products will appear here</p>
          </div>
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Buyer</Th>
                <Th>Product</Th>
                <Th>Quantity</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
                <Th>Admin Notes</Th>
                <Th>Date</Th>
              </tr>
            </Thead>
            <Tbody>
              {orders.map((o) => (
                <Tr key={o.id}>
                  <Td>
                    <p className="font-medium">{o.buyer?.name}</p>
                    <p className="text-xs text-muted-foreground">{o.buyer?.email}</p>
                  </Td>
                  <Td>
                    <p className="font-medium">{o.product?.name}</p>
                    <p className="text-xs text-muted-foreground">{o.product?.sku}</p>
                  </Td>
                  <Td>
                    <p>{Number(o.enteredQuantity).toFixed(2)} {o.enteredUnit}</p>
                    <p className="text-xs text-muted-foreground">{formatBaseQuantity(Number(o.convertedQuantityBase), o.product?.baseUnit || "COUNT")}</p>
                  </Td>
                  <Td className="font-semibold">{formatCurrency(o.totalAmount)}</Td>
                  <Td><StatusBadge status={o.status} /></Td>
                  <Td className="text-sm text-muted-foreground">{o.adminNotes || "—"}</Td>
                  <Td>{formatDate(o.createdAt)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>
    </div>
  );
};
