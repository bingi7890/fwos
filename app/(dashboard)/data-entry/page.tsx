"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectItem } from "@/components/ui/select";
import { Loader2, Save, CheckCircle2 } from "lucide-react";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

interface FormData {
  year: number; month: number;
  salary: string; otherIncome: string;
  homeValue: string; otherRealEstate: string;
  checkingBalance: string; savingsBalance: string; emergencyFund: string;
  retirement401k: string; ira: string; brokerageInv: string; rsus: string; cryptoValue: string; otherAssets: string;
  mortgageBalance: string; creditCardDebt: string; studentLoans: string; carLoan: string; otherLoans: string;
  monthlyExpenses: string; savingsRate: string; notes: string;
}

const emptyForm: FormData = {
  year: CURRENT_YEAR, month: new Date().getMonth() + 1,
  salary: "", otherIncome: "",
  homeValue: "", otherRealEstate: "",
  checkingBalance: "", savingsBalance: "", emergencyFund: "",
  retirement401k: "", ira: "", brokerageInv: "", rsus: "", cryptoValue: "", otherAssets: "",
  mortgageBalance: "", creditCardDebt: "", studentLoans: "", carLoan: "", otherLoans: "",
  monthlyExpenses: "", savingsRate: "", notes: "",
};

const sections = [
  {
    title: "Income",
    color: "emerald",
    fields: [
      { key: "salary", label: "Monthly Salary (Gross)", placeholder: "8,500" },
      { key: "otherIncome", label: "Other Income (side income, rental, etc.)", placeholder: "1,200" },
    ],
  },
  {
    title: "Assets — Real Estate",
    color: "blue",
    fields: [
      { key: "homeValue", label: "Primary Home Value", placeholder: "450,000" },
      { key: "otherRealEstate", label: "Other Real Estate", placeholder: "0" },
    ],
  },
  {
    title: "Assets — Cash & Savings",
    color: "cyan",
    fields: [
      { key: "checkingBalance", label: "Checking Account Balance", placeholder: "5,000" },
      { key: "savingsBalance", label: "Savings Account Balance", placeholder: "15,000" },
      { key: "emergencyFund", label: "Emergency Fund", placeholder: "20,000" },
    ],
  },
  {
    title: "Assets — Investments",
    color: "violet",
    fields: [
      { key: "retirement401k", label: "401(k) Balance", placeholder: "85,000" },
      { key: "ira", label: "IRA Balance", placeholder: "25,000" },
      { key: "brokerageInv", label: "Brokerage Investments", placeholder: "30,000" },
      { key: "rsus", label: "RSUs / Stock Options Value", placeholder: "10,000" },
      { key: "cryptoValue", label: "Cryptocurrency Value", placeholder: "5,000" },
      { key: "otherAssets", label: "Other Assets (vehicle, collectibles, etc.)", placeholder: "8,000" },
    ],
  },
  {
    title: "Liabilities",
    color: "red",
    fields: [
      { key: "mortgageBalance", label: "Mortgage Balance", placeholder: "380,000" },
      { key: "creditCardDebt", label: "Credit Card Debt (total)", placeholder: "0" },
      { key: "studentLoans", label: "Student Loans", placeholder: "0" },
      { key: "carLoan", label: "Car Loan", placeholder: "0" },
      { key: "otherLoans", label: "Other Loans", placeholder: "0" },
    ],
  },
  {
    title: "Monthly Expenses",
    color: "yellow",
    fields: [
      { key: "monthlyExpenses", label: "Total Monthly Expenses", placeholder: "5,500" },
      { key: "savingsRate", label: "Savings Rate % (leave 0 to auto-calculate)", placeholder: "0" },
    ],
  },
];

export default function DataEntryPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function handleChange(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function numVal(v: string) {
    return parseFloat(v.replace(/,/g, "")) || 0;
  }

  const totalAssets =
    numVal(form.homeValue) + numVal(form.otherRealEstate) +
    numVal(form.checkingBalance) + numVal(form.savingsBalance) + numVal(form.emergencyFund) +
    numVal(form.retirement401k) + numVal(form.ira) + numVal(form.brokerageInv) +
    numVal(form.rsus) + numVal(form.cryptoValue) + numVal(form.otherAssets);

  const totalLiabilities =
    numVal(form.mortgageBalance) + numVal(form.creditCardDebt) +
    numVal(form.studentLoans) + numVal(form.carLoan) + numVal(form.otherLoans);

  const netWorth = totalAssets - totalLiabilities;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) =>
          k === "notes" || k === "year" || k === "month"
            ? [k, k === "notes" ? v : Number(v)]
            : [k, numVal(v as string)]
        )
      );
      const res = await fetch("/api/financial-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setSuccess(true);
      setTimeout(() => router.push("/"), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const colorMap: Record<string, string> = {
    emerald: "border-emerald-500/30 bg-emerald-500/5",
    blue: "border-blue-500/30 bg-blue-500/5",
    cyan: "border-cyan-500/30 bg-cyan-500/5",
    violet: "border-violet-500/30 bg-violet-500/5",
    red: "border-red-500/30 bg-red-500/5",
    yellow: "border-yellow-500/30 bg-yellow-500/5",
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Monthly Data Entry" />
      <div className="flex-1 p-8 max-w-4xl mx-auto w-full animate-fade-in">
        {success ? (
          <div className="flex flex-col items-center justify-center gap-4 py-32">
            <CheckCircle2 className="h-16 w-16 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Data Saved!</h2>
            <p className="text-white/50">Redirecting to dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Period Selector */}
            <div className="rounded-2xl border border-white/8 bg-white/4 p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Financial Period</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Month</Label>
                  <Select
                    value={String(form.month)}
                    onValueChange={(v) => handleChange("month", v)}
                  >
                    {MONTHS.map((m, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Select
                    value={String(form.year)}
                    onValueChange={(v) => handleChange("year", v)}
                  >
                    {YEARS.map((y) => (
                      <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            {/* Live Preview */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Total Assets", value: totalAssets, color: "text-emerald-400" },
                { label: "Total Liabilities", value: totalLiabilities, color: "text-red-400" },
                { label: "Net Worth", value: netWorth, color: netWorth >= 0 ? "text-violet-400" : "text-red-400" },
              ].map(({ label, value, color }) => (
                <div key={label} className="rounded-xl border border-white/8 bg-white/4 p-4 text-center">
                  <p className="text-xs text-white/40 mb-1">{label}</p>
                  <p className={`text-lg font-bold ${color}`}>
                    {value < 0 ? "-" : ""}${Math.abs(value).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Data Sections */}
            {sections.map((section) => (
              <div
                key={section.title}
                className={`rounded-2xl border p-6 ${colorMap[section.color]}`}
              >
                <h3 className="text-sm font-semibold text-white mb-4">{section.title}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {section.fields.map(({ key, label, placeholder }) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key}>{label}</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-white/30 text-sm">$</span>
                        <Input
                          id={key}
                          type="text"
                          inputMode="decimal"
                          placeholder={placeholder}
                          className="pl-7"
                          value={form[key as keyof FormData] as string}
                          onChange={(e) => handleChange(key, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Notes */}
            <div className="rounded-2xl border border-white/8 bg-white/4 p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Notes (optional)</h3>
              <Textarea
                placeholder="Any notes about this month's finances..."
                value={form.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-4 py-3">{error}</p>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="mr-2 h-4 w-4" /> Save Monthly Data</>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/")}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
