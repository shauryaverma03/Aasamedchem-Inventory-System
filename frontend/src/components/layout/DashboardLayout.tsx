import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/context/AuthContext";
import { Bell, Search } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/users": "Users",
  "/admin/products": "Products",
  "/admin/inventory": "Inventory",
  "/admin/orders": "Orders",
  "/admin/quotations": "Quotations",
  "/admin/analytics": "Analytics",
  "/seller": "Dashboard",
  "/seller/products": "My Products",
  "/seller/inventory": "Inventory",
  "/seller/orders": "Orders",
  "/buyer": "Dashboard",
  "/buyer/products": "Browse Products",
  "/buyer/quotations": "My Quotations",
  "/buyer/orders": "My Orders",
};

export const DashboardLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const pageTitle = pageTitles[location.pathname] || "Dashboard";

  const roleColors: Record<string, string> = {
    ADMIN: "bg-primary/10 text-primary border-primary/20",
    SELLER: "bg-secondary/10 text-secondary border-secondary/20",
    BUYER: "bg-accent/10 text-accent border-accent/20",
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header bar */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <h2 className="font-bold text-primary text-lg">{pageTitle}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Quick search..."
                className="pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-muted focus:outline-none focus:ring-2 focus:ring-secondary/30 w-48 focus:w-56 transition-all"
                readOnly
              />
            </div>
            <button className="relative w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-border transition">
              <Bell size={16} className="text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-danger" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-gray-900 leading-none">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{user?.email}</p>
              </div>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold border ${roleColors[user?.role ?? "BUYER"]}`}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
