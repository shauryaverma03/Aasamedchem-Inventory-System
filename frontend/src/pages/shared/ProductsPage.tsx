import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Table, Thead, Tbody, Th, Td, Tr } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatBaseQuantity, getUnitsForBaseType } from "@/lib/utils";
import type { Product } from "@/types";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

const emptyForm = {
  name: "", sku: "", description: "", category: "", baseUnit: "WEIGHT",
  inventoryQuantity: "", pricePerBaseUnit: "", lowStockThreshold: "1000",
};

export const ProductsPage = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const canManage = user?.role === "ADMIN" || user?.role === "SELLER";

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const { data, isLoading } = useQuery({
    queryKey: ["products", search, page],
    queryFn: () => productApi.getAll({ search: search || undefined, page, limit: 15 }).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: object) => productApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); setModalOpen(false); toast.success("Product created"); },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || "Failed to create product");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: object }) => productApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); setModalOpen(false); setEditing(null); toast.success("Product updated"); },
    onError: () => toast.error("Failed to update product"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["products"] }); toast.success("Product deleted"); },
    onError: () => toast.error("Failed to delete product"),
  });

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setModalOpen(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, sku: p.sku, description: p.description || "", category: p.category,
      baseUnit: p.baseUnit, inventoryQuantity: String(p.inventoryQuantity),
      pricePerBaseUnit: String(p.pricePerBaseUnit), lowStockThreshold: String(p.lowStockThreshold),
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const products: Product[] = data?.products || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            {user?.role === "SELLER" ? "My Products" : "Products"}
          </h1>
          <p className="text-muted-foreground mt-1">{pagination?.total || 0} products</p>
        </div>
        {canManage && (
          <Button variant="gradient" onClick={openCreate}>
            <Plus size={16} className="mr-2" /> Add Product
          </Button>
        )}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-secondary/40"
            placeholder="Search by name, SKU..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
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
                  <Th>SKU</Th>
                  <Th>Category</Th>
                  <Th>Unit Type</Th>
                  <Th>Stock</Th>
                  <Th>Price / Base</Th>
                  {canManage && <Th>Actions</Th>}
                </tr>
              </Thead>
              <Tbody>
                {products.map((p) => (
                  <Tr key={p.id}>
                    <Td>
                      <p className="font-medium">{p.name}</p>
                      {p.description && <p className="text-xs text-muted-foreground truncate max-w-xs">{p.description}</p>}
                    </Td>
                    <Td className="font-mono text-xs text-muted-foreground">{p.sku}</Td>
                    <Td><Badge>{p.category}</Badge></Td>
                    <Td><Badge variant="info">{p.baseUnit}</Badge></Td>
                    <Td>
                      <p>{formatBaseQuantity(Number(p.inventoryQuantity), p.baseUnit)}</p>
                      {Number(p.inventoryQuantity) <= Number(p.lowStockThreshold) && (
                        <p className="text-xs text-danger font-semibold">Low stock</p>
                      )}
                    </Td>
                    <Td className="font-semibold">{formatCurrency(p.pricePerBaseUnit)}</Td>
                    {canManage && (
                      <Td>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Edit size={14} /></Button>
                          <Button size="sm" variant="danger" onClick={() => { if (confirm("Delete this product?")) deleteMutation.mutate(p.id); }}><Trash2 size={14} /></Button>
                        </div>
                      </Td>
                    )}
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Product" : "Add Product"} className="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input label="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required disabled={!!editing} />
          </div>
          <Input label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional description..."
            />
          </div>
          {!editing && (
            <Select
              label="Base Unit Type"
              value={form.baseUnit}
              onChange={(e) => setForm({ ...form, baseUnit: e.target.value })}
              options={[
                { value: "WEIGHT", label: "Weight (g / kg)" },
                { value: "VOLUME", label: "Volume (mL / L)" },
                { value: "COUNT", label: "Count (items)" },
              ]}
            />
          )}
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price per Base Unit (₹)" type="number" step="0.01" value={form.pricePerBaseUnit} onChange={(e) => setForm({ ...form, pricePerBaseUnit: e.target.value })} required />
            <Input label={`Stock (${getUnitsForBaseType(form.baseUnit)[0]})`} type="number" step="0.001" value={form.inventoryQuantity} onChange={(e) => setForm({ ...form, inventoryQuantity: e.target.value })} />
          </div>
          <Input label="Low Stock Threshold" type="number" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} />
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="gradient" loading={createMutation.isPending || updateMutation.isPending}>
              {editing ? "Save Changes" : "Create Product"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
