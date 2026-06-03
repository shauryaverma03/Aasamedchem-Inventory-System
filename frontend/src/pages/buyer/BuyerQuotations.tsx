import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quotationApi } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Tbody, Th, Td, Tr } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Quotation } from "@/types";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export const BuyerQuotations = () => {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["buyer-quotations"],
    queryFn: () => quotationApi.getAll({ limit: 50 }).then((r) => r.data),
  });

  const convert = useMutation({
    mutationFn: (id: string) => quotationApi.convert(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["buyer-quotations"] });
      qc.invalidateQueries({ queryKey: ["buyer-orders"] });
      toast.success("Quotation converted to order!");
    },
    onError: () => toast.error("Failed to convert quotation"),
  });

  const quotations: Quotation[] = data?.quotations || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">My Quotations</h1>
        <p className="text-muted-foreground mt-1">{quotations.length} quotations</p>
      </div>

      <Card className="p-0">
        {isLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary" /></div>
        ) : quotations.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg font-medium">No quotations yet</p>
            <p className="text-sm mt-1">Browse products and request a quotation</p>
          </div>
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Product</Th>
                <Th>Quantity</Th>
                <Th>Converted</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
                <Th>Date</Th>
                <Th>Action</Th>
              </tr>
            </Thead>
            <Tbody>
              {quotations.map((q) => (
                <Tr key={q.id}>
                  <Td>
                    <p className="font-medium">{q.product?.name}</p>
                    <p className="text-xs text-muted-foreground">{q.product?.sku}</p>
                  </Td>
                  <Td>{Number(q.enteredQuantity).toFixed(2)} {q.enteredUnit}</Td>
                  <Td className="text-muted-foreground text-sm">{Number(q.convertedQuantityBase).toFixed(2)} base</Td>
                  <Td className="font-semibold">{formatCurrency(q.calculatedAmount)}</Td>
                  <Td><StatusBadge status={q.status} /></Td>
                  <Td>{formatDate(q.createdAt)}</Td>
                  <Td>
                    {q.status === "PENDING" && (
                      <Button
                        size="sm"
                        variant="gradient"
                        loading={convert.isPending}
                        onClick={() => { if (confirm("Convert this quotation to an order?")) convert.mutate(q.id); }}
                      >
                        <ShoppingCart size={14} className="mr-1" /> Order
                      </Button>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>
    </div>
  );
};
