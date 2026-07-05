# FWOS — Family Wealth Operating System

Modern, privacy-first personal finance management. No bank logins. No account numbers. Only summary values.

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Edit `.env.local` (already created):
```
DATABASE_URL="postgresql://user:password@host:5432/fwos"
NEXTAUTH_SECRET="generate-a-random-string"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="sk-..."          # optional: for AI advisor
TWILIO_ACCOUNT_SID="AC..."       # optional: for SMS alerts
TWILIO_AUTH_TOKEN="..."
TWILIO_PHONE_NUMBER="+1..."
```

### 3. Set up the database
```bash
# Push schema to your database
npx prisma migrate dev --name init

# (Optional) Seed demo data
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

### 4. Run the app
```bash
npm run dev
```

Visit http://localhost:3000

## Demo Account (after seeding)
- Email: `demo@fwos.app`
- Password: `password123`

## Features
- **Dashboard** — Net worth, assets, liabilities, investments, FIRE progress, health score
- **Monthly Entry** — Enter financial summaries; all metrics auto-calculated
- **Goals** — Track millionaire, retirement, emergency fund, debt payoff, and custom goals  
- **AI Advisor** — GPT-powered analysis (never calculates, only interprets)
- **Reports** — Monthly / quarterly / annual reports with HTML export
- **Alerts** — Auto-generated alerts for credit card spikes, net worth drops, etc.
- **SMS Notifications** — Twilio integration for real-time financial alerts

## Deployment

### Frontend + API (Vercel)
1. Push to GitHub
2. Import to Vercel
3. Add environment variables

### Database (Supabase / Railway)
1. Create a PostgreSQL database
2. Set `DATABASE_URL` in Vercel env vars
3. Run `npx prisma migrate deploy`

## Tech Stack
- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS 4** + custom dark theme
- **Recharts** — Interactive charts
- **Prisma 7** + PostgreSQL
- **NextAuth v5** — Email/password auth
- **OpenAI** — AI analysis only
- **Twilio** — SMS notifications
