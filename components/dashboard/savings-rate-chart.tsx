"use client";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { getMonthShort, formatPercent } from "@/lib/utils";
import type { MonthlyData } from "@/types";

interface Props {
  data: MonthlyData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#0f0f1a]/95 p-3 shadow-xl">
      <p className="text-xs text-white/50 mb-1">{label}</p>
      <p className="text-sm font-semibold text-violet-400">
        Savings Rate: {formatPercent(payload[0].value)}
      </p>
    </div>
  );
};

export function SavingsRateChart({ data }: Props) {
  const chartData = data
    .slice()
    .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month)
    .slice(-12)
    .map((d) => ({
      name: `${getMonthShort(d.month)}`,
      rate: parseFloat(d.savingsRate.toFixed(1)),
    }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="name"
          tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => `${v}%`}
          tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={20} stroke="rgba(124,58,237,0.5)" strokeDasharray="4 4" label={{ value: "20% target", fill: "rgba(124,58,237,0.7)", fontSize: 10 }} />
        <Bar dataKey="rate" fill="#7c3aed" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
