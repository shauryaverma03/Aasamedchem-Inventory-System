import React from "react";
import { useQuery } from "@tanstack/react-query";
import { quotationApi } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Tbody, Th, Td, Tr } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Quotation } from "@/types";

export const AdminQuotations = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-quotations"],
    queryFn: () => quotationApi.getAll({ limit: 100 }).then((r) => r.data),
  });

  const quotations: Quotation[] = data?.quotations || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Quotations</h1>
        <p className="text-muted-foreground mt-1">{quotations.length} quotations</p>
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
              </tr>
            </Thead>
            <Tbody>
              {quotations.map((q) => (
                <Tr key={q.id}>
                  <Td><p className="font-medium">{q.buyer?.name}</p><p className="text-xs text-muted-foreground">{q.buyer?.email}</p></Td>
                  <Td><p className="font-medium">{q.product?.name}</p><p className="text-xs text-muted-foreground">{q.product?.sku}</p></Td>
                  <Td>{Number(q.enteredQuantity).toFixed(2)} {q.enteredUnit}</Td>
                  <Td className="font-semibold">{formatCurrency(q.calculatedAmount)}</Td>
                  <Td><StatusBadge status={q.status} /></Td>
                  <Td>{formatDate(q.createdAt)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>
    </div>
  );
};
