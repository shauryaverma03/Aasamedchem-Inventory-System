import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/services/api";
import { StatusBadge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart3, TrendingUp, Users, Package, ShoppingCart,
  FileText, Award, ArrowUpRight, Activity,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl shadow-card p-3 text-sm">
      {label && <p className="font-semibold text-primary mb-1.5">{label}</p>}
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {typeof p.value === "number" && p.name.toLowerCase().includes("revenue")
            ? formatCurrency(p.value)
            : p.value}
        </p>
      ))}
    </div>
  );
};

// ── Pie label ─────────────────────────────────────────────────────────────────
const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: {
  cx: number; cy: number; midAngle: number;
  innerRadius: number; outerRadius: number;
  percent: number; name: string;
}) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.06) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#F59E0B",
  APPROVED: "#10B981",
  REJECTED: "#EF4444",
  COMPLETED: "#3B82F6",
  EXPIRED: "#9CA3AF",
};

const RANK_COLORS = ["#EAB308", "#9CA3AF", "#EA580C", "#6C63FF", "#14B8A6"];

export const AdminAnalytics = () => {
  const [revenueView, setRevenueView] = useState<"revenue" | "orders">("revenue");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => adminApi.getAnalytics().then((r) => r.data),
  });

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary" />
    </div>
  );

  const { overview, ordersByStatus, quotationsByStatus, topProducts, orderTrend } = data || {};

  const totalRevenue = (topProducts || []).reduce(
    (s: number, p: { _sum?: { totalAmount?: number } }) => s + (Number(p._sum?.totalAmount) || 0), 0
  );

  // Pie data for orders
  const orderPieData = (ordersByStatus || []).map((s: { status: string; _count: number }) => ({
    name: s.status,
    value: s._count,
  }));

  // Pie data for quotations
  const quotationPieData = (quotationsByStatus || []).map((s: { status: string; _count: number }) => ({
    name: s.status,
    value: s._count,
  }));

  // Bar chart: top products revenue
  const productBarData = (topProducts || []).map((p: {
    productId: string; _count: number; _sum?: { totalAmount?: number };
    product?: { name: string };
  }) => ({
    name: p.product?.name?.split(" ").slice(0, 2).join(" ") || "Unknown",
    revenue: Number(p._sum?.totalAmount || 0),
    orders: p._count,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Platform performance overview ·{" "}
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
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
              <ArrowUpRight size={14} className="text-muted-foreground" />
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
            <div className="flex items-center gap-2 mb-1 text-white/60 text-sm"><TrendingUp size={13} /> Total Platform Revenue</div>
            <p className="text-4xl font-black">{formatCurrency(totalRevenue)}</p>
            <p className="text-white/60 text-sm mt-1">From completed orders across all products</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center">
            <BarChart3 size={28} className="text-white" />
          </div>
        </div>
      </div>

      {/* ── CHART ROW 1: Area trend + Pie orders ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Area chart — order/revenue trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Activity size={17} className="text-secondary" />
              <h3 className="font-bold text-primary">14-Day Trend</h3>
            </div>
            <div className="flex gap-1 bg-muted rounded-xl p-1">
              {(["revenue", "orders"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setRevenueView(v)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    revenueView === v ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={orderTrend || []} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2EBE9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9CA3AF" }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={revenueView === "revenue" ? (v) => `₹${v}` : undefined}
              />
              <Tooltip content={<ChartTooltip />} />
              {revenueView === "revenue" ? (
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="#6C63FF"
                  strokeWidth={2.5}
                  fill="url(#colorRevenue)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#6C63FF" }}
                />
              ) : (
                <Area
                  type="monotone"
                  dataKey="orders"
                  name="Orders"
                  stroke="#14B8A6"
                  strokeWidth={2.5}
                  fill="url(#colorOrders)"
                  dot={false}
                  activeDot={{ r: 5, fill: "#14B8A6" }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart — order status */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-card">
          <div className="flex items-center gap-2 mb-5">
            <ShoppingCart size={17} className="text-secondary" />
            <h3 className="font-bold text-primary">Order Status</h3>
          </div>
          {orderPieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No orders yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie
                    data={orderPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    dataKey="value"
                    labelLine={false}
                    label={PieLabel as React.FC}
                  >
                    {orderPieData.map((entry: { name: string }, i: number) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.name] || "#9CA3AF"} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-1.5">
                {orderPieData.map((entry: { name: string; value: number }) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[entry.name] || "#9CA3AF" }} />
                      <StatusBadge status={entry.name} />
                    </div>
                    <span className="font-bold text-gray-700">{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── CHART ROW 2: Bar top products + Pie quotations ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Bar chart — top products */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6 shadow-card">
          <div className="flex items-center gap-2 mb-5">
            <Award size={17} className="text-secondary" />
            <h3 className="font-bold text-primary">Top Products by Revenue</h3>
          </div>
          {productBarData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No completed orders yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={productBarData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2EBE9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9CA3AF" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="revenue" name="Revenue" radius={[6, 6, 0, 0]} maxBarSize={52}>
                  {productBarData.map((_: unknown, i: number) => (
                    <Cell key={i} fill={RANK_COLORS[i] || "#6C63FF"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart — quotation status */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-card">
          <div className="flex items-center gap-2 mb-5">
            <FileText size={17} className="text-accent" />
            <h3 className="font-bold text-primary">Quotation Status</h3>
          </div>
          {quotationPieData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No quotations yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie
                    data={quotationPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {quotationPieData.map((entry: { name: string }, i: number) => (
                      <Cell key={i} fill={STATUS_COLORS[entry.name] || "#9CA3AF"} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 space-y-1.5">
                {quotationPieData.map((entry: { name: string; value: number }) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[entry.name] || "#9CA3AF" }} />
                      <StatusBadge status={entry.name} />
                    </div>
                    <span className="font-bold text-gray-700">{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Top products ranked list ── */}
      <div className="bg-white rounded-2xl border border-border p-6 shadow-card">
        <div className="flex items-center gap-2 mb-5">
          <Package size={17} className="text-secondary" />
          <h3 className="font-bold text-primary">Product Leaderboard</h3>
        </div>
        {(topProducts || []).length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">No data yet</p>
        ) : (
          <div className="space-y-3">
            {(topProducts || []).map((p: {
              productId: string; _count: number; _sum?: { totalAmount?: number };
              product?: { name: string; sku: string };
            }, i: number) => {
              const maxRevenue = Number((topProducts as { _sum?: { totalAmount?: number } }[])[0]?._sum?.totalAmount || 1);
              const pct = Math.round((Number(p._sum?.totalAmount || 0) / maxRevenue) * 100);
              return (
                <div key={p.productId} className="flex items-center gap-4 p-3 bg-muted rounded-xl">
                  <span
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                    style={{ background: RANK_COLORS[i] || "#6C63FF" }}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-sm truncate">{p.product?.name || "Unknown"}</p>
                      <p className="font-bold text-sm text-primary ml-3 flex-shrink-0">{formatCurrency(p._sum?.totalAmount || 0)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: RANK_COLORS[i] || "#6C63FF" }} />
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">{p._count} orders</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
