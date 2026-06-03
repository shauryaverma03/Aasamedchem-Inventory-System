import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Boxes, Zap, Shield, BarChart3, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login(form);
      login(res.data.token, res.data.user);
      const role = res.data.user.role;
      navigate(role === "ADMIN" ? "/admin" : role === "SELLER" ? "/seller" : "/buyer");
      toast.success(`Welcome back, ${res.data.user.name}!`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email: string, password: string) => setForm({ email, password });

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-primary via-[#1a5c5c] to-accent relative overflow-hidden flex-col justify-between p-12">
        {/* Background blobs */}
        <div className="blob absolute top-0 right-0 w-72 h-72 bg-secondary" />
        <div className="blob absolute bottom-0 left-0 w-64 h-64 bg-white" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur rounded-xl px-4 py-2.5 inline-flex w-fit">
            <Boxes size={22} className="text-white" />
            <span className="font-extrabold text-white text-xl">Aasa</span>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-black text-white leading-tight mb-3">
              Manage inventory<br />with precision
            </h2>
            <p className="text-white/70 text-lg leading-relaxed">
              Unit conversions, quotation workflows, and analytics — all in one platform.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { icon: Shield, text: "Role-based access control" },
              { icon: Zap, text: "Automatic unit conversion (g ↔ kg, mL ↔ L)" },
              { icon: BarChart3, text: "Real-time analytics dashboard" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-white" />
                </div>
                <span className="text-white/80 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/40 text-xs">AasaMedChem · Inventory Platform</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-secondary to-accent text-white rounded-2xl px-5 py-3 mb-4">
              <Boxes size={22} />
              <span className="font-bold text-xl">Aasa</span>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-primary">Welcome back</h1>
            <p className="text-muted-foreground mt-1.5">Sign in to your account to continue</p>
          </div>

          <div className="bg-white rounded-2xl border border-border shadow-card p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <Button variant="gradient" size="lg" className="w-full" loading={loading} type="submit">
                Sign In <ArrowRight size={16} className="ml-1" />
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px bg-border" />
                <p className="text-xs text-muted-foreground font-medium">Quick Demo</p>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Admin", email: "admin@aasa.com", pw: "Admin@123", color: "hover:border-primary hover:bg-primary/5 hover:text-primary" },
                  { label: "Seller", email: "seller1@aasa.com", pw: "Seller@123", color: "hover:border-secondary hover:bg-secondary/5 hover:text-secondary" },
                  { label: "Buyer", email: "buyer1@aasa.com", pw: "Buyer@123", color: "hover:border-accent hover:bg-accent/5 hover:text-accent" },
                ].map((d) => (
                  <button
                    key={d.label}
                    type="button"
                    onClick={() => fillDemo(d.email, d.pw)}
                    className={`border border-border rounded-xl p-2.5 text-center transition-all ${d.color}`}
                  >
                    <p className="text-xs font-bold">{d.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{d.email.split("@")[0]}</p>
                  </button>
                ))}
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-5">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-semibold text-secondary hover:underline">Register</Link>
            </p>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            <Link to="/" className="hover:text-primary transition">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
