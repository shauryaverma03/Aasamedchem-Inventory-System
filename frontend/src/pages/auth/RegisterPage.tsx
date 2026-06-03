import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Boxes } from "lucide-react";
import { toast } from "sonner";

export const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "BUYER" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.register(form);
      login(res.data.token, res.data.user);
      navigate(form.role === "SELLER" ? "/seller" : "/buyer");
      toast.success("Account created successfully!");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      toast.error(error.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-secondary to-accent text-white rounded-2xl px-5 py-3 mb-4">
            <Boxes size={24} />
            <span className="font-bold text-xl">Aasa</span>
          </div>
          <h1 className="text-3xl font-bold text-primary">Create account</h1>
          <p className="text-muted-foreground mt-1">Join the Aasa platform</p>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
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
              placeholder="Min 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <Select
              label="I am a"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              options={[
                { value: "BUYER", label: "Buyer — Browse and purchase products" },
                { value: "SELLER", label: "Seller — List and sell products" },
              ]}
            />
            <Button variant="gradient" size="lg" className="w-full" loading={loading} type="submit">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-secondary hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
