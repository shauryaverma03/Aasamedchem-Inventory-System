import React from "react";
import { useQuery } from "@tanstack/react-query";
import { orderApi } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Tbody, Th, Td, Tr } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order } from "@/types";

export const BuyerOrders = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["buyer-orders-list"],
    queryFn: () => orderApi.getAll({ limit: 50 }).then((r) => r.data),
  });

  const orders: Order[] = data?.orders || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">My Orders</h1>
        <p className="text-muted-foreground mt-1">{orders.length} orders</p>
      </div>

      <Card className="p-0">
        {isLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary" /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg font-medium">No orders yet</p>
            <p className="text-sm mt-1">Convert a quotation to place your first order</p>
          </div>
        ) : (
          <Table>
            <Thead>
              <tr>
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
                    <p className="font-medium">{o.product?.name}</p>
                    <p className="text-xs text-muted-foreground">{o.product?.sku}</p>
                  </Td>
                  <Td>{Number(o.enteredQuantity).toFixed(2)} {o.enteredUnit}</Td>
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
