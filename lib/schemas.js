import { z } from "zod";

// ─────────────────────────────────────────────
// Company Identity — output of entity resolution
// ─────────────────────────────────────────────
export const CompanyIdentitySchema = z.object({
  name: z.string().describe("Full legal company name"),
  ticker: z.string().describe("Ticker symbol including exchange suffix (e.g. INFY.NS)"),
  exchange: z.string().describe("Stock exchange (e.g. NSE, NASDAQ, NYSE)"),
  sector: z.string().describe("Business sector"),
  industry: z.string().default("").describe("Business industry"),
  description: z.string().default("").describe("Brief company description"),
  currency: z.string().default("USD").describe("Reporting currency (USD, INR, EUR, etc.)"),
});

// ─────────────────────────────────────────────
// Financial Data — from FMP API
// ─────────────────────────────────────────────
export const SectorAveragesSchema = z.object({
  peRatio: z.number().nullable(),
  netMargin: z.number().nullable(),
  debtToEquity: z.number().nullable(),
});

export const FinancialDataSchema = z.object({
  // Valuation
  marketCap: z.number().nullable(),
  peRatio: z.number().nullable(),
  pbRatio: z.number().nullable(),

  // Profitability
  revenue: z.number().nullable(),
  revenueGrowthYoY: z.number().nullable(),
  netIncome: z.number().nullable(),
  grossMargin: z.number().nullable(),
  netMargin: z.number().nullable(),
  returnOnEquity: z.number().nullable(),

  // Health
  debtToEquity: z.number().nullable(),
  currentRatio: z.number().nullable(),
  freeCashFlow: z.number().nullable(),

  // Context
  sectorAverages: SectorAveragesSchema.nullable().default(null),

  // Metadata
  source: z.string().default("Financial Modeling Prep"),
  dataAsOf: z.string().default(""),
});

// ─────────────────────────────────────────────
// News Data — from Tavily API
// ─────────────────────────────────────────────
export const NewsItemSchema = z.object({
  headline: z.string(),
  summary: z.string().default(""),
  source: z.string().default("Unknown"),
  publishedAt: z.string().default(""),
  url: z.string().default(""),
  sentiment: z.enum(["positive", "negative", "neutral"]).default("neutral"),
});

export const NewsDataSchema = z.object({
  items: z.array(NewsItemSchema),
  overallSentiment: z
    .enum(["positive", "negative", "mixed", "neutral"])
    .default("neutral"),
  source: z.string().default("Tavily"),
  searchedAt: z.string().default(""),
});

// ─────────────────────────────────────────────
// Signals — computed deterministically in code
// ─────────────────────────────────────────────
export const SignalSchema = z.object({
  name: z.string().describe("Human-readable signal name"),
  category: z
    .enum(["growth", "profitability", "leverage", "cashflow", "valuation", "sentiment"])
    .describe("Signal category"),
  value: z.string().describe("Actual metric value as display string"),
  threshold: z.string().describe("Threshold or benchmark used"),
  result: z.enum(["positive", "negative", "neutral"]),
  description: z.string().describe("One-line explanation"),
});

// ─────────────────────────────────────────────
// Derived Metrics — computed in code from financials
// ─────────────────────────────────────────────
export const DerivedMetricsSchema = z.object({
  pegRatio: z.number().nullable().default(null),
  earningsYield: z.number().nullable().default(null),
  valuationPremium: z.number().nullable().default(null),
  marginAdvantage: z.number().nullable().default(null),
  debtBurden: z.number().nullable().default(null),
});

// ─────────────────────────────────────────────
// Verdict — LLM structured output
// ─────────────────────────────────────────────
export const LLMVerdictSchema = z.object({
  decision: z.enum(["INVEST", "PASS"]).describe("Final investment decision"),
  confidence: z
    .enum(["HIGH", "MEDIUM", "LOW"])
    .describe("Confidence in the decision"),
  summary: z
    .string()
    .describe("3-4 sentence synthesis of the signal pattern"),
  primaryStrength: z
    .string()
    .describe("Single strongest positive signal and why it matters"),
  primaryRisk: z
    .string()
    .describe("Single most concerning negative signal and why it matters"),
  bullCase: z.string().describe("One sentence: why this could outperform"),
  bearCase: z.string().describe("One sentence: why this could underperform"),
});

export const VerdictOutputSchema = LLMVerdictSchema.extend({
  signalBalance: z.number().describe("Signal balance score"),
  disclaimers: z.array(z.string()).default([]),
});

// ─────────────────────────────────────────────
// Final Analysis Result — full response shape
// ─────────────────────────────────────────────
export const AnalysisResultSchema = z.object({
  identity: CompanyIdentitySchema,
  financials: FinancialDataSchema.nullable().default(null),
  news: NewsDataSchema.nullable().default(null),
  signals: z.array(SignalSchema),
  derivedMetrics: DerivedMetricsSchema,
  verdict: VerdictOutputSchema,
  additionalContext: z.string().nullable().default(null),
  metadata: z.object({
    analyzedAt: z.string(),
    durationMs: z.number(),
    dataSourcesUsed: z.array(z.string()),
    errors: z.array(z.string()),
  }),
});
