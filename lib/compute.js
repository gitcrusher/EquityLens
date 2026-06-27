import { 
  computeDerivedMetrics, 
  computeSignals, 
  computeSignalBalance, 
  assessDataGaps 
} from "./signals.js";
import { performTargetedSearch } from "./research.js";

/**
 * Orchestrates the quantitative analysis step.
 * Computes derived metrics, runs the boolean signal engine, 
 * calculates the balance, and handles any data gap targeted searches.
 * 
 * @param {Object} identity - The resolved company identity
 * @param {Object} financials - The fetched FMP financials
 * @param {Object} news - The fetched Tavily news
 * @returns {Promise<Object>} { signals, derivedMetrics, signalBalance, additionalContext }
 */
export async function computeAnalysis(identity, financials, news) {
  // 1. Compute Derived Metrics (e.g., PEG ratio, Debt Burden)
  const derivedMetrics = computeDerivedMetrics(financials);

  // 2. Compute the 10-15 deterministic boolean signals
  const signals = computeSignals(financials, news, derivedMetrics);

  // 3. Aggregate signal balance (Positive, Negative, Neutral counts)
  const signalBalance = computeSignalBalance(signals);

  // 4. Assess Data Gaps (e.g., extreme P/E, sharp revenue decline)
  const gapQuery = assessDataGaps(financials, signals, identity.name);
  let additionalContext = null;

  if (gapQuery) {
    // 5. Perform Targeted Search if a gap is found
    try {
      additionalContext = await performTargetedSearch(gapQuery);
    } catch (error) {
      console.error("[computeAnalysis] Targeted search failed:", error);
    }
  }

  return {
    signals,
    derivedMetrics,
    signalBalance,
    additionalContext
  };
}
