"use client";
import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Select, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  FileText, Download, Plus, Loader2, TrendingUp, DollarSign, BarChart3, Target,
} from "lucide-react";
import { formatCurrency, formatPercent, getMonthName } from "@/lib/utils";

const CURRENT_YEAR = new Date().getFullYear();

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [form, setForm] = useState({
    type: "MONTHLY",
    year: CURRENT_YEAR,
    month: new Date().getMonth() + 1,
    quarter: 1,
  });
  const [selectedReport, setSelectedReport] = useState<any>(null);

  async function fetchReports() {
    const res = await fetch("/api/reports");
    const data = await res.json();
    setReports(data);
    setLoading(false);
  }

  useEffect(() => { fetchReports(); }, []);

  async function generate() {
    setGenerating(true);
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const report = await res.json();
    setGenerating(false);
    fetchReports();
    setSelectedReport(report);
  }

  function exportPDF(report: any) {
    const content = report.content as any;
    const data = content.data?.[0];
    if (!data) return;

    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${report.title}</title>
<style>
  body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 40px auto; color: #111; }
  h1 { color: #7c3aed; } h2 { color: #444; border-bottom: 1px solid #eee; padding-bottom: 8px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0; }
  .card { background: #f8f8f8; border-radius: 8px; padding: 16px; }
  .label { font-size: 12px; color: #666; } .value { font-size: 20px; font-weight: 700; }
  .positive { color: #059669; } .negative { color: #dc2626; }
</style>
</head>
<body>
<h1>${report.title}</h1>
<p style="color:#666">Generated: ${new Date().toLocaleDateString()}</p>
<h2>Financial Summary</h2>
<div class="grid">
  <div class="card"><div class="label">Net Worth</div><div class="value ${data.netWorth >= 0 ? "positive" : "negative"}">${formatCurrency(data.netWorth)}</div></div>
  <div class="card"><div class="label">Total Assets</div><div class="value positive">${formatCurrency(data.totalAssets)}</div></div>
  <div class="card"><div class="label">Total Liabilities</div><div class="value negative">${formatCurrency(data.totalLiabilities)}</div></div>
  <div class="card"><div class="label">Total Investments</div><div class="value positive">${formatCurrency(data.totalInvestments)}</div></div>
  <div class="card"><div class="label">Monthly Income</div><div class="value">${formatCurrency(data.totalIncome)}</div></div>
  <div class="card"><div class="label">Monthly Cash Flow</div><div class="value ${data.monthlyCashFlow >= 0 ? "positive" : "negative"}">${formatCurrency(data.monthlyCashFlow)}</div></div>
  <div class="card"><div class="label">Savings Rate</div><div class="value">${data.savingsRate.toFixed(1)}%</div></div>
  <div class="card"><div class="label">Health Score</div><div class="value">${Math.round(data.healthScore)}/100</div></div>
</div>
</body></html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.period}-financial-report.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const REPORT_TYPES = [
    { value: "MONTHLY", label: "Monthly Report" },
    { value: "QUARTERLY", label: "Quarterly Report" },
    { value: "ANNUAL", label: "Annual Report" },
  ];

  const MONTHS = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: getMonthName(i + 1) }));
  const QUARTERS = [1, 2, 3, 4];
  const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Reports" />
      <div className="flex-1 p-8 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Generator */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-2xl border border-white/8 bg-white/4 p-6">
              <h3 className="font-semibold text-white mb-4">Generate Report</h3>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs text-white/50">Report Type</label>
                  <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                    {REPORT_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-white/50">Year</label>
                  <Select value={String(form.year)} onValueChange={(v) => setForm((f) => ({ ...f, year: Number(v) }))}>
                    {YEARS.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                  </Select>
                </div>
                {form.type === "MONTHLY" && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/50">Month</label>
                    <Select value={String(form.month)} onValueChange={(v) => setForm((f) => ({ ...f, month: Number(v) }))}>
                      {MONTHS.map((m) => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
                    </Select>
                  </div>
                )}
                {form.type === "QUARTERLY" && (
                  <div className="space-y-1.5">
                    <label className="text-xs text-white/50">Quarter</label>
                    <Select value={String(form.quarter)} onValueChange={(v) => setForm((f) => ({ ...f, quarter: Number(v) }))}>
                      {QUARTERS.map((q) => <SelectItem key={q} value={String(q)}>Q{q}</SelectItem>)}
                    </Select>
                  </div>
                )}
                <Button onClick={generate} disabled={generating} className="w-full">
                  {generating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Plus className="mr-2 h-4 w-4" /> Generate</>}
                </Button>
              </div>
            </div>

            {/* Report list */}
            <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
              <h3 className="font-semibold text-white text-sm mb-3">Past Reports</h3>
              {loading ? (
                <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-white/40" /></div>
              ) : reports.length === 0 ? (
                <p className="text-xs text-white/30 text-center py-6">No reports yet</p>
              ) : (
                <div className="space-y-2">
                  {reports.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedReport(r)}
                      className={`w-full rounded-xl p-3 text-left transition-all ${selectedReport?.id === r.id ? "bg-violet-600/20 border border-violet-500/30" : "hover:bg-white/5 border border-transparent"}`}
                    >
                      <p className="text-sm text-white font-medium truncate">{r.title}</p>
                      <p className="text-xs text-white/40">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Report Viewer */}
          <div className="lg:col-span-2">
            {selectedReport ? (
              <div className="rounded-2xl border border-white/8 bg-white/4 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-bold text-white">{selectedReport.title}</h2>
                    <p className="text-xs text-white/40">Generated {new Date(selectedReport.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => exportPDF(selectedReport)}>
                    <Download className="mr-2 h-4 w-4" /> Export HTML
                  </Button>
                </div>

                {selectedReport.content?.data?.[0] ? (
                  (() => {
                    const d = selectedReport.content.data[0];
                    return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          {[
                            { icon: TrendingUp, label: "Net Worth", value: formatCurrency(d.netWorth), color: "text-violet-400" },
                            { icon: DollarSign, label: "Total Assets", value: formatCurrency(d.totalAssets), color: "text-emerald-400" },
                            { icon: BarChart3, label: "Investments", value: formatCurrency(d.totalInvestments), color: "text-blue-400" },
                            { icon: Target, label: "Health Score", value: `${Math.round(d.healthScore)}/100`, color: "text-yellow-400" },
                          ].map(({ icon: Icon, label, value, color }) => (
                            <div key={label} className="rounded-xl border border-white/8 bg-white/4 p-4">
                              <Icon className={`h-4 w-4 ${color} mb-2`} />
                              <p className="text-xs text-white/40">{label}</p>
                              <p className={`font-bold text-sm ${color}`}>{value}</p>
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {[
                            ["Monthly Income", formatCurrency(d.totalIncome)],
                            ["Monthly Expenses", formatCurrency(d.monthlyExpenses)],
                            ["Cash Flow", formatCurrency(d.monthlyCashFlow)],
                            ["Savings Rate", `${d.savingsRate.toFixed(1)}%`],
                            ["Emergency Fund", `${d.emergencyFundMonths.toFixed(1)} months`],
                            ["Debt-to-Asset Ratio", `${d.debtToAssetRatio.toFixed(1)}%`],
                            ["FIRE Progress", `${d.fireProgress.toFixed(1)}%`],
                            ["Credit Card Debt", formatCurrency(d.creditCardDebt)],
                          ].map(([label, value]) => (
                            <div key={label as string} className="flex justify-between rounded-lg bg-white/4 px-3 py-2">
                              <span className="text-white/50 text-xs">{label}</span>
                              <span className="text-white font-medium text-xs">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-white/40 text-sm text-center py-10">No data available for this period.</p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full rounded-2xl border border-white/8 bg-white/4 p-12">
                <FileText className="h-12 w-12 text-white/20 mb-4" />
                <p className="text-white/40 text-sm">Select or generate a report to view it here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
