import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculate } from "@/lib/calculations";

export async function GET(req: Request) {
  const secret = new URL(req.url).searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const users = await prisma.user.findMany({
    where: { monthly401kContribution: { gt: 0 } },
    select: { id: true, monthly401kContribution: true, fireTarget: true },
  });

  const results = [];

  for (const user of users) {
    const prev = await prisma.monthlyData.findFirst({
      where: { userId: user.id },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    if (!prev) continue;

    const existing = await prisma.monthlyData.findUnique({
      where: { userId_year_month: { userId: user.id, year, month } },
    });

    const base = existing ?? prev;
    const new401k = base.retirement401k + user.monthly401kContribution;

    const fields = {
      salary: base.salary, otherIncome: base.otherIncome,
      homeValue: base.homeValue, otherRealEstate: base.otherRealEstate,
      checkingBalance: base.checkingBalance, savingsBalance: base.savingsBalance,
      emergencyFund: base.emergencyFund, retirement401k: new401k,
      ira: base.ira, brokerageInv: base.brokerageInv, rsus: base.rsus,
      cryptoValue: base.cryptoValue, otherAssets: base.otherAssets,
      mortgageBalance: base.mortgageBalance, creditCardDebt: base.creditCardDebt,
      studentLoans: base.studentLoans, carLoan: base.carLoan, otherLoans: base.otherLoans,
      monthlyExpenses: base.monthlyExpenses, savingsRate: base.savingsRate,
    };

    const calc = calculate({ ...fields, fireTarget: user.fireTarget ?? null });

    await prisma.monthlyData.upsert({
      where: { userId_year_month: { userId: user.id, year, month } },
      update: {
        retirement401k: new401k,
        netWorth: calc.netWorth, totalAssets: calc.totalAssets,
        totalLiabilities: calc.totalLiabilities, totalInvestments: calc.totalInvestments,
        totalIncome: calc.totalIncome, monthlyCashFlow: calc.monthlyCashFlow,
        healthScore: calc.healthScore, debtToAssetRatio: calc.debtToAssetRatio,
        emergencyFundMonths: calc.emergencyFundMonths, fireProgress: calc.fireProgress,
        savingsRate: calc.computedSavingsRate,
      },
      create: {
        userId: user.id, year, month, notes: "",
        ...fields, retirement401k: new401k,
        netWorth: calc.netWorth, totalAssets: calc.totalAssets,
        totalLiabilities: calc.totalLiabilities, totalInvestments: calc.totalInvestments,
        totalIncome: calc.totalIncome, monthlyCashFlow: calc.monthlyCashFlow,
        healthScore: calc.healthScore, debtToAssetRatio: calc.debtToAssetRatio,
        emergencyFundMonths: calc.emergencyFundMonths, fireProgress: calc.fireProgress,
        savingsRate: calc.computedSavingsRate,
      },
    });

    results.push({ userId: user.id, year, month, added: user.monthly401kContribution, new401k });
  }

  return NextResponse.json({ updated: results.length, results });
}
