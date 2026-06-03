import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productApi, quotationApi } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { formatCurrency, formatBaseQuantity, getUnitsForBaseType, toBaseUnit } from "@/lib/utils";
import type { Product } from "@/types";
import { Search, ShoppingCart, Plus, Minus, Trash2, FileText, ChevronRight, Package, Zap } from "lucide-react";
import { toast } from "sonner";

interface CartItem {
  product: Product;
  qty: string;
  unit: string;
  baseQty: number;
  price: number;
}

export const BuyerProducts = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [quickAdd, setQuickAdd] = useState<{ product: Product; qty: string; unit: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["buyer-browse-products", search, categoryFilter, page],
    queryFn: () =>
      productApi.getAll({
        search: search || undefined,
        category: categoryFilter || undefined,
        page,
        limit: 12,
      }).then((r) => r.data),
  });

  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => productApi.getCategories().then((r) => r.data),
  });

  const submitQuotations = useMutation({
    mutationFn: async (items: CartItem[]) => {
      const promises = items.map((item) =>
        quotationApi.create({
          productId: item.product.id,
          enteredQuantity: parseFloat(item.qty),
          enteredUnit: item.unit,
        })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["buyer-quotations"] });
      setCart([]);
      setCartOpen(false);
      toast.success(`${cart.length} quotation${cart.length > 1 ? "s" : ""} submitted successfully!`);
    },
    onError: () => toast.error("Failed to submit quotations"),
  });

  const openQuickAdd = (p: Product) => {
    const units = getUnitsForBaseType(p.baseUnit);
    setQuickAdd({ product: p, qty: "", unit: units[0] });
  };

  const addToCart = () => {
    if (!quickAdd || !quickAdd.qty) return;
    const qty = parseFloat(quickAdd.qty);
    if (isNaN(qty) || qty <= 0) { toast.error("Enter a valid quantity"); return; }
    const baseQty = toBaseUnit(qty, quickAdd.unit, quickAdd.product.baseUnit);
    const price = baseQty * parseFloat(String(quickAdd.product.pricePerBaseUnit));
    const existing = cart.findIndex((c) => c.product.id === quickAdd.product.id);
    if (existing >= 0) {
      const updated = [...cart];
      updated[existing] = { product: quickAdd.product, qty: quickAdd.qty, unit: quickAdd.unit, baseQty, price };
      setCart(updated);
      toast.success("Cart updated");
    } else {
      setCart((prev) => [...prev, { product: quickAdd.product, qty: quickAdd.qty, unit: quickAdd.unit, baseQty, price }]);
      toast.success(`${quickAdd.product.name} added to cart`);
    }
    setQuickAdd(null);
  };

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((c) => c.product.id !== id));
  const cartTotal = cart.reduce((s, c) => s + c.price, 0);
  const products: Product[] = data?.products || [];
  const categories: string[] = catData?.categories || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Browse Products</h1>
          <p className="text-muted-foreground mt-1">Find products, add to cart, and request quotations</p>
        </div>
        <button
          onClick={() => setCartOpen(true)}
          className="relative flex items-center gap-2 bg-secondary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-secondary/90 transition"
        >
          <ShoppingCart size={18} />
          Quotation Cart
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-danger text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-secondary/40"
            placeholder="Search by name, SKU..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select
          className="px-4 py-2.5 text-sm rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-secondary/40 min-w-40"
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary" /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Package size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((p) => {
            const inCart = cart.some((c) => c.product.id === p.id);
            const units = getUnitsForBaseType(p.baseUnit);
            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl border-2 transition-all duration-200 overflow-hidden hover:shadow-lg ${
                  inCart ? "border-secondary shadow-md shadow-secondary/10" : "border-border hover:border-secondary/30"
                }`}
              >
                {/* Card top accent */}
                <div className="h-1.5 bg-gradient-to-r from-secondary to-accent" />
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-primary truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{p.sku}</p>
                    </div>
                    {inCart && (
                      <span className="ml-2 flex-shrink-0 bg-secondary/10 text-secondary text-xs px-2 py-0.5 rounded-full font-semibold">
                        In Cart
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2 mb-3">
                    <Badge>{p.category}</Badge>
                    <Badge variant="info">{p.baseUnit}</Badge>
                  </div>

                  {p.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{p.description}</p>
                  )}

                  <div className="bg-muted rounded-xl p-3 mb-4 space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Price</span>
                      <span className="font-bold text-primary">{formatCurrency(p.pricePerBaseUnit)}<span className="font-normal text-xs text-muted-foreground">/{units[0]}</span></span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Stock</span>
                      <span className="font-medium">{formatBaseQuantity(Number(p.inventoryQuantity), p.baseUnit)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Units</span>
                      <span>{units.join(", ")}</span>
                    </div>
                  </div>

                  <Button
                    variant={inCart ? "outline" : "gradient"}
                    size="sm"
                    className="w-full"
                    onClick={() => openQuickAdd(p)}
                  >
                    {inCart ? <><Minus size={14} className="mr-1" />Update Qty</> : <><Plus size={14} className="mr-1" />Add to Cart</>}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages} · {pagination.total} products</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
            <Button size="sm" variant="outline" disabled={page === pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      {/* Quick Add Modal */}
      <Modal isOpen={!!quickAdd} onClose={() => setQuickAdd(null)} title="Add to Quotation Cart">
        {quickAdd && (
          <div className="space-y-5">
            <div className="bg-gradient-to-r from-secondary/10 to-accent/10 rounded-xl p-4 border border-secondary/20">
              <p className="font-bold text-primary">{quickAdd.product.name}</p>
              <p className="text-sm text-muted-foreground">{quickAdd.product.sku} · {quickAdd.product.category}</p>
              <p className="text-sm font-semibold text-secondary mt-1">
                {formatCurrency(quickAdd.product.pricePerBaseUnit)} per {getUnitsForBaseType(quickAdd.product.baseUnit)[0]}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Quantity"
                type="number"
                step="0.001"
                min="0.001"
                placeholder="e.g. 2.5"
                value={quickAdd.qty}
                onChange={(e) => setQuickAdd({ ...quickAdd, qty: e.target.value })}
              />
              <Select
                label="Unit"
                value={quickAdd.unit}
                onChange={(e) => setQuickAdd({ ...quickAdd, unit: e.target.value })}
                options={getUnitsForBaseType(quickAdd.product.baseUnit).map((u) => ({ value: u, label: u }))}
              />
            </div>

            {/* Live conversion preview */}
            {quickAdd.qty && parseFloat(quickAdd.qty) > 0 && (
              <div className="bg-secondary/10 rounded-xl p-4 space-y-2 border border-secondary/20">
                <p className="text-xs font-semibold text-secondary uppercase tracking-wide flex items-center gap-1">
                  <Zap size={12} /> Live Price Preview
                </p>
                {(() => {
                  const qty = parseFloat(quickAdd.qty);
                  const base = toBaseUnit(qty, quickAdd.unit, quickAdd.product.baseUnit);
                  const price = base * parseFloat(String(quickAdd.product.pricePerBaseUnit));
                  const baseUnit = getUnitsForBaseType(quickAdd.product.baseUnit)[0];
                  return (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">You entered</span>
                        <span className="font-medium">{qty} {quickAdd.unit}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Stored as</span>
                        <span className="font-medium text-accent">{base.toFixed(3)} {baseUnit} <span className="text-xs text-muted-foreground">(base unit)</span></span>
                      </div>
                      <div className="border-t border-secondary/20 pt-2 flex justify-between">
                        <span className="font-semibold text-primary">Estimated Price</span>
                        <span className="font-bold text-primary text-lg">{formatCurrency(price)}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setQuickAdd(null)}>Cancel</Button>
              <Button variant="gradient" className="flex-1" onClick={addToCart} disabled={!quickAdd.qty}>
                <ShoppingCart size={16} className="mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cart Modal */}
      <Modal isOpen={cartOpen} onClose={() => setCartOpen(false)} title="Quotation Cart" className="max-w-2xl">
        {cart.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <ShoppingCart size={48} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Your cart is empty</p>
            <p className="text-sm mt-1">Browse products and add them to your cart</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{cart.length} product{cart.length > 1 ? "s" : ""} in cart</p>

            <div className="divide-y divide-border">
              {cart.map((item) => {
                const baseUnit = getUnitsForBaseType(item.product.baseUnit)[0];
                return (
                  <div key={item.product.id} className="py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-semibold text-primary">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">{item.product.sku}</p>
                        {/* Unit conversion breakdown */}
                        <div className="mt-2 bg-muted rounded-lg px-3 py-2 text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Ordered</span>
                            <span className="font-medium">{parseFloat(item.qty).toFixed(3)} {item.unit}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Stored as</span>
                            <span className="font-medium text-accent">{item.baseQty.toFixed(3)} {baseUnit}</span>
                          </div>
                          <div className="flex justify-between border-t border-border/60 pt-1">
                            <span className="font-semibold">Price</span>
                            <span className="font-bold text-primary">{formatCurrency(item.price)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => { openQuickAdd(item.product); setCartOpen(false); }}>
                          <Minus size={14} />
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => removeFromCart(item.product.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="bg-gradient-to-r from-secondary/10 to-accent/10 rounded-xl p-4 border border-secondary/20">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total for {cart.length} product{cart.length > 1 ? "s" : ""}</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(cartTotal)}</p>
                </div>
                <Button
                  variant="gradient"
                  size="lg"
                  loading={submitQuotations.isPending}
                  onClick={() => {
                    if (confirm(`Submit ${cart.length} quotation${cart.length > 1 ? "s" : ""}?`))
                      submitQuotations.mutate(cart);
                  }}
                >
                  <FileText size={18} className="mr-2" />
                  Submit {cart.length > 1 ? "All" : ""} Quotation{cart.length > 1 ? "s" : ""}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
