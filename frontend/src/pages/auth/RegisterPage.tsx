import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/services/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Boxes, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "BUYER" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
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

  const rolePerks: Record<string, string[]> = {
    BUYER: ["Browse product catalogue", "Request quotations with live pricing", "Convert approved quotes to orders", "Track order history"],
    SELLER: ["List and manage your products", "Set prices per base unit", "Track inventory levels", "View order revenue"],
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-secondary via-[#5a52e0] to-accent relative overflow-hidden flex-col justify-between p-12">
        <div className="blob absolute top-0 right-0 w-72 h-72 bg-primary" />
        <div className="blob absolute bottom-0 left-0 w-64 h-64 bg-white" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur rounded-xl px-4 py-2.5 inline-flex w-fit">
            <Boxes size={22} className="text-white" />
            <span className="font-extrabold text-white text-xl">Aasa</span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-4xl font-black text-white leading-tight mb-3">
              Join the<br />platform today
            </h2>
            <p className="text-white/70 text-lg">
              Choose your role and get access to a tailored dashboard.
            </p>
          </div>

          <div className="space-y-3">
            {["Secure JWT authentication", "Real-time price calculations", "Multi-product quotation cart", "Audit trail for all actions"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-white/80 flex-shrink-0" />
                <span className="text-white/80 text-sm">{item}</span>
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
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-secondary to-accent text-white rounded-2xl px-5 py-3 mb-4">
              <Boxes size={22} />
              <span className="font-bold text-xl">Aasa</span>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-primary">Create account</h1>
            <p className="text-muted-foreground mt-1.5">Join the Aasa platform — it&apos;s free</p>
          </div>

          <div className="bg-white rounded-2xl border border-border shadow-card p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Full Name" placeholder="John Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input label="Email Address" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <Input label="Password" type="password" placeholder="Min 6 characters" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              <Select
                label="I am a"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                options={[
                  { value: "BUYER", label: "Buyer — Browse and purchase products" },
                  { value: "SELLER", label: "Seller — List and sell products" },
                ]}
              />

              {/* Role perks preview */}
              <div className={`rounded-xl p-3 border text-xs space-y-1.5 ${form.role === "BUYER" ? "bg-accent/5 border-accent/20" : "bg-secondary/5 border-secondary/20"}`}>
                <p className="font-semibold text-primary mb-1">{form.role === "BUYER" ? "As a Buyer you can:" : "As a Seller you can:"}</p>
                {rolePerks[form.role].map((p) => (
                  <div key={p} className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 size={11} className="text-accent flex-shrink-0" />
                    {p}
                  </div>
                ))}
              </div>

              <Button variant="gradient" size="lg" className="w-full !mt-5" loading={loading} type="submit">
                Create Account <ArrowRight size={16} className="ml-1" />
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-5">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-secondary hover:underline">Sign In</Link>
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
