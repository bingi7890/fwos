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
    const { computedSavingsRate, ...dbCalcFields } = calc;

    const prev = await prisma.monthlyData.findFirst({
      where: { userId },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    const entry = await prisma.monthlyData.upsert({
      where: { userId_year_month: { userId, year, month } },
      update: {
        ...financialFields,
        ...dbCalcFields,
        savingsRate: computedSavingsRate,
        notes,
      },
      create: {
        userId, year, month, notes,
        ...financialFields,
        ...dbCalcFields,
        savingsRate: computedSavingsRate,
      },
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
