import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = await bcrypt.hash("password123", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@fwos.app" },
    update: {},
    create: { email: "demo@fwos.app", name: "Demo User", password: hash },
  });

  // Seed 12 months of sample data
  const base = {
    salary: 12000, otherIncome: 1500,
    homeValue: 500000, mortgageBalance: 380000,
    checkingBalance: 8000, savingsBalance: 25000, emergencyFund: 30000,
    retirement401k: 90000, ira: 35000, brokerageInv: 45000,
    rsus: 15000, cryptoValue: 5000, otherAssets: 10000,
    creditCardDebt: 2000, studentLoans: 0, carLoan: 8000, otherLoans: 0,
    otherRealEstate: 0, monthlyExpenses: 7500,
  };

  for (let i = 0; i < 12; i++) {
    const d = new Date(2026, i - 11, 1);
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    const growth = 1 + i * 0.02;
    const fields = {
      ...base,
      retirement401k: Math.round(base.retirement401k * growth),
      ira: Math.round(base.ira * growth),
      brokerageInv: Math.round(base.brokerageInv * growth),
      mortgageBalance: Math.round(base.mortgageBalance - i * 300),
      creditCardDebt: Math.max(0, base.creditCardDebt - i * 100),
      emergencyFund: Math.round(base.emergencyFund + i * 500),
      checkingBalance: Math.round(base.checkingBalance + (Math.random() - 0.5) * 2000),
    };
    const totalAssets = fields.homeValue + fields.checkingBalance + fields.savingsBalance +
      fields.emergencyFund + fields.retirement401k + fields.ira + fields.brokerageInv +
      fields.rsus + fields.cryptoValue + fields.otherAssets;
    const totalLiabilities = fields.mortgageBalance + fields.creditCardDebt + fields.carLoan;
    const totalInvestments = fields.retirement401k + fields.ira + fields.brokerageInv + fields.rsus + fields.cryptoValue;
    const totalIncome = fields.salary + fields.otherIncome;
    const monthlyCashFlow = totalIncome - fields.monthlyExpenses;
    const netWorth = totalAssets - totalLiabilities;
    const savingsRate = (monthlyCashFlow / totalIncome) * 100;

    await prisma.monthlyData.upsert({
      where: { userId_year_month: { userId: user.id, year, month } },
      update: {},
      create: {
        userId: user.id, year, month,
        ...fields,
        totalAssets, totalLiabilities, totalInvestments, totalIncome,
        monthlyCashFlow, netWorth,
        savingsRate: parseFloat(savingsRate.toFixed(2)),
        debtToAssetRatio: parseFloat(((totalLiabilities / totalAssets) * 100).toFixed(2)),
        emergencyFundMonths: parseFloat((fields.emergencyFund / fields.monthlyExpenses).toFixed(2)),
        fireProgress: parseFloat(((totalInvestments / (fields.monthlyExpenses * 12 * 25)) * 100).toFixed(2)),
        healthScore: 72,
      },
    });
  }

  await prisma.goal.createMany({
    data: [
      { userId: user.id, name: "Become a Millionaire", type: "MILLIONAIRE", targetAmount: 1000000, currentAmount: 460000 },
      { userId: user.id, name: "Pay Off Credit Cards", type: "PAY_OFF_DEBT", targetAmount: 2000, currentAmount: 1200 },
      { userId: user.id, name: "Retirement by 55", type: "RETIREMENT", targetAmount: 2500000, currentAmount: 185000 },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ Seeded demo user: demo@fwos.app / password123`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
