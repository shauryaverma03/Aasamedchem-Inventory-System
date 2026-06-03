import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { quotationApi } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Tbody, Th, Td, Tr } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatDate, formatBaseQuantity, getUnitsForBaseType } from "@/lib/utils";
import type { Quotation } from "@/types";
import { ArrowRight, Info } from "lucide-react";

export const AdminQuotations = () => {
  const [detail, setDetail] = useState<Quotation | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-quotations"],
    queryFn: () => quotationApi.getAll({ limit: 100 }).then((r) => r.data),
  });

  const quotations: Quotation[] = data?.quotations || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Quotations</h1>
        <p className="text-muted-foreground mt-1">{quotations.length} quotations — showing unit conversions and pricing</p>
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
                <Th>Ordered</Th>
                <Th>→ Stored As</Th>
                <Th>Price Breakdown</Th>
                <Th>Status</Th>
                <Th>Date</Th>
                <Th>{" "}</Th>
              </tr>
            </Thead>
            <Tbody>
              {quotations.map((q) => {
                const baseUnit = q.product ? getUnitsForBaseType(q.product.baseUnit)[0] : "unit";
                const pricePerBase = q.product ? parseFloat(String(q.product.pricePerBaseUnit)) : 0;
                const baseQty = parseFloat(String(q.convertedQuantityBase));
                return (
                  <Tr key={q.id}>
                    <Td>
                      <p className="font-medium">{q.buyer?.name}</p>
                      <p className="text-xs text-muted-foreground">{q.buyer?.email}</p>
                    </Td>
                    <Td>
                      <p className="font-medium">{q.product?.name}</p>
                      <p className="text-xs text-muted-foreground">{q.product?.sku}</p>
                    </Td>
                    <Td>
                      <span className="font-semibold">{Number(q.enteredQuantity).toFixed(3)}</span>
                      <span className="text-muted-foreground text-sm ml-1">{q.enteredUnit}</span>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        <ArrowRight size={12} className="text-muted-foreground" />
                        <span className="font-semibold text-accent">{baseQty.toFixed(3)}</span>
                        <span className="text-muted-foreground text-sm">{baseUnit}</span>
                      </div>
                    </Td>
                    <Td>
                      <p className="font-bold text-primary">{formatCurrency(q.calculatedAmount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {baseQty.toFixed(2)} {baseUnit} × {formatCurrency(pricePerBase)}
                      </p>
                    </Td>
                    <Td><StatusBadge status={q.status} /></Td>
                    <Td>{formatDate(q.createdAt)}</Td>
                    <Td>
                      <button onClick={() => setDetail(q)} className="text-secondary hover:text-secondary/70 transition p-1">
                        <Info size={16} />
                      </button>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        )}
      </Card>

      {/* Detail Modal */}
      <Modal isOpen={!!detail} onClose={() => setDetail(null)} title="Quotation Details">
        {detail && (() => {
          const baseUnit = detail.product ? getUnitsForBaseType(detail.product.baseUnit)[0] : "unit";
          const pricePerBase = detail.product ? parseFloat(String(detail.product.pricePerBaseUnit)) : 0;
          const baseQty = parseFloat(String(detail.convertedQuantityBase));
          const enteredQty = parseFloat(String(detail.enteredQuantity));
          return (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Buyer</p>
                  <p className="font-semibold">{detail.buyer?.name}</p>
                  <p className="text-xs text-muted-foreground">{detail.buyer?.email}</p>
                </div>
                <div className="bg-muted rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">Product</p>
                  <p className="font-semibold">{detail.product?.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{detail.product?.sku}</p>
                </div>
              </div>

              {/* Unit conversion breakdown */}
              <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-4">
                <p className="text-sm font-semibold text-secondary mb-3">Unit Conversion Breakdown</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity ordered by buyer</span>
                    <span className="font-bold">{enteredQty.toFixed(3)} {detail.enteredUnit}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Converted to base unit ({baseUnit})</span>
                    <span className="font-bold text-accent">{baseQty.toFixed(6)} {baseUnit}</span>
                  </div>
                  <div className="border-t border-secondary/20 pt-2 flex justify-between">
                    <span className="text-muted-foreground">Rate</span>
                    <span>{formatCurrency(pricePerBase)} / {baseUnit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Calculation</span>
                    <span className="font-mono text-xs">{baseQty.toFixed(3)} × {formatCurrency(pricePerBase)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-primary border-t border-secondary/20 pt-2">
                    <span>Total</span>
                    <span>{formatCurrency(detail.calculatedAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Status: <StatusBadge status={detail.status} /></span>
                <span>Created: {formatDate(detail.createdAt)}</span>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};
