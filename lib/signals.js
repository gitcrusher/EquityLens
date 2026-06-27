// ─────────────────────────────────────────────
// Signal Definitions & Thresholds
//
// Each signal is a deterministic boolean check
// against financial data. No LLM involved.
// ─────────────────────────────────────────────

import { formatPercent, formatRatio } from "./format.js";

/**
 * Compute all signals from financial and news data.
 *
 * @param {object|null} financials - FinancialData shape
 * @param {object|null} news - NewsData shape
 * @param {object} derivedMetrics - DerivedMetrics shape
 * @returns {object[]} Array of Signal objects
 */
export function computeSignals(financials, news, derivedMetrics) {
  const signals = [];

  if (financials) {
    // ── Growth ──
    if (financials.revenueGrowthYoY !== null) {
      const growth = financials.revenueGrowthYoY;
      if (growth > 5) {
        signals.push({
          name: "Revenue Growth",
          category: "growth",
          value: formatPercent(growth),
          threshold: "> 5% YoY",
          result: "positive",
          description: `Revenue growing at ${growth.toFixed(1)}% YoY, above the 5% bar (inflation + GDP growth)`,
        });
      } else if (growth < 0) {
        signals.push({
          name: "Revenue Growth",
          category: "growth",
          value: formatPercent(growth),
          threshold: "> 0%",
          result: "negative",
          description: `Revenue declining at ${growth.toFixed(1)}% YoY — shrinking business`,
        });
      } else {
        signals.push({
          name: "Revenue Growth",
          category: "growth",
          value: formatPercent(growth),
          threshold: "> 5% YoY",
          result: "neutral",
          description: `Revenue growing at ${growth.toFixed(1)}% YoY — positive but not compelling`,
        });
      }
    }

    // ── Profitability (absolute) ──
    if (financials.netMargin !== null) {
      const margin = financials.netMargin;
      const sectorMargin = financials.sectorAverages?.netMargin;

      if (sectorMargin !== null && sectorMargin !== undefined) {
        // Relative comparison available
        if (margin > sectorMargin) {
          signals.push({
            name: "Profitability vs Sector",
            category: "profitability",
            value: formatPercent(margin),
            threshold: `Sector avg: ${formatPercent(sectorMargin)}`,
            result: "positive",
            description: `Net margin ${margin.toFixed(1)}% exceeds sector average of ${sectorMargin.toFixed(1)}%`,
          });
        } else if (margin < sectorMargin * 0.5) {
          signals.push({
            name: "Profitability vs Sector",
            category: "profitability",
            value: formatPercent(margin),
            threshold: `Sector avg: ${formatPercent(sectorMargin)}`,
            result: "negative",
            description: `Net margin ${margin.toFixed(1)}% significantly below sector average of ${sectorMargin.toFixed(1)}%`,
          });
        } else {
          signals.push({
            name: "Profitability vs Sector",
            category: "profitability",
            value: formatPercent(margin),
            threshold: `Sector avg: ${formatPercent(sectorMargin)}`,
            result: "neutral",
            description: `Net margin ${margin.toFixed(1)}% near sector average of ${sectorMargin.toFixed(1)}%`,
          });
        }
      } else {
        // No sector data — use absolute threshold
        if (margin > 15) {
          signals.push({
            name: "Profitability",
            category: "profitability",
            value: formatPercent(margin),
            threshold: "> 15% net margin",
            result: "positive",
            description: `Strong net margin of ${margin.toFixed(1)}%`,
          });
        } else if (margin < 5) {
          signals.push({
            name: "Profitability",
            category: "profitability",
            value: formatPercent(margin),
            threshold: "> 5% net margin",
            result: "negative",
            description: `Low net margin of ${margin.toFixed(1)}% — thin profitability`,
          });
        } else {
          signals.push({
            name: "Profitability",
            category: "profitability",
            value: formatPercent(margin),
            threshold: "5-15% net margin",
            result: "neutral",
            description: `Moderate net margin of ${margin.toFixed(1)}%`,
          });
        }
      }
    }

    // ── Leverage ──
    if (financials.debtToEquity !== null) {
      const de = financials.debtToEquity;
      const sectorDE = financials.sectorAverages?.debtToEquity;

      if (de > 2.0) {
        signals.push({
          name: "Leverage",
          category: "leverage",
          value: formatRatio(de),
          threshold: "< 2.0x D/E",
          result: "negative",
          description: `Debt-to-equity of ${de.toFixed(2)} exceeds the 2.0x high-leverage threshold`,
        });
      } else if (sectorDE !== null && sectorDE !== undefined && de < sectorDE) {
        signals.push({
          name: "Leverage vs Sector",
          category: "leverage",
          value: formatRatio(de),
          threshold: `Sector avg: ${formatRatio(sectorDE)}`,
          result: "positive",
          description: `Debt-to-equity of ${de.toFixed(2)} is below sector average of ${sectorDE.toFixed(2)}`,
        });
      } else if (de <= 1.0) {
        signals.push({
          name: "Leverage",
          category: "leverage",
          value: formatRatio(de),
          threshold: "< 1.0x D/E",
          result: "positive",
          description: `Conservative leverage with D/E of ${de.toFixed(2)}`,
        });
      } else {
        signals.push({
          name: "Leverage",
          category: "leverage",
          value: formatRatio(de),
          threshold: "< 2.0x D/E",
          result: "neutral",
          description: `Moderate leverage with D/E of ${de.toFixed(2)}`,
        });
      }
    }

    // ── Cash Flow ──
    if (financials.freeCashFlow !== null) {
      const fcf = financials.freeCashFlow;
      signals.push({
        name: "Free Cash Flow",
        category: "cashflow",
        value: fcf > 0 ? "Positive" : "Negative",
        threshold: "> 0",
        result: fcf > 0 ? "positive" : "negative",
        description: fcf > 0
          ? "Company generates positive free cash flow"
          : "Company burns cash — negative free cash flow",
      });
    }

    // ── Valuation (P/E vs Sector) ──
    if (financials.peRatio !== null && financials.peRatio > 0) {
      const pe = financials.peRatio;
      const sectorPE = financials.sectorAverages?.peRatio;

      if (sectorPE !== null && sectorPE !== undefined && sectorPE > 0) {
        const premium = ((pe - sectorPE) / sectorPE) * 100;
        if (pe < sectorPE) {
          signals.push({
            name: "Valuation vs Sector",
            category: "valuation",
            value: `P/E ${pe.toFixed(1)}`,
            threshold: `Sector avg: ${sectorPE.toFixed(1)}`,
            result: "positive",
            description: `Trading at ${Math.abs(premium).toFixed(0)}% discount to sector — potentially undervalued`,
          });
        } else if (pe > sectorPE * 1.5) {
          signals.push({
            name: "Valuation vs Sector",
            category: "valuation",
            value: `P/E ${pe.toFixed(1)}`,
            threshold: `Sector avg: ${sectorPE.toFixed(1)}`,
            result: "negative",
            description: `Trading at ${premium.toFixed(0)}% premium to sector — expensive relative to peers`,
          });
        } else {
          signals.push({
            name: "Valuation vs Sector",
            category: "valuation",
            value: `P/E ${pe.toFixed(1)}`,
            threshold: `Sector avg: ${sectorPE.toFixed(1)}`,
            result: "neutral",
            description: `P/E of ${pe.toFixed(1)} is near sector average of ${sectorPE.toFixed(1)}`,
          });
        }
      } else {
        // No sector P/E — use absolute thresholds
        if (pe < 15) {
          signals.push({
            name: "Valuation",
            category: "valuation",
            value: `P/E ${pe.toFixed(1)}`,
            threshold: "P/E < 15 (value range)",
            result: "positive",
            description: `Low P/E of ${pe.toFixed(1)} suggests value opportunity`,
          });
        } else if (pe > 50) {
          signals.push({
            name: "Valuation",
            category: "valuation",
            value: `P/E ${pe.toFixed(1)}`,
            threshold: "P/E < 50",
            result: "negative",
            description: `High P/E of ${pe.toFixed(1)} implies significant growth expectations`,
          });
        } else {
          signals.push({
            name: "Valuation",
            category: "valuation",
            value: `P/E ${pe.toFixed(1)}`,
            threshold: "P/E 15-50 (moderate)",
            result: "neutral",
            description: `P/E of ${pe.toFixed(1)} in moderate range`,
          });
        }
      }
    }

    // ── PEG Ratio (growth-adjusted valuation) ──
    if (derivedMetrics.pegRatio !== null) {
      const peg = derivedMetrics.pegRatio;
      if (peg > 0 && peg < 1.5) {
        signals.push({
          name: "Growth-Adjusted Valuation",
          category: "valuation",
          value: `PEG ${peg.toFixed(2)}`,
          threshold: "PEG < 1.5",
          result: "positive",
          description: `PEG ratio of ${peg.toFixed(2)} suggests growth is not fully priced in`,
        });
      } else if (peg > 2.5) {
        signals.push({
          name: "Growth-Adjusted Valuation",
          category: "valuation",
          value: `PEG ${peg.toFixed(2)}`,
          threshold: "PEG < 2.5",
          result: "negative",
          description: `PEG ratio of ${peg.toFixed(2)} suggests overpaying for growth`,
        });
      }
    }
  }

  // ── News Sentiment ──
  if (news && news.items.length > 0) {
    const positive = news.items.filter((n) => n.sentiment === "positive").length;
    const negative = news.items.filter((n) => n.sentiment === "negative").length;
    const total = positive + negative || 1; // avoid division by zero
    const ratio = positive / total;

    if (ratio > 0.6) {
      signals.push({
        name: "News Sentiment",
        category: "sentiment",
        value: `${positive} positive, ${negative} negative`,
        threshold: "> 60% positive",
        result: "positive",
        description: `Predominantly positive news coverage (${(ratio * 100).toFixed(0)}% positive)`,
      });
    } else if (ratio < 0.3) {
      signals.push({
        name: "News Sentiment",
        category: "sentiment",
        value: `${positive} positive, ${negative} negative`,
        threshold: "> 30% positive",
        result: "negative",
        description: `Predominantly negative news coverage (${((1 - ratio) * 100).toFixed(0)}% negative)`,
      });
    } else {
      signals.push({
        name: "News Sentiment",
        category: "sentiment",
        value: `${positive} positive, ${negative} negative`,
        threshold: "30-60% range",
        result: "neutral",
        description: `Mixed news sentiment (${(ratio * 100).toFixed(0)}% positive)`,
      });
    }
  }

  return signals;
}

