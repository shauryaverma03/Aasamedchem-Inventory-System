import React from "react";
import { useQuery } from "@tanstack/react-query";
import { productApi, orderApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatDate, formatBaseQuantity } from "@/lib/utils";
import { Package, ShoppingCart, TrendingUp, AlertTriangle } from "lucide-react";

export const SellerDashboard = () => {
  const { user } = useAuth();

  const { data: productsData } = useQuery({
    queryKey: ["seller-products"],
    queryFn: () => productApi.getAll({ limit: 100 }).then((r) => r.data),
  });

  const { data: ordersData } = useQuery({
    queryKey: ["seller-orders"],
    queryFn: () => orderApi.getAll({ limit: 10 }).then((r) => r.data),
  });

  const products = productsData?.products || [];
  const orders = ordersData?.orders || [];
  const lowStock = products.filter((p: { inventoryQuantity: number | string; lowStockThreshold: number | string }) => Number(p.inventoryQuantity) <= Number(p.lowStockThreshold));

  const totalRevenue = orders
    .filter((o: { status: string }) => o.status === "COMPLETED")
    .reduce((sum: number, o: { totalAmount: number | string }) => sum + Number(o.totalAmount), 0);

  const pendingOrders = orders.filter((o: { status: string }) => o.status === "PENDING").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Seller Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "My Products", value: products.length, icon: Package, color: "text-secondary bg-secondary/10" },
          { label: "Total Orders", value: orders.length, icon: ShoppingCart, color: "text-accent bg-accent/10" },
          { label: "Pending Orders", value: pendingOrders, icon: ShoppingCart, color: "text-orange-600 bg-orange-100" },
          { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: TrendingUp, color: "text-primary bg-primary/10" },
        ].map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${color}`}><Icon size={22} /></div>
            <div>
              <p className="text-2xl font-bold text-primary">{value}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-danger mt-0.5" size={18} />
          <div>
            <p className="font-semibold text-danger">{lowStock.length} Low Stock Alert{lowStock.length > 1 ? "s" : ""}</p>
            <p className="text-sm text-red-700 mt-0.5">{lowStock.map((p: { name: string }) => p.name).join(", ")}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Package size={18} />Products</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {products.slice(0, 5).map((p: { id: string; name: string; baseUnit: string; inventoryQuantity: number | string; pricePerBaseUnit: number | string }) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{formatBaseQuantity(Number(p.inventoryQuantity), p.baseUnit)}</p>
                  </div>
                  <p className="font-semibold text-sm">{formatCurrency(p.pricePerBaseUnit)}/unit</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ShoppingCart size={18} />Recent Orders</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orders.slice(0, 5).map((o: { id: string; buyer?: { name: string }; product?: { name: string }; totalAmount: number | string; status: string; createdAt: string }) => (
                <div key={o.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-sm">{o.product?.name}</p>
                    <p className="text-xs text-muted-foreground">{o.buyer?.name} · {formatDate(o.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatCurrency(o.totalAmount)}</p>
                    <StatusBadge status={o.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
