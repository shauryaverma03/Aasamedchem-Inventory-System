import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard, Package, ShoppingCart, FileText, Users,
  BarChart3, LogOut, Boxes, ChevronRight, Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminLinks = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/products", icon: Package, label: "Products" },
  { to: "/admin/inventory", icon: Layers, label: "Inventory" },
  { to: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { to: "/admin/quotations", icon: FileText, label: "Quotations" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
];

const sellerLinks = [
  { to: "/seller", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/seller/products", icon: Package, label: "My Products" },
  { to: "/seller/inventory", icon: Layers, label: "Inventory" },
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

  const handleLogout = () => { logout(); navigate("/"); };

  const roleConfig = {
    ADMIN: {
      gradient: "from-primary to-[#1a6b6b]",
      badge: "bg-primary/15 text-primary border border-primary/25",
      activeBg: "bg-primary text-white shadow-glow-primary",
    },
    SELLER: {
      gradient: "from-secondary to-[#9d97ff]",
      badge: "bg-secondary/15 text-secondary border border-secondary/25",
      activeBg: "bg-secondary text-white shadow-glow-secondary",
    },
    BUYER: {
      gradient: "from-accent to-[#5eead4]",
      badge: "bg-accent/15 text-accent border border-accent/25",
      activeBg: "bg-accent text-white shadow-glow-accent",
    },
  }[user?.role ?? "BUYER"];

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <div className={`flex items-center gap-2.5 bg-gradient-to-r ${roleConfig.gradient} text-white rounded-xl px-4 py-3`}>
          <Boxes size={20} />
          <div>
            <p className="font-extrabold text-sm leading-none">Aasa</p>
            <p className="text-[10px] opacity-60 leading-none mt-0.5">MedChem Platform</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleConfig.gradient} flex items-center justify-center text-white font-bold text-base flex-shrink-0`}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <div className="mt-2.5">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${roleConfig.badge}`}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/admin" || to === "/seller" || to === "/buyer"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? `${roleConfig.activeBg}`
                  : "text-gray-500 hover:bg-muted hover:text-gray-800"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} className={isActive ? "opacity-100" : "opacity-50"} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={13} className="opacity-60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};
