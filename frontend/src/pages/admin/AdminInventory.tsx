import React from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Tbody, Th, Td, Tr } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatBaseQuantity } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import type { Product } from "@/types";

export const AdminInventory = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-inventory"],
    queryFn: () => adminApi.getInventory().then((r) => r.data),
  });

  const products: Product[] = data?.products || [];
  const lowStock: Product[] = data?.lowStock || [];

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Inventory</h1>
        <p className="text-muted-foreground mt-1">{products.length} products tracked</p>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-danger mt-0.5" size={18} />
          <div>
            <p className="font-semibold text-danger">{lowStock.length} Low Stock Alert{lowStock.length > 1 ? "s" : ""}</p>
            <p className="text-sm text-red-700 mt-0.5">
              {lowStock.map((p) => p.name).join(", ")} need restocking.
            </p>
          </div>
        </div>
      )}

      <Card className="p-0">
        <Table>
          <Thead>
            <tr>
              <Th>Product</Th>
              <Th>SKU</Th>
              <Th>Category</Th>
              <Th>Seller</Th>
              <Th>Stock</Th>
              <Th>Price / Base</Th>
              <Th>Status</Th>
            </tr>
          </Thead>
          <Tbody>
            {products.map((p) => {
              const qty = Number(p.inventoryQuantity);
              const threshold = Number(p.lowStockThreshold);
              const isLow = qty <= threshold;
              return (
                <Tr key={p.id}>
                  <Td className="font-medium">{p.name}</Td>
                  <Td className="text-muted-foreground font-mono text-xs">{p.sku}</Td>
                  <Td>{p.category}</Td>
                  <Td>{(p as unknown as { seller?: { name: string } }).seller?.name}</Td>
                  <Td>
                    <p className={isLow ? "text-danger font-semibold" : ""}>{formatBaseQuantity(qty, p.baseUnit)}</p>
                  </Td>
                  <Td>{formatCurrency(p.pricePerBaseUnit)} / base unit</Td>
                  <Td>
                    <Badge variant={isLow ? "danger" : "success"}>
                      {isLow ? "Low Stock" : "In Stock"}
                    </Badge>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Card>
    </div>
  );
};
