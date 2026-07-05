"use client";
import { getHealthScoreLabel } from "@/lib/calculations";

interface Props {
  score: number;
  size?: number;
}

export function HealthScoreRing({ score, size = 120 }: Props) {
  const { label, color } = getHealthScoreLabel(score);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - score / 100);

  const strokeColor =
    score >= 80 ? "#34d399" :
    score >= 65 ? "#60a5fa" :
    score >= 50 ? "#fbbf24" :
    score >= 35 ? "#fb923c" :
    "#f87171";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
        <text x="50" y="46" textAnchor="middle" fill="white" fontSize="18" fontWeight="700">
          {Math.round(score)}
        </text>
        <text x="50" y="60" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">
          / 100
        </text>
      </svg>
      <div>
        <p className={`text-center text-sm font-semibold ${color}`}>{label}</p>
        <p className="text-center text-xs text-white/40">Financial Health Score</p>
      </div>
    </div>
  );
}
