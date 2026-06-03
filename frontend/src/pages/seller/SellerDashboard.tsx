import React from "react";
import { useQuery } from "@tanstack/react-query";
import { productApi, orderApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate, formatBaseQuantity } from "@/lib/utils";
import { Package, ShoppingCart, TrendingUp, AlertTriangle, ArrowRight, Sparkles, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Product, Order } from "@/types";

export const SellerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: productsData } = useQuery({
    queryKey: ["seller-products"],
    queryFn: () => productApi.getAll({ limit: 100 }).then((r) => r.data),
  });

  const { data: ordersData } = useQuery({
    queryKey: ["seller-orders"],
    queryFn: () => orderApi.getAll({ limit: 10 }).then((r) => r.data),
  });

  const products: Product[] = productsData?.products || [];
  const orders: Order[] = ordersData?.orders || [];
  const lowStock = products.filter((p) => Number(p.inventoryQuantity) <= Number(p.lowStockThreshold));
  const totalRevenue = orders.filter((o) => o.status === "COMPLETED").reduce((s, o) => s + Number(o.totalAmount), 0);
  const pendingOrders = orders.filter((o) => o.status === "PENDING").length;

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-secondary to-accent rounded-2xl p-6 text-white">
        <div className="blob absolute right-0 top-0 w-60 h-60 bg-white" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1 text-white/70 text-sm font-medium">
            <Sparkles size={13} /> Seller Portal
          </div>
          <h1 className="text-3xl font-extrabold">{user?.name}</h1>
          <p className="mt-1 text-white/70">Manage your products and track incoming orders</p>
          <Button
            variant="outline"
            className="mt-4 border-white text-white hover:bg-white hover:text-secondary"
            onClick={() => navigate("/seller/products")}
          >
            Manage Products <ArrowRight size={15} className="ml-2" />
          </Button>
        </div>
        <Package size={180} className="absolute -right-8 -bottom-8 opacity-10" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "My Products", value: products.length, icon: Package, light: "bg-secondary/10 text-secondary", gradient: "from-secondary to-blue-500" },
          { label: "Total Orders", value: orders.length, icon: ShoppingCart, light: "bg-accent/10 text-accent", gradient: "from-accent to-teal-600" },
          { label: "Pending Orders", value: pendingOrders, icon: TrendingUp, light: "bg-orange-100 text-orange-600", gradient: "from-orange-400 to-orange-600" },
          { label: "Revenue", value: formatCurrency(totalRevenue), icon: BarChart3, light: "bg-primary/10 text-primary", gradient: "from-primary to-[#1a6b6b]" },
        ].map(({ label, value, icon: Icon, light, gradient }) => (
          <div key={label} className="bg-white rounded-2xl border border-border p-5 hover:shadow-card-hover transition-shadow">
            <div className={`w-10 h-10 rounded-xl ${light} flex items-center justify-center mb-3`}>
              <Icon size={19} />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{value}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
            <div className={`mt-3 h-0.5 bg-gradient-to-r ${gradient} opacity-50 rounded-full`} />
          </div>
        ))}
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertTriangle size={15} className="text-danger" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-danger">{lowStock.length} Low Stock Alert{lowStock.length > 1 ? "s" : ""}</p>
            <p className="text-sm text-red-700 mt-0.5">{lowStock.map((p) => p.name).join(", ")} — need restocking</p>
          </div>
          <Button size="sm" variant="danger" onClick={() => navigate("/seller/inventory")}>View</Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Package size={17} className="text-secondary" />
              <h3 className="font-bold text-primary">My Products</h3>
            </div>
            <button onClick={() => navigate("/seller/products")} className="text-xs text-secondary hover:underline font-medium">Manage all</button>
          </div>
          <div className="divide-y divide-border">
            {products.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground text-sm">No products yet</div>
            ) : products.slice(0, 5).map((p) => {
              const isLow = Number(p.inventoryQuantity) <= Number(p.lowStockThreshold);
              return (
                <div key={p.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBaseQuantity(Number(p.inventoryQuantity), p.baseUnit)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{formatCurrency(p.pricePerBaseUnit)}/unit</p>
                    {isLow && <p className="text-xs text-danger font-semibold">Low stock</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <ShoppingCart size={17} className="text-accent" />
              <h3 className="font-bold text-primary">Recent Orders</h3>
            </div>
            <button onClick={() => navigate("/seller/orders")} className="text-xs text-secondary hover:underline font-medium">View all</button>
          </div>
          <div className="divide-y divide-border">
            {orders.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground text-sm">No orders yet</div>
            ) : orders.slice(0, 5).map((o) => (
              <div key={o.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-gray-900">{o.product?.name}</p>
                  <p className="text-xs text-muted-foreground">{o.buyer?.name} · {formatDate(o.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{formatCurrency(o.totalAmount)}</p>
                  <StatusBadge status={o.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
