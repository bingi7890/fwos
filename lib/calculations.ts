export interface FinancialInput {
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
  fireTarget?: number | null;
}

export interface FinancialCalculations {
  totalIncome: number;
  totalAssets: number;
  totalLiabilities: number;
  totalInvestments: number;
  netWorth: number;
  monthlyCashFlow: number;
  debtToAssetRatio: number;
  emergencyFundMonths: number;
  fireProgress: number;
  healthScore: number;
  computedSavingsRate: number;
  liquidAssets: number;
  retirementAssets: number;
  realEstateValue: number;
}

export function calculate(input: FinancialInput): FinancialCalculations {
  const totalIncome = input.salary + input.otherIncome;

  const liquidAssets =
    input.checkingBalance + input.savingsBalance + input.emergencyFund;

  const retirementAssets =
    input.retirement401k + input.ira + input.brokerageInv + input.rsus;

  const realEstateValue = input.homeValue + input.otherRealEstate;

  const totalInvestments =
    input.retirement401k 
    + input.ira 
    + input.brokerageInv 
    + input.rsus 
    + input.cryptoValue;

  const totalAssets =
    liquidAssets +
    retirementAssets +
    realEstateValue +
    input.cryptoValue +
    input.otherAssets;

  const totalLiabilities =
    input.mortgageBalance +
    input.creditCardDebt +
    input.studentLoans +
    input.carLoan +
    input.otherLoans;

  const netWorth = totalAssets - totalLiabilities;

  const monthlyCashFlow = totalIncome - input.monthlyExpenses;

  const debtToAssetRatio =
    totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

  const emergencyFundMonths =
    input.monthlyExpenses > 0
      ? input.emergencyFund / input.monthlyExpenses
      : 0;

  const computedSavingsRate =
    totalIncome > 0
      ? input.savingsRate > 0
        ? input.savingsRate
        : (monthlyCashFlow / totalIncome) * 100
      : 0;

  // FIRE: 25x annual expenses rule (4% withdrawal rate)
  const annualExpenses = input.monthlyExpenses * 12;
  const fireNumber = annualExpenses * 25;
  const fireTarget = input.fireTarget ?? fireNumber;
  const fireProgress =
    fireTarget > 0 ? Math.min((totalInvestments / fireTarget) * 100, 100) : 0;

  const healthScore = computeHealthScore({
    savingsRate: computedSavingsRate,
    emergencyFundMonths,
    debtToAssetRatio,
    creditCardDebt: input.creditCardDebt,
    netWorth,
    monthlyCashFlow,
    hasInvestments: totalInvestments > 0,
  });

  return {
    totalIncome,
    totalAssets,
    totalLiabilities,
    totalInvestments,
    netWorth,
    monthlyCashFlow,
    debtToAssetRatio,
    emergencyFundMonths,
    fireProgress,
    healthScore,
    computedSavingsRate,
    liquidAssets,
    retirementAssets,
    realEstateValue,
  };
}

function computeHealthScore(params: {
  savingsRate: number;
  emergencyFundMonths: number;
  debtToAssetRatio: number;
  creditCardDebt: number;
  netWorth: number;
  monthlyCashFlow: number;
  hasInvestments: boolean;
}): number {
  let score = 0;

  // Savings rate (25 pts): 20%+ = full
  if (params.savingsRate >= 20) score += 25;
  else if (params.savingsRate >= 10) score += 15;
  else if (params.savingsRate >= 5) score += 8;
  else if (params.savingsRate > 0) score += 3;

  // Emergency fund (20 pts): 6+ months = full
  if (params.emergencyFundMonths >= 6) score += 20;
  else if (params.emergencyFundMonths >= 3) score += 12;
  else if (params.emergencyFundMonths >= 1) score += 6;

  // Debt ratio (20 pts): lower is better
  if (params.debtToAssetRatio <= 20) score += 20;
  else if (params.debtToAssetRatio <= 40) score += 14;
  else if (params.debtToAssetRatio <= 60) score += 8;
  else if (params.debtToAssetRatio <= 80) score += 3;

  // No credit card debt (15 pts)
  if (params.creditCardDebt === 0) score += 15;
  else if (params.creditCardDebt < 1000) score += 8;
  else if (params.creditCardDebt < 5000) score += 4;

  // Positive net worth (10 pts)
  if (params.netWorth > 100000) score += 10;
  else if (params.netWorth > 0) score += 6;
  else if (params.netWorth > -10000) score += 2;

  // Positive cash flow (5 pts)
  if (params.monthlyCashFlow > 0) score += 5;

  // Has investments (5 pts)
  if (params.hasInvestments) score += 5;

  return Math.min(Math.round(score), 100);
}

export function getHealthScoreLabel(score: number): {
  label: string;
  color: string;
} {
  if (score >= 80) return { label: "Excellent", color: "text-emerald-400" };
  if (score >= 65) return { label: "Good", color: "text-blue-400" };
  if (score >= 50) return { label: "Fair", color: "text-yellow-400" };
  if (score >= 35) return { label: "Needs Work", color: "text-orange-400" };
  return { label: "Critical", color: "text-red-400" };
}

export function computeAlerts(
  current: FinancialInput & FinancialCalculations,
  previous?: FinancialInput & FinancialCalculations
): Array<{ type: string; title: string; message: string; severity: string }> {
  const alerts: Array<{ type: string; title: string; message: string; severity: string }> = [];

  if (!previous) return alerts;

  const netWorthChange = current.netWorth - previous.netWorth;
  const creditCardChange = current.creditCardDebt - previous.creditCardDebt;
  const savingsRateChange =
    current.computedSavingsRate - previous.computedSavingsRate;

  if (creditCardChange > 500) {
    alerts.push({
      type: "CREDIT_CARD_INCREASED",
      title: "Credit Card Balance Increased",
      message: `Your credit card balance increased by $${creditCardChange.toLocaleString()} this month.`,
      severity: "WARNING",
    });
  }

  if (savingsRateChange < -5) {
    alerts.push({
      type: "SAVINGS_RATE_DECREASED",
      title: "Savings Rate Dropped",
      message: `Your savings rate decreased by ${Math.abs(savingsRateChange).toFixed(1)}% to ${current.computedSavingsRate.toFixed(1)}%.`,
      severity: "WARNING",
    });
  }

  if (netWorthChange < -2000) {
    alerts.push({
      type: "NET_WORTH_DROPPED",
      title: "Net Worth Decreased",
      message: `Your net worth decreased by $${Math.abs(netWorthChange).toLocaleString()} this month.`,
      severity: "ERROR",
    });
  } else if (netWorthChange > 0) {
    alerts.push({
      type: "NET_WORTH_MILESTONE",
      title: "Net Worth Increased",
      message: `Your net worth increased by $${netWorthChange.toLocaleString()} this month! Keep it up.`,
      severity: "SUCCESS",
    });
  }

  if (current.emergencyFundMonths < 3) {
    alerts.push({
      type: "EMERGENCY_FUND_LOW",
      title: "Emergency Fund Below Target",
      message: `Your emergency fund covers only ${current.emergencyFundMonths.toFixed(1)} months of expenses. Target: 6 months.`,
      severity: "WARNING",
    });
  }

  return alerts;
}
