"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle2, Loader2, Trash2, AlertTriangle, Info, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const SEVERITY_STYLES: Record<string, { bg: string; text: string; icon: any }> = {
  SUCCESS: { bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-400", icon: CheckCircle2 },
  WARNING: { bg: "bg-yellow-500/10 border-yellow-500/20", text: "text-yellow-400", icon: AlertTriangle },
  ERROR: { bg: "bg-red-500/10 border-red-500/20", text: "text-red-400", icon: AlertTriangle },
  INFO: { bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-400", icon: Info },
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const [phone, setPhone] = useState("");
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [fireTarget, setFireTarget] = useState("");
  const [saving, setSaving] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  useEffect(() => {
    fetch("/api/alerts")
      .then((r) => r.json())
      .then((d) => { setAlerts(d.alerts ?? []); setLoadingAlerts(false); })
      .catch(() => setLoadingAlerts(false));
  }, []);

  async function markRead(id: string) {
    await fetch("/api/alerts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isRead: true }),
    });
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
  }

  async function markAllRead() {
    const unread = alerts.filter((a) => !a.isRead);
    await Promise.all(unread.map((a) => markRead(a.id)));
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Settings" />
      <div className="flex-1 p-8 animate-fade-in max-w-3xl mx-auto w-full space-y-6">
        {/* Profile */}
        <div className="rounded-2xl border border-white/8 bg-white/4 p-6">
          <h3 className="font-semibold text-white mb-4">Account</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-white/8">
              <span className="text-sm text-white/50">Name</span>
              <span className="text-sm text-white">{session?.user?.name ?? "—"}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-white/50">Email</span>
              <span className="text-sm text-white">{session?.user?.email ?? "—"}</span>
            </div>
          </div>
        </div>

        {/* FIRE Target */}
        <div className="rounded-2xl border border-white/8 bg-white/4 p-6">
          <h3 className="font-semibold text-white mb-2">FIRE Target</h3>
          <p className="text-xs text-white/40 mb-4">Set a custom FIRE number. Leave blank to use 25× annual expenses.</p>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2.5 text-white/30 text-sm">$</span>
              <Input
                className="pl-7"
                placeholder="1,000,000"
                value={fireTarget}
                onChange={(e) => setFireTarget(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => {}}>Save</Button>
          </div>
        </div>

        {/* SMS Notifications */}
        <div className="rounded-2xl border border-white/8 bg-white/4 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="h-5 w-5 text-violet-400" />
            <h3 className="font-semibold text-white">SMS Notifications</h3>
          </div>
          <p className="text-xs text-white/40 mb-4">Receive SMS alerts for financial milestones and warnings (requires Twilio setup).</p>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSmsEnabled((v) => !v)}
                className={cn(
                  "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                  smsEnabled ? "bg-violet-600" : "bg-white/20"
                )}
              >
                <span className={cn("inline-block h-4 w-4 rounded-full bg-white shadow transition-transform", smsEnabled ? "translate-x-6" : "translate-x-1")} />
              </button>
              <span className="text-sm text-white/60">{smsEnabled ? "Enabled" : "Disabled"}</span>
            </div>
            <Button disabled={saving}>
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Settings"}
            </Button>
          </div>
        </div>

        {/* Alerts */}
        <div id="alerts" className="rounded-2xl border border-white/8 bg-white/4 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Alerts & Notifications</h3>
            {alerts.some((a) => !a.isRead) && (
              <Button variant="ghost" size="sm" onClick={markAllRead}>
                <CheckCheck className="mr-2 h-4 w-4" /> Mark all read
              </Button>
            )}
          </div>

          {loadingAlerts ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-white/40" /></div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-8 w-8 text-white/20 mx-auto mb-2" />
              <p className="text-sm text-white/40">No alerts yet. Alerts are generated when you save monthly data.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => {
                const style = SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.INFO;
                const Icon = style.icon;
                return (
                  <div
                    key={alert.id}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-3 transition-all",
                      style.bg,
                      !alert.isRead ? "opacity-100" : "opacity-50"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", style.text)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{alert.title}</p>
                      <p className="text-xs text-white/60 mt-0.5">{alert.message}</p>
                      <p className="text-xs text-white/30 mt-1">{new Date(alert.createdAt).toLocaleString()}</p>
                    </div>
                    {!alert.isRead && (
                      <button
                        onClick={() => markRead(alert.id)}
                        className="shrink-0 text-xs text-white/40 hover:text-white transition-colors"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