/**
 * Compute signal balance and suggested verdict.
 *
 * @param {object[]} signals - Array of Signal objects
 * @returns {{ positive: number, negative: number, neutral: number, balance: number, suggestedVerdict: string, suggestedConfidence: string }}
 */
export function computeSignalBalance(signals) {
  const positive = signals.filter((s) => s.result === "positive").length;
  const negative = signals.filter((s) => s.result === "negative").length;
  const neutral = signals.filter((s) => s.result === "neutral").length;
  const balance = positive - negative;

  let suggestedVerdict;
  let suggestedConfidence;

  if (balance >= 4) {
    suggestedVerdict = "INVEST";
    suggestedConfidence = "HIGH";
  } else if (balance >= 2) {
    suggestedVerdict = "INVEST";
    suggestedConfidence = "MEDIUM";
  } else if (balance <= -4) {
    suggestedVerdict = "PASS";
    suggestedConfidence = "HIGH";
  } else if (balance <= -2) {
    suggestedVerdict = "PASS";
    suggestedConfidence = "MEDIUM";
  } else {
    // balance is -1, 0, or +1 — genuinely mixed
    suggestedVerdict = balance >= 0 ? "INVEST" : "PASS";
    suggestedConfidence = "LOW";
  }

  return { positive, negative, neutral, balance, suggestedVerdict, suggestedConfidence };
}

