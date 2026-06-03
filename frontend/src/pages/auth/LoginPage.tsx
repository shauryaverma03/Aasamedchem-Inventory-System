import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Boxes } from "lucide-react";
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

  const fillDemo = (email: string, password: string) => {
    setForm({ email, password });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-secondary to-accent text-white rounded-2xl px-5 py-3 mb-4">
            <Boxes size={24} />
            <span className="font-bold text-xl">Aasa</span>
          </div>
          <h1 className="text-3xl font-bold text-primary">Welcome back</h1>
          <p className="text-muted-foreground mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
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
              Sign In
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-muted rounded-xl">
            <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Demo Credentials</p>
            <div className="space-y-1">
              {[
                { label: "Admin", email: "admin@aasa.com", pw: "Admin@123" },
                { label: "Seller", email: "seller1@aasa.com", pw: "Seller@123" },
                { label: "Buyer", email: "buyer1@aasa.com", pw: "Buyer@123" },
              ].map((d) => (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => fillDemo(d.email, d.pw)}
                  className="w-full text-left text-xs px-3 py-2 rounded-lg hover:bg-border transition flex justify-between items-center"
                >
                  <span className="font-medium text-primary">{d.label}</span>
                  <span className="text-muted-foreground">{d.email}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-secondary hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
