import React from "react";
import { Link } from "react-router-dom";
import {
  Boxes, ArrowRight, Shield, Zap, BarChart3, Package,
  Users, FileText, CheckCircle2, Star, ChevronRight,
  Activity, TrendingUp, Lock,
} from "lucide-react";

const features = [
  { icon: Shield, title: "Role-Based Access", desc: "Admin, Seller, and Buyer roles with precisely scoped permissions and dedicated dashboards.", color: "text-secondary", bg: "bg-secondary/10", border: "border-secondary/20" },
  { icon: Zap, title: "Unit Conversion", desc: "Enter quantities in g, kg, mL, or L. Auto-converted to base units with 6-decimal precision.", color: "text-accent", bg: "bg-accent/10", border: "border-accent/20" },
  { icon: FileText, title: "Quotation System", desc: "Buyers request live price previews, then convert approved quotations directly into orders.", color: "text-orange-500", bg: "bg-orange-50", border: "border-orange-200" },
  { icon: Package, title: "Product Management", desc: "Sellers list products with SKUs, categories, and inventory. Admins oversee everything.", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  { icon: BarChart3, title: "Analytics Dashboard", desc: "Real-time overview of users, orders, revenue, top products, and low-stock alerts.", color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
  { icon: Lock, title: "Secure Auth", desc: "JWT tokens, bcrypt-hashed passwords, and middleware-enforced role checks on every endpoint.", color: "text-green-700", bg: "bg-green-50", border: "border-green-200" },
];

const roles = [
  { role: "Admin", gradient: "from-primary via-[#1a6b6b] to-accent", perks: ["Full platform oversight", "User management & activation", "Order approvals & rejections", "Analytics & revenue reports", "Inventory monitoring"] },
  { role: "Seller", gradient: "from-secondary via-[#8b84ff] to-accent", featured: true, perks: ["List & manage products", "Track inventory levels", "View incoming orders", "Revenue overview", "Low-stock alerts"] },
  { role: "Buyer", gradient: "from-accent via-[#2dd4bf] to-secondary", perks: ["Browse all products", "Multi-product cart", "Live price preview", "Convert to orders", "Full order history"] },
];

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* NAV */}
      <nav className="flex items-center justify-between px-6 sm:px-10 py-4 border-b border-border bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gradient-to-r from-secondary to-accent text-white rounded-xl px-3.5 py-2">
            <Boxes size={20} />
            <span className="font-extrabold text-lg">Aasa</span>
          </div>
          <span className="text-sm text-muted-foreground font-medium hidden sm:block">MedChem Inventory</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login" className="text-sm font-semibold text-primary hover:text-secondary transition px-4 py-2 rounded-xl hover:bg-muted">
            Sign In
          </Link>
          <Link to="/register" className="btn-gradient text-sm font-semibold px-5 py-2.5 rounded-xl inline-flex items-center gap-2">
            Get Started <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="blob absolute top-0 left-1/4 w-96 h-96 bg-secondary" />
        <div className="blob absolute bottom-0 right-1/4 w-80 h-80 bg-accent" />

        <div className="max-w-6xl mx-auto px-6 sm:px-10 pt-20 pb-24 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 text-secondary rounded-full px-4 py-1.5 text-sm font-semibold mb-8">
              <Zap size={13} fill="currentColor" /> Precision Inventory Management
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-primary leading-[1.05] tracking-tight mb-6">
              Inventory that
              <span className="block gradient-text">understands chemistry</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Track chemicals in grams, kilograms, millilitres or litres. Automatic unit conversion, quotation workflows, and role-based dashboards — all in one platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <Link to="/register" className="btn-gradient text-base font-bold px-9 py-4 rounded-2xl inline-flex items-center gap-2 justify-center">
                Start for Free <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="border-2 border-primary text-primary font-bold px-9 py-4 rounded-2xl hover:bg-primary hover:text-white transition-all text-base inline-flex items-center gap-2 justify-center">
                Sign In
              </Link>
            </div>

            {/* Demo pills */}
            <div className="flex flex-wrap gap-2 justify-center">
              <span className="text-xs text-muted-foreground self-center mr-1">Try as →</span>
              {[
                { label: "Admin", email: "admin@aasa.com", cls: "hover:border-primary hover:text-primary" },
                { label: "Seller", email: "seller1@aasa.com", cls: "hover:border-secondary hover:text-secondary" },
                { label: "Buyer", email: "buyer1@aasa.com", cls: "hover:border-accent hover:text-accent" },
              ].map((d) => (
                <Link key={d.label} to="/login" className={`text-xs bg-white border border-border rounded-full px-4 py-1.5 text-muted-foreground transition-all ${d.cls}`}>
                  <span className="font-bold">{d.label}</span> · {d.email}
                </Link>
              ))}
            </div>
          </div>

          {/* Floating preview cards */}
          <div className="mt-20 relative hidden lg:flex items-start justify-center gap-6 h-44">
            <div className="animate-float bg-white rounded-2xl border border-border shadow-card p-4 w-56">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center"><Zap size={14} className="text-accent" /></div>
                <div><p className="text-xs font-bold text-primary">Unit Conversion</p><p className="text-[10px] text-muted-foreground">Live preview</p></div>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Entered</span><span className="font-bold">2.5 kg</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Stored as</span><span className="font-bold text-accent">2500.000 g</span></div>
                <div className="flex justify-between border-t border-border pt-1.5 mt-1"><span className="font-semibold">Price</span><span className="font-bold text-primary">₹125.00</span></div>
              </div>
            </div>

            <div className="animate-float-2 bg-white rounded-2xl border border-border shadow-card p-4 w-60 mt-8">
              <p className="text-xs font-bold text-primary mb-2 flex items-center gap-1.5"><TrendingUp size={12} className="text-secondary" />Revenue Overview</p>
              <div className="flex items-end gap-1 h-12">
                {[35, 55, 45, 70, 60, 85, 75].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: "linear-gradient(to top, #6C63FF, #14B8A6)", opacity: 0.4 + i * 0.09 }} />
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5">Last 7 days</p>
            </div>

            <div className="animate-float-3 bg-white rounded-2xl border border-border shadow-card p-4 w-52">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-success inline-block animate-pulse-dot" />
                <p className="text-xs font-bold text-primary">Quotation Approved</p>
              </div>
              <p className="text-[10px] text-muted-foreground mb-2">buyer1@aasa.com</p>
              <div className="bg-success/10 text-success text-xs font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1">
                <CheckCircle2 size={12} /> Approved · ₹2,340
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="border-y border-border bg-white py-10">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { label: "Products Managed", value: "500+", icon: Package },
            { label: "User Roles", value: "3", icon: Users },
            { label: "Unit Types", value: "3", icon: Zap },
            { label: "DB Precision", value: "6dp", icon: Activity },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-secondary/10 text-secondary mb-2">
                <Icon size={18} />
              </div>
              <p className="text-2xl font-black text-primary">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 py-24">
        <div className="text-center mb-14">
          <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-4xl font-black text-primary mb-4">Everything you need</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">A complete inventory platform built for chemical and pharmaceutical procurement workflows.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc, color, bg, border }) => (
            <div key={title} className={`bg-white rounded-2xl border ${border} p-6 card-lift`}>
              <div className={`inline-flex p-3 rounded-xl mb-4 ${bg}`}><Icon size={22} className={color} /></div>
              <h3 className="font-bold text-primary text-lg mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white border-y border-border py-24">
        <div className="max-w-5xl mx-auto px-6 sm:px-10">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-accent uppercase tracking-widest mb-3">Workflow</p>
            <h2 className="text-4xl font-black text-primary">How it works</h2>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute top-7 left-16 right-16 h-0.5 bg-gradient-to-r from-secondary/30 via-accent/50 to-secondary/30" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Browse", desc: "Buyers explore catalogue filtered by category.", icon: Package, color: "from-secondary to-[#8b84ff]" },
                { step: "02", title: "Add to Cart", desc: "Pick quantity in any unit, see instant price preview.", icon: Zap, color: "from-accent to-[#2dd4bf]" },
                { step: "03", title: "Request Quote", desc: "Submit quotation. Admin reviews and approves.", icon: FileText, color: "from-orange-400 to-orange-500" },
                { step: "04", title: "Place Order", desc: "Convert approved quote to order and track it.", icon: CheckCircle2, color: "from-success to-emerald-600" },
              ].map(({ step, title, desc, icon: Icon, color }) => (
                <div key={step} className="text-center relative">
                  <div className={`w-14 h-14 bg-gradient-to-br ${color} text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-card relative z-10`}>
                    <Icon size={22} />
                  </div>
                  <p className="text-xs font-black text-muted-foreground mb-1">{step}</p>
                  <p className="font-bold text-primary mb-2">{title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ROLE CARDS */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 py-24">
        <div className="text-center mb-14">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Roles</p>
          <h2 className="text-4xl font-black text-primary">Built for every role</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {roles.map(({ role, gradient, featured, perks }) => (
            <div key={role} className={`rounded-3xl overflow-hidden border card-lift ${featured ? "ring-2 ring-secondary/40 shadow-glow-secondary border-secondary/30" : "border-border"}`}>
              {featured && (
                <div className="bg-secondary text-white text-xs font-bold text-center py-1.5 flex items-center justify-center gap-1">
                  <Star size={11} fill="currentColor" /> Most Popular
                </div>
              )}
              <div className={`bg-gradient-to-br ${gradient} p-7 text-white`}>
                <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-1">Role</p>
                <p className="text-4xl font-black">{role}</p>
              </div>
              <div className="bg-white p-6">
                <ul className="space-y-2.5 mb-6">
                  {perks.map((p) => (
                    <li key={p} className="flex items-center gap-2.5 text-sm text-gray-700">
                      <CheckCircle2 size={15} className="text-accent flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="w-full btn-gradient py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2">
                  Get Started <ChevronRight size={15} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="mx-4 sm:mx-10 mb-24 rounded-3xl overflow-hidden">
        <div className="relative bg-gradient-to-br from-primary via-[#1a5c5c] to-accent p-12 sm:p-16 text-center text-white">
          <div className="blob absolute top-0 left-1/4 w-64 h-64 bg-white" />
          <div className="blob absolute bottom-0 right-1/4 w-48 h-48 bg-secondary" />
          <div className="relative z-10">
            <h2 className="text-4xl sm:text-5xl font-black mb-4">Ready to manage smarter?</h2>
            <p className="text-white/70 text-lg mb-8 max-w-lg mx-auto">Create your account in seconds. Your role-specific dashboard is waiting.</p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary font-bold px-10 py-4 rounded-2xl hover:bg-white/90 transition text-base shadow-card">
              Create Free Account <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-10 px-6 sm:px-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-gradient-to-r from-secondary to-accent text-white rounded-xl px-3 py-1.5">
              <Boxes size={16} />
              <span className="font-bold text-sm">Aasa</span>
            </div>
            <span className="text-sm text-muted-foreground">MedChem Inventory Platform</span>
          </div>
          <p className="text-xs text-muted-foreground">React · Node.js · Neon PostgreSQL · Vercel + Render</p>
          <div className="flex gap-4 text-sm">
            <Link to="/login" className="text-muted-foreground hover:text-primary transition">Sign In</Link>
            <Link to="/register" className="text-muted-foreground hover:text-primary transition">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
