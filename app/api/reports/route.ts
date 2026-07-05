import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMonthName } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const reports = await prisma.report.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return NextResponse.json(reports);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, year, month, quarter } = await req.json();
  const userId = session.user.id;

  let data: any[] = [];
  let title = "";
  let period = "";

  if (type === "MONTHLY") {
    data = await prisma.monthlyData.findMany({
      where: { userId, year, month },
    });
    title = `Monthly Report — ${getMonthName(month)} ${year}`;
    period = `${year}-${String(month).padStart(2, "0")}`;
  } else if (type === "QUARTERLY") {
    const months = [(quarter - 1) * 3 + 1, (quarter - 1) * 3 + 2, quarter * 3];
    data = await prisma.monthlyData.findMany({
      where: { userId, year, month: { in: months } },
      orderBy: { month: "asc" },
    });
    title = `Q${quarter} ${year} Quarterly Report`;
    period = `${year}-Q${quarter}`;
  } else if (type === "ANNUAL") {
    data = await prisma.monthlyData.findMany({
      where: { userId, year },
      orderBy: { month: "asc" },
    });
    title = `${year} Annual Wealth Report`;
    period = String(year);
  }

  const goals = await prisma.goal.findMany({ where: { userId } });

  const report = await prisma.report.create({
    data: {
      userId, type, title, period,
      content: { data, goals, generatedAt: new Date().toISOString() },
    },
  });

  return NextResponse.json(report);
}
