import React from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/services/api";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { BarChart3, TrendingUp, Users, Package, ShoppingCart, FileText, Award, ArrowUpRight } from "lucide-react";

export const AdminAnalytics = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => adminApi.getAnalytics().then((r) => r.data),
  });

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary" />
    </div>
  );

  const { overview, ordersByStatus, topProducts } = data || {};
  const totalRevenue = (topProducts || []).reduce(
    (sum: number, p: { _sum?: { totalAmount?: number } }) => sum + (Number(p._sum?.totalAmount) || 0), 0
  );

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-400",
    APPROVED: "bg-emerald-400",
    REJECTED: "bg-red-400",
    COMPLETED: "bg-blue-400",
  };

  const rankColors = ["bg-yellow-500", "bg-gray-400", "bg-orange-400", "bg-muted-foreground", "bg-muted-foreground"];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Analytics</h1>
        <p className="text-muted-foreground mt-1">Platform performance overview · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: overview?.totalUsers ?? 0, icon: Users, gradient: "from-violet-500 to-purple-600", light: "bg-violet-50 text-violet-600" },
          { label: "Active Products", value: overview?.totalProducts ?? 0, icon: Package, gradient: "from-secondary to-blue-500", light: "bg-blue-50 text-blue-600" },
          { label: "Total Orders", value: overview?.totalOrders ?? 0, icon: ShoppingCart, gradient: "from-accent to-teal-600", light: "bg-teal-50 text-teal-600" },
          { label: "Quotations", value: overview?.totalQuotations ?? 0, icon: FileText, gradient: "from-orange-400 to-orange-600", light: "bg-orange-50 text-orange-600" },
        ].map(({ label, value, icon: Icon, gradient, light }) => (
          <div key={label} className="bg-white rounded-2xl border border-border p-5 shadow-card hover:shadow-card-hover transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${light} flex items-center justify-center`}>
                <Icon size={19} />
              </div>
              <ArrowUpRight size={15} className="text-muted-foreground" />
            </div>
            <p className="text-3xl font-extrabold text-gray-900">{value}</p>
            <p className="text-sm text-muted-foreground mt-1">{label}</p>
            <div className={`mt-3 h-1 rounded-full bg-gradient-to-r ${gradient} opacity-60`} />
          </div>
        ))}
      </div>

      {/* Revenue highlight */}
      <div className="bg-gradient-to-br from-primary to-accent rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="blob absolute right-0 top-0 w-48 h-48 bg-white" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1 text-white/60 text-sm">
              <TrendingUp size={14} /> Platform Revenue
            </div>
            <p className="text-4xl font-black">{formatCurrency(totalRevenue)}</p>
            <p className="text-white/60 text-sm mt-1">From completed orders across all products</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center">
            <BarChart3 size={28} className="text-white" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order distribution */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <ShoppingCart size={17} className="text-secondary" />
            <h3 className="font-bold text-primary">Order Distribution</h3>
          </div>
          <div className="space-y-4">
            {(ordersByStatus || []).map((s: { status: string; _count: number }) => {
              const total = (ordersByStatus || []).reduce((sum: number, x: { _count: number }) => sum + x._count, 0);
              const pct = total > 0 ? Math.round((s._count / total) * 100) : 0;
              return (
                <div key={s.status}>
                  <div className="flex items-center justify-between mb-1.5">
                    <StatusBadge status={s.status} />
                    <span className="text-sm font-bold text-gray-800">{s._count} <span className="font-normal text-muted-foreground text-xs">({pct}%)</span></span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div className={`${statusColors[s.status] || "bg-gray-400"} h-2 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top products */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <Award size={17} className="text-secondary" />
            <h3 className="font-bold text-primary">Top Products by Revenue</h3>
          </div>
          <div className="space-y-3">
            {(topProducts || []).map((p: { productId: string; _count: number; _sum?: { totalAmount?: number }; product?: { name: string; sku: string } }, i: number) => (
              <div key={p.productId} className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white ${rankColors[i] || "bg-muted-foreground"}`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{p.product?.name || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{p._count} orders</p>
                </div>
                <p className="font-bold text-sm text-primary">{formatCurrency(p._sum?.totalAmount || 0)}</p>
              </div>
            ))}
            {(topProducts || []).length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-6">No completed orders yet</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
