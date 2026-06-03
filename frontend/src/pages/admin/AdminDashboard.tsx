import React from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Users, Package, ShoppingCart, FileText, TrendingUp, AlertTriangle } from "lucide-react";

export const AdminDashboard = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => adminApi.getAnalytics().then((r) => r.data),
  });

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary" /></div>;

  const { overview, ordersByStatus, recentOrders, topProducts } = analytics || {};

  const stats = [
    { label: "Total Users", value: overview?.totalUsers, icon: Users, color: "text-secondary bg-secondary/10" },
    { label: "Products", value: overview?.totalProducts, icon: Package, color: "text-accent bg-accent/10" },
    { label: "Orders", value: overview?.totalOrders, icon: ShoppingCart, color: "text-primary bg-primary/10" },
    { label: "Quotations", value: overview?.totalQuotations, icon: FileText, color: "text-orange-600 bg-orange-100" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview and analytics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${color}`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{value ?? 0}</p>
              <p className="text-sm text-muted-foreground">{label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp size={18} /> Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(ordersByStatus || []).map((s: { status: string; _count: number }) => (
                <div key={s.status} className="flex items-center justify-between">
                  <StatusBadge status={s.status} />
                  <span className="font-semibold text-primary">{s._count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Package size={18} /> Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(topProducts || []).map((p: { productId: string; _count: number; _sum: { totalAmount: number }; product?: { name: string; sku: string } }) => (
                <div key={p.productId} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-primary">{p.product?.name || "Unknown"}</p>
                    <p className="text-xs text-muted-foreground">{p.product?.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{p._count} orders</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(p._sum?.totalAmount || 0)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShoppingCart size={18} /> Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {(recentOrders || []).map((o: { id: string; buyer?: { name: string }; product?: { name: string }; status: string; totalAmount: number | string; createdAt: string }) => (
              <div key={o.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{o.buyer?.name} → {o.product?.name}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={o.status} />
                  <span className="font-semibold text-sm">{formatCurrency(o.totalAmount)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
