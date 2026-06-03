import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi, quotationApi } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Tbody, Th, Td, Tr } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatBaseQuantity, getUnitsForBaseType, toBaseUnit } from "@/lib/utils";
import type { Product } from "@/types";
import { Search, FileText, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

export const BuyerProducts = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Product | null>(null);
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("");
  const [preview, setPreview] = useState<{ base: number; price: number } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["buyer-browse-products", search, page],
    queryFn: () => productApi.getAll({ search: search || undefined, page, limit: 15 }).then((r) => r.data),
  });

  const createQuotation = useMutation({
    mutationFn: (data: object) => quotationApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["buyer-quotations"] });
      setSelected(null);
      toast.success("Quotation created! View in My Quotations.");
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || "Failed to create quotation");
    },
  });

  const openQuote = (p: Product) => {
    setSelected(p);
    const units = getUnitsForBaseType(p.baseUnit);
    setUnit(units[0]);
    setQty("");
    setPreview(null);
  };

  const handleQtyChange = (value: string) => {
    setQty(value);
    if (value && selected) {
      const base = toBaseUnit(parseFloat(value), unit, selected.baseUnit);
      const price = base * parseFloat(String(selected.pricePerBaseUnit));
      setPreview({ base, price });
    } else {
      setPreview(null);
    }
  };

  const handleUnitChange = (newUnit: string) => {
    setUnit(newUnit);
    if (qty && selected) {
      const base = toBaseUnit(parseFloat(qty), newUnit, selected.baseUnit);
      const price = base * parseFloat(String(selected.pricePerBaseUnit));
      setPreview({ base, price });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !qty || !unit) return;
    createQuotation.mutate({ productId: selected.id, enteredQuantity: parseFloat(qty), enteredUnit: unit });
  };

  const products: Product[] = data?.products || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Browse Products</h1>
        <p className="text-muted-foreground mt-1">Find products and request quotations</p>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-secondary/40"
          placeholder="Search products..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <Card className="p-0">
        {isLoading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary" /></div>
        ) : (
          <>
            <Table>
              <Thead>
                <tr>
                  <Th>Product</Th>
                  <Th>Category</Th>
                  <Th>Seller</Th>
                  <Th>Unit Type</Th>
                  <Th>Price / Base</Th>
                  <Th>Availability</Th>
                  <Th>Action</Th>
                </tr>
              </Thead>
              <Tbody>
                {products.map((p) => (
                  <Tr key={p.id}>
                    <Td>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.sku}</p>
                    </Td>
                    <Td><Badge>{p.category}</Badge></Td>
                    <Td className="text-sm">{p.seller?.name}</Td>
                    <Td><Badge variant="info">{p.baseUnit}</Badge></Td>
                    <Td className="font-semibold">{formatCurrency(p.pricePerBaseUnit)}</Td>
                    <Td>
                      <p className="text-sm">{formatBaseQuantity(Number(p.inventoryQuantity), p.baseUnit)}</p>
                    </Td>
                    <Td>
                      <Button size="sm" variant="gradient" onClick={() => openQuote(p)}>
                        <FileText size={14} className="mr-1" /> Quote
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
                  <Button size="sm" variant="outline" disabled={page === pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Quotation Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Request Quotation">
        {selected && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="bg-muted rounded-xl p-4">
              <p className="font-semibold text-primary">{selected.name}</p>
              <p className="text-sm text-muted-foreground">{selected.sku} · {selected.category}</p>
              <p className="text-sm font-medium mt-1">{formatCurrency(selected.pricePerBaseUnit)} per base unit ({selected.baseUnit})</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Quantity"
                type="number"
                step="0.001"
                min="0.001"
                placeholder="Enter quantity"
                value={qty}
                onChange={(e) => handleQtyChange(e.target.value)}
                required
              />
              <Select
                label="Unit"
                value={unit}
                onChange={(e) => handleUnitChange(e.target.value)}
                options={getUnitsForBaseType(selected.baseUnit).map((u) => ({ value: u, label: u }))}
              />
            </div>

            {preview && (
              <div className="bg-secondary/10 border border-secondary/20 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-secondary">Price Preview</p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Converted quantity</span>
                  <span className="font-medium">{formatBaseQuantity(preview.base, selected.baseUnit)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Estimated price</span>
                  <span className="font-bold text-primary text-lg">{formatCurrency(preview.price)}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <Button type="button" variant="ghost" onClick={() => setSelected(null)}>Cancel</Button>
              <Button type="submit" variant="gradient" loading={createQuotation.isPending} disabled={!preview}>
                <FileText size={14} className="mr-2" /> Create Quotation
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
