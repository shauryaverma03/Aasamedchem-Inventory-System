import React from "react";
import { useQuery } from "@tanstack/react-query";
import { orderApi, quotationApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ShoppingCart, FileText, Package, ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Order, Quotation } from "@/types";

export const BuyerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: ordersData } = useQuery({
    queryKey: ["buyer-orders"],
    queryFn: () => orderApi.getAll({ limit: 5 }).then((r) => r.data),
  });

  const { data: quotationsData } = useQuery({
    queryKey: ["buyer-quotations"],
    queryFn: () => quotationApi.getAll({ limit: 5 }).then((r) => r.data),
  });

  const orders: Order[] = ordersData?.orders || [];
  const quotations: Quotation[] = quotationsData?.quotations || [];
  const totalSpent = orders.filter(o => o.status === "COMPLETED").reduce((s, o) => s + Number(o.totalAmount), 0);
  const pendingOrders = orders.filter(o => o.status === "PENDING").length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-secondary to-accent rounded-2xl p-6 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1 text-white/70 text-sm font-medium">
            <Sparkles size={14} /> Welcome back
          </div>
          <h1 className="text-3xl font-extrabold">{user?.name}</h1>
          <p className="mt-1 text-white/70">Browse products and manage your quotations & orders</p>
          <Button
            variant="outline"
            className="mt-4 border-white text-white hover:bg-white hover:text-secondary"
            onClick={() => navigate("/buyer/products")}
          >
            Browse Products <ArrowRight size={16} className="ml-2" />
          </Button>
        </div>
        <div className="absolute right-0 top-0 w-64 h-full opacity-10">
          <Package size={200} className="absolute -right-10 -top-10" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: ordersData?.pagination?.total || 0, icon: ShoppingCart, color: "from-secondary to-blue-500", light: "bg-blue-50 text-blue-600" },
          { label: "Quotations", value: quotationsData?.pagination?.total || 0, icon: FileText, color: "from-accent to-teal-600", light: "bg-teal-50 text-teal-600" },
          { label: "Pending Orders", value: pendingOrders, icon: TrendingUp, color: "from-orange-400 to-orange-600", light: "bg-orange-50 text-orange-600" },
          { label: "Total Spent", value: formatCurrency(totalSpent), icon: Package, color: "from-primary to-[#1a6b6b]", light: "bg-primary/10 text-primary" },
        ].map(({ label, value, icon: Icon, color, light }) => (
          <div key={label} className="bg-white rounded-2xl border border-border p-5 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl ${light} flex items-center justify-center mb-3`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{value}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
            <div className={`mt-3 h-0.5 bg-gradient-to-r ${color} opacity-50 rounded-full`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className="text-secondary" />
              <h3 className="font-semibold text-primary">Recent Orders</h3>
            </div>
            <button onClick={() => navigate("/buyer/orders")} className="text-xs text-secondary hover:underline font-medium">View all</button>
          </div>
          <div className="divide-y divide-border">
            {orders.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground text-sm">No orders yet</div>
            ) : orders.map((o) => (
              <div key={o.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-gray-900">{o.product?.name}</p>
                  <p className="text-xs text-muted-foreground">{Number(o.enteredQuantity).toFixed(2)} {o.enteredUnit} · {formatDate(o.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{formatCurrency(o.totalAmount)}</p>
                  <StatusBadge status={o.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Quotations */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-accent" />
              <h3 className="font-semibold text-primary">Recent Quotations</h3>
            </div>
            <button onClick={() => navigate("/buyer/quotations")} className="text-xs text-secondary hover:underline font-medium">View all</button>
          </div>
          <div className="divide-y divide-border">
            {quotations.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground text-sm">No quotations yet</div>
            ) : quotations.map((q) => (
              <div key={q.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm text-gray-900">{q.product?.name}</p>
                  <p className="text-xs text-muted-foreground">{Number(q.enteredQuantity).toFixed(2)} {q.enteredUnit} · {formatDate(q.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">{formatCurrency(q.calculatedAmount)}</p>
                  <StatusBadge status={q.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
