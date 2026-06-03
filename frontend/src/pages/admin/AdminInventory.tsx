import React from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Tbody, Th, Td, Tr } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency, formatBaseQuantity } from "@/lib/utils";
import { AlertTriangle, Package, TrendingDown, CheckCircle2, Layers } from "lucide-react";
import type { Product } from "@/types";

export const AdminInventory = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-inventory"],
    queryFn: () => adminApi.getInventory().then((r) => r.data),
  });

  const products: Product[] = data?.products || [];
  const lowStock: Product[] = data?.lowStock || [];

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary" />
    </div>
  );

  const inStock = products.length - lowStock.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Inventory</h1>
        <p className="text-muted-foreground mt-1">{products.length} products tracked across all sellers</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-border p-5 flex items-center gap-4 shadow-card">
          <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center">
            <Layers size={20} className="text-secondary" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">{products.length}</p>
            <p className="text-sm text-muted-foreground">Total Products</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-emerald-200 p-5 flex items-center gap-4 shadow-card">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">{inStock}</p>
            <p className="text-sm text-muted-foreground">In Stock</p>
          </div>
        </div>
        <div className={`bg-white rounded-2xl border p-5 flex items-center gap-4 shadow-card ${lowStock.length > 0 ? "border-red-200" : "border-border"}`}>
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${lowStock.length > 0 ? "bg-red-50" : "bg-muted"}`}>
            <TrendingDown size={20} className={lowStock.length > 0 ? "text-danger" : "text-muted-foreground"} />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">{lowStock.length}</p>
            <p className="text-sm text-muted-foreground">Low Stock</p>
          </div>
        </div>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle size={16} className="text-danger" />
          </div>
          <div>
            <p className="font-bold text-danger">{lowStock.length} Low Stock Alert{lowStock.length > 1 ? "s" : ""}</p>
            <p className="text-sm text-red-700 mt-0.5">{lowStock.map((p) => p.name).join(", ")} — need restocking soon.</p>
          </div>
        </div>
      )}

      <Card className="p-0">
        {products.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No products in inventory</p>
          </div>
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Product</Th>
                <Th>SKU</Th>
                <Th>Category</Th>
                <Th>Seller</Th>
                <Th>Stock</Th>
                <Th>Price / Base Unit</Th>
                <Th>Status</Th>
              </tr>
            </Thead>
            <Tbody>
              {products.map((p) => {
                const qty = Number(p.inventoryQuantity);
                const threshold = Number(p.lowStockThreshold);
                const isLow = qty <= threshold;
                const pct = Math.min(100, Math.round((qty / (threshold * 3)) * 100));
                return (
                  <Tr key={p.id}>
                    <Td>
                      <p className="font-semibold">{p.name}</p>
                      {p.description && <p className="text-xs text-muted-foreground truncate max-w-[160px]">{p.description}</p>}
                    </Td>
                    <Td className="text-muted-foreground font-mono text-xs">{p.sku}</Td>
                    <Td><Badge>{p.category}</Badge></Td>
                    <Td className="text-sm">{(p as unknown as { seller?: { name: string } }).seller?.name}</Td>
                    <Td>
                      <p className={`font-semibold text-sm ${isLow ? "text-danger" : "text-gray-900"}`}>{formatBaseQuantity(qty, p.baseUnit)}</p>
                      <div className="mt-1.5 w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${isLow ? "bg-danger" : "bg-success"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </Td>
                    <Td className="font-semibold text-sm">{formatCurrency(p.pricePerBaseUnit)}</Td>
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
        )}
      </Card>
    </div>
  );
};
