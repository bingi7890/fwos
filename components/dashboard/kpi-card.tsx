import { cn, formatCurrency, formatPercent } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: number;
  format?: "currency" | "percent" | "number" | "months" | "score";
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  subtitle?: string;
  className?: string;
  compact?: boolean;
}

export function KPICard({
  title,
  value,
  format = "currency",
  change,
  changeLabel,
  icon: Icon,
  iconColor = "text-violet-400",
  subtitle,
  className,
  compact = false,
}: KPICardProps) {
  const formattedValue = () => {
    switch (format) {
      case "currency": return formatCurrency(value, compact);
      case "percent": return formatPercent(value);
      case "number": return value.toLocaleString();
      case "months": return `${value.toFixed(1)} mo`;
      case "score": return `${Math.round(value)}/100`;
      default: return value.toString();
    }
  };

  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div
      className={cn(
        "group relative rounded-2xl border border-white/8 bg-white/4 p-6 backdrop-blur-sm transition-all hover:bg-white/6 hover:border-white/12",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-white/8", iconColor.replace("text-", "bg-").replace("400", "400/10"))}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
        {change !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
              isPositive ? "bg-emerald-400/10 text-emerald-400" :
              isNegative ? "bg-red-400/10 text-red-400" :
              "bg-white/10 text-white/50"
            )}
          >
            {isPositive ? <TrendingUp className="h-3 w-3" /> :
             isNegative ? <TrendingDown className="h-3 w-3" /> :
             <Minus className="h-3 w-3" />}
            {format === "currency"
              ? formatCurrency(Math.abs(change), true)
              : format === "percent"
              ? formatPercent(Math.abs(change))
              : Math.abs(change).toFixed(1)}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium text-white/40 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-white">{formattedValue()}</p>
        {(subtitle || changeLabel) && (
          <p className="text-xs text-white/40">{subtitle ?? changeLabel}</p>
        )}
      </div>
    </div>
  );
}
