"use client";
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectItem } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Target, Plus, Trash2, CheckCircle2, Edit2, X, Loader2,
  Trophy, Home, GraduationCap, Plane, TrendingUp, Shield, CreditCard, Briefcase,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Goal } from "@/types";

const GOAL_ICONS: Record<string, any> = {
  MILLIONAIRE: Trophy, EMERGENCY_FUND: Shield, PAY_OFF_DEBT: CreditCard,
  BUY_HOME: Home, RETIREMENT: Briefcase, EDUCATION: GraduationCap,
  VACATION: Plane, CUSTOM: Target,
};

const GOAL_COLORS: Record<string, string> = {
  MILLIONAIRE: "text-yellow-400", EMERGENCY_FUND: "text-blue-400",
  PAY_OFF_DEBT: "text-red-400", BUY_HOME: "text-emerald-400",
  RETIREMENT: "text-violet-400", EDUCATION: "text-cyan-400",
  VACATION: "text-pink-400", CUSTOM: "text-orange-400",
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [form, setForm] = useState({
    name: "", type: "CUSTOM", targetAmount: "", currentAmount: "", targetDate: "", description: "",
  });

  async function fetchGoals() {
    const res = await fetch("/api/goals");
    const data = await res.json();
    setGoals(data);
    setLoading(false);
  }

  useEffect(() => { fetchGoals(); }, []);

  function startEdit(goal: Goal) {
    setEditGoal(goal);
    setForm({
      name: goal.name,
      type: goal.type,
      targetAmount: String(goal.targetAmount),
      currentAmount: String(goal.currentAmount),
      targetDate: goal.targetDate ? goal.targetDate.split("T")[0] : "",
      description: goal.description ?? "",
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name,
      type: form.type,
      targetAmount: parseFloat(form.targetAmount) || 0,
      currentAmount: parseFloat(form.currentAmount) || 0,
      targetDate: form.targetDate ? new Date(form.targetDate).toISOString() : null,
      description: form.description || null,
    };

    if (editGoal) {
      await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editGoal.id, ...payload }),
      });
    } else {
      await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setShowForm(false);
    setEditGoal(null);
    setForm({ name: "", type: "CUSTOM", targetAmount: "", currentAmount: "", targetDate: "", description: "" });
    fetchGoals();
  }

  async function deleteGoal(id: string) {
    if (!confirm("Delete this goal?")) return;
    await fetch(`/api/goals?id=${id}`, { method: "DELETE" });
    fetchGoals();
  }

  async function markComplete(goal: Goal) {
    await fetch("/api/goals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: goal.id, isCompleted: true }),
    });
    fetchGoals();
  }

  const active = goals.filter((g) => !g.isCompleted);
  const completed = goals.filter((g) => g.isCompleted);

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Goals" />
      <div className="flex-1 p-8 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-white/40 text-sm">{active.length} active · {completed.length} completed</p>
          </div>
          <Button onClick={() => { setEditGoal(null); setForm({ name: "", type: "CUSTOM", targetAmount: "", currentAmount: "", targetDate: "", description: "" }); setShowForm(true); }}>
            <Plus className="mr-2 h-4 w-4" /> New Goal
          </Button>
        </div>

        {/* Goal Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-white/8 bg-[#0f0f1a] p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-white">{editGoal ? "Edit Goal" : "New Goal"}</h3>
                <button onClick={() => setShowForm(false)} className="text-white/40 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Goal Name</Label>
                  <Input placeholder="e.g. Become a Millionaire" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Goal Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                    {["MILLIONAIRE","EMERGENCY_FUND","PAY_OFF_DEBT","BUY_HOME","RETIREMENT","EDUCATION","VACATION","CUSTOM"].map((t) => (
                      <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Target Amount</Label>
                    <div className="relative"><span className="absolute left-3 top-2.5 text-white/30 text-sm">$</span>
                      <Input className="pl-7" placeholder="1,000,000" value={form.targetAmount} onChange={(e) => setForm((f) => ({ ...f, targetAmount: e.target.value }))} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Current Amount</Label>
                    <div className="relative"><span className="absolute left-3 top-2.5 text-white/30 text-sm">$</span>
                      <Input className="pl-7" placeholder="250,000" value={form.currentAmount} onChange={(e) => setForm((f) => ({ ...f, currentAmount: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Target Date (optional)</Label>
                  <Input type="date" value={form.targetDate} onChange={(e) => setForm((f) => ({ ...f, targetDate: e.target.value }))} />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" className="flex-1">{editGoal ? "Update Goal" : "Create Goal"}</Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-violet-400" /></div>
        ) : goals.length === 0 ? (
          <div className="text-center py-20">
            <Target className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/40">No goals yet. Create your first financial goal!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {active.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-3">Active Goals</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {active.map((goal) => {
                    const Icon = GOAL_ICONS[goal.type] ?? Target;
                    const iconColor = GOAL_COLORS[goal.type] ?? "text-violet-400";
                    const pct = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
                    const remaining = goal.targetAmount - goal.currentAmount;
                    return (
                      <div key={goal.id} className="rounded-2xl border border-white/8 bg-white/4 p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white/8`}>
                              <Icon className={`h-5 w-5 ${iconColor}`} />
                            </div>
                            <div>
                              <p className="font-semibold text-white text-sm">{goal.name}</p>
                              {goal.targetDate && (
                                <p className="text-xs text-white/40">
                                  Target: {new Date(goal.targetDate).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => startEdit(goal)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => markComplete(goal)} className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-white/40 hover:text-emerald-400 transition-colors">
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                            <button onClick={() => deleteGoal(goal.id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Progress value={pct} />
                          <div className="flex items-center justify-between text-xs text-white/50">
                            <span>{formatCurrency(goal.currentAmount)} saved</span>
                            <span className={`font-semibold ${iconColor}`}>{pct.toFixed(1)}%</span>
                            <span>{formatCurrency(goal.targetAmount)} target</span>
                          </div>
                          {remaining > 0 && (
                            <p className="text-xs text-white/30">{formatCurrency(remaining)} remaining</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {completed.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider mb-3">Completed</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {completed.map((goal) => {
                    const Icon = GOAL_ICONS[goal.type] ?? Target;
                    return (
                      <div key={goal.id} className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 opacity-70">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-emerald-400" />
                          <div className="flex-1">
                            <p className="font-semibold text-white text-sm">{goal.name}</p>
                            <p className="text-xs text-emerald-400">{formatCurrency(goal.targetAmount)} · Completed {goal.completedAt ? new Date(goal.completedAt).toLocaleDateString() : ""}</p>
                          </div>
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
