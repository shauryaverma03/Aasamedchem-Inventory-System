import React from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { BarChart3, TrendingUp, Users, Package } from "lucide-react";

export const AdminAnalytics = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => adminApi.getAnalytics().then((r) => r.data),
  });

  if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary" /></div>;

  const { overview, ordersByStatus, topProducts } = data || {};

  const totalRevenue = (topProducts || []).reduce(
    (sum: number, p: { _sum?: { totalAmount?: number } }) => sum + (Number(p._sum?.totalAmount) || 0), 0
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Analytics</h1>
        <p className="text-muted-foreground mt-1">Platform performance overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: overview?.totalUsers, icon: Users },
          { label: "Active Products", value: overview?.totalProducts, icon: Package },
          { label: "Total Orders", value: overview?.totalOrders, icon: BarChart3 },
          { label: "Platform Revenue", value: formatCurrency(totalRevenue), icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg"><Icon size={18} className="text-secondary" /></div>
              <div>
                <p className="text-xl font-bold text-primary">{value ?? 0}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 size={18} />Order Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(ordersByStatus || []).map((s: { status: string; _count: number }) => {
                const total = (ordersByStatus || []).reduce((sum: number, x: { _count: number }) => sum + x._count, 0);
                const pct = total > 0 ? Math.round((s._count / total) * 100) : 0;
                return (
                  <div key={s.status}>
                    <div className="flex items-center justify-between mb-1">
                      <StatusBadge status={s.status} />
                      <span className="text-sm font-semibold">{s._count} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-secondary rounded-full h-2 transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Package size={18} />Top Products by Orders</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(topProducts || []).map((p: { productId: string; _count: number; _sum?: { totalAmount?: number }; product?: { name: string; sku: string } }, i: number) => (
                <div key={p.productId} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-secondary/10 text-secondary text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{p.product?.name}</p>
                    <p className="text-xs text-muted-foreground">{p._count} orders · {formatCurrency(p._sum?.totalAmount || 0)}</p>
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
