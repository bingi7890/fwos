import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculate, computeAlerts } from "@/lib/calculations";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") ?? "24");

  const data = await prisma.monthlyData.findMany({
    where: { userId: session.user.id },
    orderBy: [{ year: "desc" }, { month: "desc" }],
    take: limit,
  });

  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const userId = session.user.id;
    const { year, month, notes, ...financialFields } = body;

    const calc = calculate({ ...financialFields, fireTarget: null });

    const prev = await prisma.monthlyData.findFirst({
      where: { userId },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    const dbFields = {
      salary: financialFields.salary,
      otherIncome: financialFields.otherIncome,
      homeValue: financialFields.homeValue,
      otherRealEstate: financialFields.otherRealEstate,
      checkingBalance: financialFields.checkingBalance,
      savingsBalance: financialFields.savingsBalance,
      emergencyFund: financialFields.emergencyFund,
      retirement401k: financialFields.retirement401k,
      ira: financialFields.ira,
      brokerageInv: financialFields.brokerageInv,
      rsus: financialFields.rsus,
      cryptoValue: financialFields.cryptoValue,
      otherAssets: financialFields.otherAssets,
      mortgageBalance: financialFields.mortgageBalance,
      creditCardDebt: financialFields.creditCardDebt,
      studentLoans: financialFields.studentLoans,
      carLoan: financialFields.carLoan,
      otherLoans: financialFields.otherLoans,
      monthlyExpenses: financialFields.monthlyExpenses,
      savingsRate: calc.computedSavingsRate,
      netWorth: calc.netWorth,
      totalAssets: calc.totalAssets,
      totalLiabilities: calc.totalLiabilities,
      totalInvestments: calc.totalInvestments,
      totalIncome: calc.totalIncome,
      monthlyCashFlow: calc.monthlyCashFlow,
      healthScore: calc.healthScore,
      debtToAssetRatio: calc.debtToAssetRatio,
      emergencyFundMonths: calc.emergencyFundMonths,
      fireProgress: calc.fireProgress,
      notes,
    };

    const entry = await prisma.monthlyData.upsert({
      where: { userId_year_month: { userId, year, month } },
      update: dbFields,
      create: { userId, year, month, ...dbFields },
    });

    // Generate alerts
    if (prev) {
      const prevCalc = calculate({ ...prev, fireTarget: null } as any);
      const alerts = computeAlerts(
        { ...entry, ...calc, computedSavingsRate: calc.computedSavingsRate },
        { ...prev, ...prevCalc, computedSavingsRate: prevCalc.computedSavingsRate }
      );

      for (const alert of alerts) {
        const created = await prisma.alert.create({
          data: {
            userId,
            type: alert.type as any,
            title: alert.title,
            message: alert.message,
            severity: alert.severity as any,
          },
        });

        // Send SMS if enabled
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.smsEnabled && user?.phone && process.env.TWILIO_ACCOUNT_SID) {
          try {
            const twilio = require("twilio")(
              process.env.TWILIO_ACCOUNT_SID,
              process.env.TWILIO_AUTH_TOKEN
            );
            await twilio.messages.create({
              body: `FWOS Alert: ${alert.message}`,
              from: process.env.TWILIO_PHONE_NUMBER,
              to: user.phone,
            });
            await prisma.alert.update({ where: { id: created.id }, data: { smsSent: true } });
          } catch {}
        }
      }
    }

    return NextResponse.json(entry);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
