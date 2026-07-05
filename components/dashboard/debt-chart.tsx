"use client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { formatCurrency, getMonthShort } from "@/lib/utils";
import type { MonthlyData } from "@/types";

interface Props {
  data: MonthlyData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#0f0f1a]/95 p-3 shadow-xl">
      <p className="text-xs text-white/50 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-sm font-semibold" style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

export function DebtChart({ data }: Props) {
  const chartData = data
    .slice()
    .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)
    .map((d) => ({
      name: `${getMonthShort(d.month)} ${d.year}`,
      mortgage: d.mortgageBalance,
      creditCard: d.creditCardDebt,
      other: d.studentLoans + d.carLoan + d.otherLoans,
    }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <defs>
          <linearGradient id="mortgageGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="ccGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={(v) => formatCurrency(v, true)} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="mortgage" name="Mortgage" stroke="#3b82f6" strokeWidth={1.5} fill="url(#mortgageGrad)" />
        <Area type="monotone" dataKey="creditCard" name="Credit Card" stroke="#ef4444" strokeWidth={1.5} fill="url(#ccGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
