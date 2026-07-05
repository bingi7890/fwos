"use client";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import type { MonthlyData } from "@/types";

interface Props {
  data: MonthlyData;
}

const COLORS = ["#7c3aed", "#10b981", "#3b82f6", "#f59e0b", "#ec4899", "#06b6d4"];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#0f0f1a]/95 p-3 shadow-xl">
      <p className="text-sm font-semibold text-white">{payload[0].name}</p>
      <p className="text-sm text-white/70">{formatCurrency(payload[0].value)}</p>
      <p className="text-xs text-white/40">{payload[0].payload.pct}% of portfolio</p>
    </div>
  );
};

export function AssetAllocationChart({ data }: Props) {
  const segments = [
    { name: "Real Estate", value: data.homeValue + data.otherRealEstate },
    { name: "Retirement", value: data.retirement401k + data.ira },
    { name: "Brokerage", value: data.brokerageInv + data.rsus },
    { name: "Cash", value: data.checkingBalance + data.savingsBalance + data.emergencyFund },
    { name: "Crypto", value: data.cryptoValue },
    { name: "Other", value: data.otherAssets },
  ]
    .filter((s) => s.value > 0)
    .map((s) => ({
      ...s,
      pct: data.totalAssets > 0 ? ((s.value / data.totalAssets) * 100).toFixed(1) : "0",
    }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={segments}
          cx="50%"
          cy="45%"
          innerRadius="55%"
          outerRadius="75%"
          paddingAngle={3}
          dataKey="value"
        >
          {segments.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(v) => <span className="text-xs text-white/60">{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
