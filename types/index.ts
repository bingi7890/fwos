export interface MonthlyData {
  id: string;
  userId: string;
  year: number;
  month: number;
  salary: number;
  otherIncome: number;
  homeValue: number;
  otherRealEstate: number;
  checkingBalance: number;
  savingsBalance: number;
  emergencyFund: number;
  retirement401k: number;
  ira: number;
  brokerageInv: number;
  rsus: number;
  cryptoValue: number;
  otherAssets: number;
  mortgageBalance: number;
  creditCardDebt: number;
  studentLoans: number;
  carLoan: number;
  otherLoans: number;
  monthlyExpenses: number;
  savingsRate: number;
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  totalInvestments: number;
  totalIncome: number;
  monthlyCashFlow: number;
  healthScore: number;
  debtToAssetRatio: number;
  emergencyFundMonths: number;
  fireProgress: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  type: GoalType;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string | null;
  description?: string | null;
  isCompleted: boolean;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  id: string;
  userId: string;
  type: AlertType;
  title: string;
  message: string;
  severity: AlertSeverity;
  isRead: boolean;
  smsSent: boolean;
  createdAt: string;
}

export type GoalType =
  | "MILLIONAIRE"
  | "EMERGENCY_FUND"
  | "PAY_OFF_DEBT"
  | "BUY_HOME"
  | "RETIREMENT"
  | "EDUCATION"
  | "VACATION"
  | "CUSTOM";

export type AlertType =
  | "CREDIT_CARD_INCREASED"
  | "SAVINGS_RATE_DECREASED"
  | "NET_WORTH_DROPPED"
  | "EMERGENCY_FUND_LOW"
  | "INVESTMENT_MISSED"
  | "GOAL_COMPLETED"
  | "UPDATE_OVERDUE"
  | "NET_WORTH_MILESTONE"
  | "FIRE_PROGRESS";

export type AlertSeverity = "INFO" | "WARNING" | "SUCCESS" | "ERROR";