/**
 * Compute derived financial metrics from raw data.
 * These are computed in code (not by the LLM) for determinism and auditability.
 *
 * @param {object|null} financials - FinancialData shape
 * @returns {object} DerivedMetrics shape
 */
export function computeDerivedMetrics(financials) {
  const metrics = {
    pegRatio: null,
    earningsYield: null,
    valuationPremium: null,
    marginAdvantage: null,
    debtBurden: null,
  };

  if (!financials) return metrics;

  // PEG Ratio = P/E ÷ Revenue Growth %
  if (
    financials.peRatio !== null &&
    financials.peRatio > 0 &&
    financials.revenueGrowthYoY !== null &&
    financials.revenueGrowthYoY > 0
  ) {
    metrics.pegRatio = financials.peRatio / financials.revenueGrowthYoY;
  }

  // Earnings Yield = (Net Income / Market Cap) × 100
  if (
    financials.netIncome !== null &&
    financials.marketCap !== null &&
    financials.marketCap > 0
  ) {
    metrics.earningsYield = (financials.netIncome / financials.marketCap) * 100;
  }

  // Valuation Premium = (P/E - Sector P/E) / Sector P/E × 100
  if (
    financials.peRatio !== null &&
    financials.sectorAverages?.peRatio !== null &&
    financials.sectorAverages?.peRatio !== undefined &&
    financials.sectorAverages.peRatio > 0
  ) {
    metrics.valuationPremium =
      ((financials.peRatio - financials.sectorAverages.peRatio) /
        financials.sectorAverages.peRatio) *
      100;
  }

  // Margin Advantage = Net Margin - Sector Net Margin
  if (
    financials.netMargin !== null &&
    financials.sectorAverages?.netMargin !== null &&
    financials.sectorAverages?.netMargin !== undefined
  ) {
    metrics.marginAdvantage =
      financials.netMargin - financials.sectorAverages.netMargin;
  }

  // Debt Burden = Total Debt / Free Cash Flow (approximated via D/E and FCF)
  // Note: We approximate using debtToEquity * equity, but since we don't have
  // raw equity, we'll skip this if we can't compute it reliably.
  // Simpler: if D/E and FCF are available, we note the relationship qualitatively.
  if (
    financials.debtToEquity !== null &&
    financials.freeCashFlow !== null &&
    financials.freeCashFlow > 0 &&
    financials.marketCap !== null
  ) {
    // Rough estimate: equity ≈ marketCap (for public companies, market cap is a proxy)
    // Total debt ≈ D/E × equity ≈ D/E × marketCap
    // This is a rough proxy, not precise accounting
    const estimatedDebt = financials.debtToEquity * financials.marketCap;
    metrics.debtBurden = estimatedDebt / financials.freeCashFlow;
  }

  return metrics;
}

