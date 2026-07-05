import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message, context } = await req.json();

  const recentData = await prisma.monthlyData.findMany({
    where: { userId: session.user.id },
    orderBy: [{ year: "desc" }, { month: "desc" }],
    take: 3,
  });

  const goals = await prisma.goal.findMany({
    where: { userId: session.user.id, isCompleted: false },
  });

  const financialContext =
    recentData.length > 0
      ? `Recent financial data (most recent first):
${recentData
  .map(
    (d) =>
      `${d.month}/${d.year}: Net Worth=$${d.netWorth.toLocaleString()}, Assets=$${d.totalAssets.toLocaleString()}, Liabilities=$${d.totalLiabilities.toLocaleString()}, Investments=$${d.totalInvestments.toLocaleString()}, Savings Rate=${d.savingsRate.toFixed(1)}%, Emergency Fund=${d.emergencyFundMonths.toFixed(1)} months, Health Score=${d.healthScore}/100, Cash Flow=$${d.monthlyCashFlow.toLocaleString()}/mo`
  )
  .join("\n")}

Active goals: ${goals.map((g) => `${g.name} (${((g.currentAmount / g.targetAmount) * 100).toFixed(1)}% complete)`).join(", ") || "None"}`
      : "No financial data entered yet.";

  const systemPrompt = `You are a helpful personal financial advisor AI for the Family Wealth Operating System (FWOS). 

IMPORTANT RULES:
- You ONLY interpret and explain financial data. You NEVER calculate financial metrics yourself.
- All financial calculations (net worth, savings rate, etc.) are done by the application's deterministic engine.
- Provide clear, actionable, personalized advice based on the data.
- Be encouraging but honest about areas needing improvement.
- Focus on practical next steps, not just observations.
- Keep responses concise and well-structured.

User's financial snapshot:
${financialContext}`;

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "your-openai-api-key") {
    return NextResponse.json({
      reply: `I'd love to help analyze your finances! However, the AI advisor requires an OpenAI API key to be configured. 

Based on your data, here are some general tips:
• Aim for a 20%+ savings rate for strong wealth building
• Keep 3-6 months expenses in your emergency fund  
• Maximize 401(k) contributions, especially if your employer matches
• Pay off high-interest credit card debt first
• Track your net worth monthly to stay motivated

Please add your OPENAI_API_KEY to .env.local to enable full AI analysis.`,
    });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      ...(context ?? []),
      { role: "user", content: message },
    ],
    max_tokens: 600,
    temperature: 0.7,
  });

  return NextResponse.json({
    reply: completion.choices[0].message.content,
  });
}
