import { resolveCompany } from "./resolve.js";
import { gatherResearchData } from "./research.js";
import { computeAnalysis } from "./compute.js";
import { generateVerdict } from "./verdict.js";

/**
 * Main Orchestrator: Runs the 5-step analysis pipeline.
 * Follows the frozen EDD architecture: no LangGraph, deterministic quantitative
 * checks, sequential steps.
 * 
 * @param {string} query - The user's input (e.g. "Apple" or "AAPL")
 */
export async function analyzeCompany(query) {
  const startTime = Date.now();
  const allErrors = [];
  const dataSourcesUsed = [];

  try {
    // Step 1: Resolve Company
    const resolveResult = await resolveCompany(query);
    if (resolveResult.type === "error") {
      throw new Error(resolveResult.message);
    }
    if (resolveResult.type === "disambiguation") {
      return resolveResult; // Return early for user choice
    }
    const identity = resolveResult.identity;

    // Step 2: Gather Research Data (FMP + Tavily + Cache Fallback)
    const researchData = await gatherResearchData(identity);
    if (researchData.errors && researchData.errors.length > 0) {
      allErrors.push(...researchData.errors);
    }
    
    if (researchData.financials) dataSourcesUsed.push(researchData.financials.source);
    if (researchData.news) dataSourcesUsed.push(researchData.news.source);

    // Step 3: Compute Quantitative Analysis (Deterministic Signals)
    const analysis = await computeAnalysis(
      researchData.identity,
      researchData.financials,
      researchData.news
    );

    // Step 4: Generate Verdict (Module 4)
    // Invokes Gemini 2.0 Flash to synthesize the deterministic signals into a narrative.
    let finalVerdict;
    try {
      finalVerdict = await generateVerdict(analysis, researchData.identity);
    } catch (err) {
      allErrors.push(`Failed to generate LLM verdict: ${err.message}`);
      // Fallback stub if LLM fails
      finalVerdict = {
        decision: analysis.signalBalance.suggestedVerdict,
        confidence: analysis.signalBalance.suggestedConfidence,
        signalBalance: analysis.signalBalance.balance,
        summary: "LLM synthesis failed. Displaying deterministic verdict based on signal balance.",
        primaryStrength: "N/A",
        primaryRisk: "N/A",
        bullCase: "N/A",
        bearCase: "N/A",
        disclaimers: []
      };
    }

    // Append any global disclaimers to the verdict
    if (researchData.errors?.some(e => e.includes("offline cached data"))) {
      finalVerdict.disclaimers.push("Showing cached data. Live API unavailable.");
    }
    if (!researchData.financials?.sectorAverages) {
      finalVerdict.disclaimers.push("Sector averages omitted to conserve API limits.");
    }

    // Step 5: Assemble Final Result
    const durationMs = Date.now() - startTime;
    const finalResult = {
      type: "analysis",
      identity: researchData.identity,
      financials: researchData.financials,
      news: researchData.news,
      signals: analysis.signals,
      derivedMetrics: analysis.derivedMetrics,
      verdict: finalVerdict,
      additionalContext: analysis.additionalContext,
      metadata: {
        analyzedAt: new Date().toISOString(),
        durationMs,
        dataSourcesUsed: [...new Set(dataSourcesUsed)], // deduplicate
        errors: allErrors,
      }
    };

    return finalResult;
  } catch (error) {
    console.error("Orchestration Error:", error);
    return {
      type: "error",
      message: error.message || "An unexpected error occurred during analysis.",
      metadata: {
        analyzedAt: new Date().toISOString(),
        durationMs: Date.now() - startTime,
        dataSourcesUsed,
        errors: [...allErrors, error.message],
      }
    };
  }
}
