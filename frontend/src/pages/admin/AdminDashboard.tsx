import React from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Users, Package, ShoppingCart, FileText, TrendingUp, AlertTriangle, ArrowUpRight } from "lucide-react";

export const AdminDashboard = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => adminApi.getAnalytics().then((r) => r.data),
  });

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary" />
    </div>
  );

  const { overview, ordersByStatus, recentOrders, topProducts } = analytics || {};

  const stats = [
    { label: "Total Users", value: overview?.totalUsers, icon: Users, gradient: "from-violet-500 to-purple-600", light: "bg-violet-50 text-violet-600" },
    { label: "Active Products", value: overview?.totalProducts, icon: Package, gradient: "from-secondary to-blue-500", light: "bg-blue-50 text-blue-600" },
    { label: "Total Orders", value: overview?.totalOrders, icon: ShoppingCart, gradient: "from-accent to-teal-600", light: "bg-teal-50 text-teal-600" },
    { label: "Quotations", value: overview?.totalQuotations, icon: FileText, gradient: "from-orange-400 to-orange-600", light: "bg-orange-50 text-orange-600" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Platform overview · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, gradient, light }) => (
          <div key={label} className="bg-white rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl ${light}`}>
                <Icon size={20} />
              </div>
              <ArrowUpRight size={16} className="text-muted-foreground" />
            </div>
            <p className="text-3xl font-extrabold text-gray-900">{value ?? 0}</p>
            <p className="text-sm text-muted-foreground mt-1">{label}</p>
            <div className={`mt-3 h-1 rounded-full bg-gradient-to-r ${gradient} opacity-60`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-secondary" />
            <h3 className="font-semibold text-primary">Orders by Status</h3>
          </div>
          <div className="space-y-3">
            {(ordersByStatus || []).map((s: { status: string; _count: number }) => {
              const total = (ordersByStatus || []).reduce((sum: number, x: { _count: number }) => sum + x._count, 0);
              const pct = total > 0 ? Math.round((s._count / total) * 100) : 0;
              const colors: Record<string, string> = {
                PENDING: "bg-yellow-400", APPROVED: "bg-green-400",
                REJECTED: "bg-red-400", COMPLETED: "bg-blue-400",
              };
              return (
                <div key={s.status}>
                  <div className="flex items-center justify-between mb-1">
                    <StatusBadge status={s.status} />
                    <span className="text-sm font-bold text-gray-700">{s._count} <span className="font-normal text-muted-foreground text-xs">({pct}%)</span></span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div className={`${colors[s.status] || "bg-gray-400"} rounded-full h-1.5 transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top Products */}
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Package size={18} className="text-secondary" />
            <h3 className="font-semibold text-primary">Top Products by Revenue</h3>
          </div>
          <div className="space-y-3">
            {(topProducts || []).map((p: { productId: string; _count: number; _sum: { totalAmount: number }; product?: { name: string; sku: string } }, i: number) => (
              <div key={p.productId} className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white ${
                  i === 0 ? "bg-yellow-500" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-orange-400" : "bg-muted-foreground"
                }`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.product?.name || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{p._count} orders</p>
                </div>
                <p className="font-bold text-sm text-primary">{formatCurrency(p._sum?.totalAmount || 0)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <ShoppingCart size={18} className="text-secondary" />
          <h3 className="font-semibold text-primary">Recent Orders</h3>
        </div>
        <div className="divide-y divide-border">
          {(recentOrders || []).map((o: { id: string; buyer?: { name: string }; product?: { name: string }; status: string; totalAmount: number | string; createdAt: string }) => (
            <div key={o.id} className="py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary font-bold text-sm">
                  {o.buyer?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-sm">{o.buyer?.name} → {o.product?.name}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={o.status} />
                <span className="font-bold text-sm text-primary">{formatCurrency(o.totalAmount)}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
