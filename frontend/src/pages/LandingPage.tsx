import React from "react";
import { Link } from "react-router-dom";
import { Boxes, ArrowRight, Shield, Zap, BarChart3, Package, Users, FileText } from "lucide-react";

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-border bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-gradient-to-r from-secondary to-accent text-white rounded-xl px-4 py-2">
            <Boxes size={20} />
            <span className="font-bold text-lg">Aasa</span>
          </div>
          <span className="text-sm text-muted-foreground font-medium hidden sm:block">Inventory Platform</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-semibold text-primary hover:text-secondary transition px-4 py-2 rounded-xl hover:bg-muted"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="btn-gradient text-sm font-semibold px-5 py-2.5 rounded-xl inline-flex items-center gap-2"
          >
            Get Started <ArrowRight size={15} />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-8 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-secondary/10 text-secondary rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
          <Zap size={14} /> Smart Inventory Management
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-primary leading-tight mb-6">
          Manage Inventory
          <span className="block bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
            at Any Scale
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Aasa brings together sellers, buyers, and admins on one platform — with precise unit conversions, real-time quotations, and complete order lifecycle management.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="btn-gradient text-base font-semibold px-8 py-4 rounded-2xl inline-flex items-center gap-2 justify-center"
          >
            Start for Free <ArrowRight size={18} />
          </Link>
          <Link
            to="/login"
            className="border-2 border-primary text-primary font-semibold px-8 py-4 rounded-2xl hover:bg-primary/5 transition text-base"
          >
            Sign In
          </Link>
        </div>

        {/* Demo credentials quick pill */}
        <div className="mt-8 inline-flex flex-wrap gap-2 justify-center">
          {[
            { label: "Admin", email: "admin@aasa.com", pw: "Admin@123" },
            { label: "Seller", email: "seller1@aasa.com", pw: "Seller@123" },
            { label: "Buyer", email: "buyer1@aasa.com", pw: "Buyer@123" },
          ].map((d) => (
            <Link
              key={d.label}
              to="/login"
              className="text-xs bg-white border border-border rounded-full px-3 py-1.5 text-muted-foreground hover:border-secondary hover:text-secondary transition"
            >
              <span className="font-semibold text-primary">{d.label}:</span> {d.email}
            </Link>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-8 pb-20">
        <h2 className="text-3xl font-bold text-primary text-center mb-12">Everything you need</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Shield,
              title: "Role-Based Access",
              desc: "Admin, Seller, and Buyer roles — each with precisely scoped permissions and dedicated dashboards.",
              color: "text-secondary bg-secondary/10",
            },
            {
              icon: Zap,
              title: "Unit Conversion",
              desc: "Enter quantities in g, kg, mL, or L. We automatically convert and price at the base unit level.",
              color: "text-accent bg-accent/10",
            },
            {
              icon: FileText,
              title: "Quotation System",
              desc: "Buyers request live price previews, then convert approved quotations directly into orders.",
              color: "text-orange-600 bg-orange-100",
            },
            {
              icon: Package,
              title: "Product Management",
              desc: "Sellers list products with SKUs, categories, and inventory quantities. Admins oversee everything.",
              color: "text-primary bg-primary/10",
            },
            {
              icon: BarChart3,
              title: "Analytics Dashboard",
              desc: "Real-time overview of users, orders, revenue, top products, and low-stock alerts.",
              color: "text-purple-600 bg-purple-100",
            },
            {
              icon: Users,
              title: "Multi-User Platform",
              desc: "Multiple sellers and buyers on one platform with complete data isolation and audit trails.",
              color: "text-green-700 bg-green-100",
            },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="bg-white rounded-2xl border border-border p-6 hover:shadow-md transition">
              <div className={`inline-flex p-3 rounded-xl mb-4 ${color}`}>
                <Icon size={22} />
              </div>
              <h3 className="font-semibold text-primary text-lg mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Role cards */}
      <section className="bg-white border-t border-border py-20">
        <div className="max-w-5xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-primary text-center mb-12">Built for every role</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                role: "Admin",
                gradient: "from-primary to-accent",
                perks: ["Full platform oversight", "User management", "Order approvals", "Analytics & reports", "Inventory monitoring"],
              },
              {
                role: "Seller",
                gradient: "from-secondary to-accent",
                perks: ["List & manage products", "Track inventory", "View incoming orders", "Revenue overview", "Low-stock alerts"],
              },
              {
                role: "Buyer",
                gradient: "from-accent to-secondary",
                perks: ["Browse all products", "Request quotations", "Live price preview", "Convert to orders", "Order history"],
              },
            ].map(({ role, gradient, perks }) => (
              <div key={role} className="rounded-2xl border border-border overflow-hidden">
                <div className={`bg-gradient-to-r ${gradient} p-6 text-white`}>
                  <p className="text-sm font-semibold uppercase tracking-wide opacity-80">Role</p>
                  <p className="text-3xl font-extrabold mt-1">{role}</p>
                </div>
                <div className="p-6">
                  <ul className="space-y-2">
                    {perks.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center px-8">
        <h2 className="text-4xl font-extrabold text-primary mb-4">Ready to get started?</h2>
        <p className="text-muted-foreground mb-8 text-lg">Create your account in seconds. No credit card required.</p>
        <Link
          to="/register"
          className="btn-gradient text-base font-semibold px-10 py-4 rounded-2xl inline-flex items-center gap-2"
        >
          Create Free Account <ArrowRight size={18} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Boxes size={16} className="text-secondary" />
          <span className="font-semibold text-primary">Aasa</span>
        </div>
        <p>Inventory Management Platform · Built with React + Node.js + Neon PostgreSQL</p>
      </footer>
    </div>
  );
};