/**
 * Assess data gaps and determine if a targeted follow-up search is needed.
 * Returns a search query string if additional research is warranted, or null.
 *
 * @param {object|null} financials - FinancialData shape
 * @param {object[]} signals - Computed signals
 * @param {string} companyName - Company name for search queries
 * @returns {string|null} Targeted search query, or null if data is sufficient
 */
export function assessDataGaps(financials, signals, companyName) {
  if (!financials) return null;

  // Check for extreme P/E (negative or > 100)
  if (financials.peRatio !== null) {
    if (financials.peRatio < 0) {
      return `why is ${companyName} P/E ratio negative earnings loss`;
    }
    if (financials.peRatio > 100) {
      return `why is ${companyName} P/E ratio so high ${financials.peRatio}`;
    }
  }

  // Check for sharp revenue decline
  if (financials.revenueGrowthYoY !== null && financials.revenueGrowthYoY < -10) {
    return `${companyName} revenue decline reason ${new Date().getFullYear()}`;
  }

  // Check for overwhelmingly negative sentiment
  const sentimentSignal = signals.find((s) => s.category === "sentiment");
  if (sentimentSignal && sentimentSignal.result === "negative") {
    return `${companyName} controversy risk problem ${new Date().getFullYear()}`;
  }

  return null; // Data is sufficient, no additional search needed
}
