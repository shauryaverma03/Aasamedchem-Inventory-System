import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard, Package, ShoppingCart, FileText, Users,
  BarChart3, LogOut, Boxes, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminLinks = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/products", icon: Package, label: "Products" },
  { to: "/admin/inventory", icon: Boxes, label: "Inventory" },
  { to: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { to: "/admin/quotations", icon: FileText, label: "Quotations" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
];

const sellerLinks = [
  { to: "/seller", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/seller/products", icon: Package, label: "My Products" },
  { to: "/seller/inventory", icon: Boxes, label: "Inventory" },
  { to: "/seller/orders", icon: ShoppingCart, label: "Orders" },
];

const buyerLinks = [
  { to: "/buyer", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/buyer/products", icon: Package, label: "Browse Products" },
  { to: "/buyer/quotations", icon: FileText, label: "My Quotations" },
  { to: "/buyer/orders", icon: ShoppingCart, label: "My Orders" },
];

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links =
    user?.role === "ADMIN" ? adminLinks :
    user?.role === "SELLER" ? sellerLinks :
    buyerLinks;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const roleColor = {
    ADMIN: "from-primary to-accent",
    SELLER: "from-secondary to-accent",
    BUYER: "from-accent to-secondary",
  }[user?.role ?? "BUYER"];

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${roleColor} text-white rounded-xl px-4 py-2`}>
          <Boxes size={20} />
          <span className="font-bold text-lg">Aasa</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Inventory Platform</p>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-border">
        <p className="font-semibold text-sm text-primary truncate">{user?.name}</p>
        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        <span className="mt-1 inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary/10 text-secondary">
          {user?.role}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/admin" || to === "/seller" || to === "/buyer"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-secondary/10 text-secondary"
                  : "text-gray-600 hover:bg-muted hover:text-primary"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={14} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-red-50 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};
