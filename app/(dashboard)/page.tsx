import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { KPICard } from "@/components/dashboard/kpi-card";
import { NetWorthChart } from "@/components/dashboard/net-worth-chart";
import { AssetAllocationChart } from "@/components/dashboard/asset-allocation-chart";
import { SavingsRateChart } from "@/components/dashboard/savings-rate-chart";
import { DebtChart } from "@/components/dashboard/debt-chart";
import { HealthScoreRing } from "@/components/dashboard/health-score-ring";
import {
  TrendingUp, DollarSign, CreditCard, Shield, BarChart3,
  PiggyBank, Home, Wallet, Target, Activity,
} from "lucide-react";
import { formatCurrency, getMonthName } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const allData = await prisma.monthlyData.findMany({
    where: { userId },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  const latest = allData[0];
  const prev = allData[1];

  const hasData = !!latest;
  const now = new Date();

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Dashboard" />
      <div className="flex-1 p-8 space-y-8 animate-fade-in">
        {/* Welcome / CTA */}
        {!hasData && (
          <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-8 text-center">
            <TrendingUp className="h-12 w-12 text-violet-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Welcome to FWOS!</h2>
            <p className="text-white/60 mb-6">Enter your first month of financial data to get started.</p>
            <Link href="/data-entry">
              <Button>Enter Monthly Data</Button>
            </Link>
          </div>
        )}

        {hasData && (
          <>
            {/* Period info */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/40">
                Last updated: {getMonthName(latest.month)} {latest.year}
              </p>
              <Link href="/data-entry">
                <Button variant="outline" size="sm">+ Add {getMonthName(now.getMonth() + 1)} Data</Button>
              </Link>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title="Net Worth"
                value={latest.netWorth}
                change={prev ? latest.netWorth - prev.netWorth : undefined}
                icon={TrendingUp}
                iconColor="text-violet-400"
                compact
              />
              <KPICard
                title="Total Assets"
                value={latest.totalAssets}
                change={prev ? latest.totalAssets - prev.totalAssets : undefined}
                icon={DollarSign}
                iconColor="text-emerald-400"
                compact
              />
              <KPICard
                title="Total Liabilities"
                value={latest.totalLiabilities}
                change={prev ? latest.totalLiabilities - prev.totalLiabilities : undefined}
                icon={Wallet}
                iconColor="text-red-400"
                compact
              />
              <KPICard
                title="Credit Card Debt"
                value={latest.creditCardDebt}
                change={prev ? latest.creditCardDebt - prev.creditCardDebt : undefined}
                icon={CreditCard}
                iconColor="text-orange-400"
                compact
              />
              <KPICard
                title="Emergency Fund"
                value={latest.emergencyFund}
                change={prev ? latest.emergencyFund - prev.emergencyFund : undefined}
                icon={Shield}
                iconColor="text-blue-400"
                subtitle={`${latest.emergencyFundMonths.toFixed(1)} months covered`}
                compact
              />
              <KPICard
                title="Investments"
                value={latest.totalInvestments}
                change={prev ? latest.totalInvestments - prev.totalInvestments : undefined}
                icon={BarChart3}
                iconColor="text-cyan-400"
                compact
              />
              <KPICard
                title="Savings Rate"
                value={latest.savingsRate}
                format="percent"
                change={prev ? latest.savingsRate - prev.savingsRate : undefined}
                icon={PiggyBank}
                iconColor="text-pink-400"
              />
              <KPICard
                title="Monthly Cash Flow"
                value={latest.monthlyCashFlow}
                change={prev ? latest.monthlyCashFlow - prev.monthlyCashFlow : undefined}
                icon={Activity}
                iconColor="text-yellow-400"
                compact
              />
              <KPICard
                title="Mortgage Balance"
                value={latest.mortgageBalance}
                change={prev ? latest.mortgageBalance - prev.mortgageBalance : undefined}
                icon={Home}
                iconColor="text-indigo-400"
                compact
              />
              <KPICard
                title="FIRE Progress"
                value={latest.fireProgress}
                format="percent"
                change={prev ? latest.fireProgress - prev.fireProgress : undefined}
                icon={Target}
                iconColor="text-rose-400"
              />
            </div>

            {/* Charts row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Net Worth Growth */}
              <div className="lg:col-span-2 rounded-2xl border border-white/8 bg-white/4 p-6">
                <h3 className="text-sm font-semibold text-white mb-1">Net Worth Growth</h3>
                <p className="text-xs text-white/40 mb-4">Assets vs. liabilities over time</p>
                <div className="h-56">
                  <NetWorthChart data={allData as any} />
                </div>
              </div>

              {/* Health Score + Asset Allocation */}
              <div className="rounded-2xl border border-white/8 bg-white/4 p-6">
                <h3 className="text-sm font-semibold text-white mb-4">Health Score</h3>
                <HealthScoreRing score={latest.healthScore} size={140} />
                <div className="mt-4 space-y-2">
                  {[
                    { label: "Savings Rate", value: `${latest.savingsRate.toFixed(1)}%`, good: latest.savingsRate >= 20 },
                    { label: "Emergency Fund", value: `${latest.emergencyFundMonths.toFixed(1)} mo`, good: latest.emergencyFundMonths >= 6 },
                    { label: "Debt Ratio", value: `${latest.debtToAssetRatio.toFixed(1)}%`, good: latest.debtToAssetRatio <= 40 },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-xs">
                      <span className="text-white/50">{item.label}</span>
                      <span className={item.good ? "text-emerald-400" : "text-yellow-400"}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Charts row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-white/8 bg-white/4 p-6">
                <h3 className="text-sm font-semibold text-white mb-1">Asset Allocation</h3>
                <p className="text-xs text-white/40 mb-4">Portfolio breakdown by type</p>
                <div className="h-52">
                  <AssetAllocationChart data={latest as any} />
                </div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 p-6">
                <h3 className="text-sm font-semibold text-white mb-1">Savings Rate Trend</h3>
                <p className="text-xs text-white/40 mb-4">Last 12 months</p>
                <div className="h-52">
                  <SavingsRateChart data={allData as any} />
                </div>
              </div>
            </div>

            {/* Debt Chart */}
            <div className="rounded-2xl border border-white/8 bg-white/4 p-6">
              <h3 className="text-sm font-semibold text-white mb-1">Debt Reduction</h3>
              <p className="text-xs text-white/40 mb-4">Mortgage and credit card balances over time</p>
              <div className="h-52">
                <DebtChart data={allData as any} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
