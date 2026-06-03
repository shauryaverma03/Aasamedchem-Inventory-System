import React from "react";
import { useQuery } from "@tanstack/react-query";
import { orderApi, quotationApi } from "@/services/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ShoppingCart, FileText, Package } from "lucide-react";
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">Buyer Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "My Orders", value: ordersData?.pagination?.total || 0, icon: ShoppingCart, color: "text-secondary bg-secondary/10" },
          { label: "My Quotations", value: quotationsData?.pagination?.total || 0, icon: FileText, color: "text-accent bg-accent/10" },
          { label: "Total Spent", value: formatCurrency(totalSpent), icon: Package, color: "text-primary bg-primary/10" },
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

      {/* Quick action */}
      <Card className="bg-gradient-to-r from-secondary/10 to-accent/10 border-secondary/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-primary">Request a Quotation</h3>
            <p className="text-sm text-muted-foreground mt-1">Browse products and get price estimates</p>
          </div>
          <Button variant="gradient" onClick={() => navigate("/buyer/products")}>
            Browse Products
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ShoppingCart size={18} />Recent Orders</CardTitle></CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {orders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium text-sm">{o.product?.name}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatCurrency(o.totalAmount)}</p>
                      <StatusBadge status={o.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText size={18} />Recent Quotations</CardTitle></CardHeader>
          <CardContent>
            {quotations.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No quotations yet</p>
            ) : (
              <div className="space-y-3">
                {quotations.map((q) => (
                  <div key={q.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium text-sm">{q.product?.name}</p>
                      <p className="text-xs text-muted-foreground">{Number(q.enteredQuantity).toFixed(2)} {q.enteredUnit} · {formatDate(q.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{formatCurrency(q.calculatedAmount)}</p>
                      <StatusBadge status={q.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
