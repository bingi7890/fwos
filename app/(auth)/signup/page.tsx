"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TrendingUp, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Registration failed");
    } else {
      router.push("/signin?registered=1");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-transparent to-blue-900/20 pointer-events-none" />
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600 mb-4">
            <TrendingUp className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-white/50 mt-1">Start building your family wealth today</p>
        </div>

        <div className="rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: "name", label: "Full Name", icon: User, type: "text", placeholder: "John Doe" },
              { key: "email", label: "Email", icon: Mail, type: "email", placeholder: "you@example.com" },
              { key: "password", label: "Password", icon: Lock, type: "password", placeholder: "••••••••" },
              { key: "confirm", label: "Confirm Password", icon: Lock, type: "password", placeholder: "••••••••" },
            ].map(({ key, label, icon: Icon, type, placeholder }) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key}>{label}</Label>
                <div className="relative">
                  <Icon className="absolute left-3 top-2.5 h-4 w-4 text-white/30" />
                  <Input
                    id={key}
                    type={type}
                    placeholder={placeholder}
                    className="pl-10"
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    required
                  />
                </div>
              </div>
            ))}
            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
            )}
            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</>
              ) : (
                <>Create Account <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-white/40 mt-6">
          Already have an account?{" "}
          <Link href="/signin" className="text-violet-400 hover:text-violet-300">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
