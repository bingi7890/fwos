-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('MILLIONAIRE', 'EMERGENCY_FUND', 'PAY_OFF_DEBT', 'BUY_HOME', 'RETIREMENT', 'EDUCATION', 'VACATION', 'CUSTOM');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('CREDIT_CARD_INCREASED', 'SAVINGS_RATE_DECREASED', 'NET_WORTH_DROPPED', 'EMERGENCY_FUND_LOW', 'INVESTMENT_MISSED', 'GOAL_COMPLETED', 'UPDATE_OVERDUE', 'NET_WORTH_MILESTONE', 'FIRE_PROGRESS');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'WARNING', 'SUCCESS', 'ERROR');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('MONTHLY', 'QUARTERLY', 'ANNUAL', 'GOAL_PROGRESS');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "phone" TEXT,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "fireTarget" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "sessions" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "monthly_data" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "salary" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherIncome" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "homeValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherRealEstate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "checkingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "savingsBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "emergencyFund" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "retirement401k" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ira" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "brokerageInv" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rsus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cryptoValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherAssets" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "mortgageBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "creditCardDebt" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "studentLoans" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "carLoan" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "otherLoans" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthlyExpenses" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "savingsRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netWorth" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalAssets" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalLiabilities" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalInvestments" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalIncome" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "monthlyCashFlow" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "healthScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "debtToAssetRatio" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "emergencyFundMonths" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fireProgress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "monthly_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "GoalType" NOT NULL,
    "targetAmount" DOUBLE PRECISION NOT NULL,
    "currentAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "targetDate" TIMESTAMP(3),
    "description" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL DEFAULT 'INFO',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "smsSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "title" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "monthly_data_userId_year_month_key" ON "monthly_data"("userId", "year", "month");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "monthly_data" ADD CONSTRAINT "monthly_data_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
