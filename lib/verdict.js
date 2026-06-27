import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { LLMVerdictSchema } from "./schemas.js";

/**
 * Generates the narrative investment verdict using Gemini via LangChain.
 * Strictly adheres to the frozen EDD:
 * - No quantitative math or deterministic logic is performed here.
 * - The LLM is restricted to synthesizing the provided signals.
 * - Mandatory verdict-signal consistency validation is enforced post-generation.
 *
 * @param {Object} analysis - The computed quantitative analysis (signals, balance, etc.)
 * @param {Object} identity - The company identity
 * @returns {Promise<Object>} The full VerdictOutput object conforming to VerdictOutputSchema
 */
export async function generateVerdict(analysis, identity) {
  // If no GOOGLE_API_KEY is provided, fail gracefully.
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY is not configured.");
  }

  // Initialize Gemini 2.0 Flash via LangChain
  const model = new ChatGoogleGenerativeAI({
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
    apiKey: process.env.GOOGLE_API_KEY,
    temperature: 0.1, // Very low temperature for strict adherence to facts
  });

  const structuredModel = model.withStructuredOutput(LLMVerdictSchema, {
    name: "VerdictOutput",
  });

  // Construct the prompt using only deterministic inputs
  const systemPrompt = `You are a strict, objective financial analyst AI.
Your job is to interpret the provided quantitative signals and generate a narrative verdict.
You must NOT perform any math or alter the data.
You MUST base your synthesis ONLY on the provided signals and derived metrics.
Do NOT introduce external facts.
If making a general industry observation, prefix with "Generally speaking".

Company: ${identity.name} (${identity.ticker})
Sector: ${identity.sector || "Unknown"}
Industry: ${identity.industry || "Unknown"}

--- DETERMINISTIC SIGNALS ---
Signal Balance Score: ${analysis.signalBalance.balance}
(Positive: ${analysis.signalBalance.positive}, Negative: ${analysis.signalBalance.negative}, Neutral: ${analysis.signalBalance.neutral})

Quantitative Signals Evaluated:
${analysis.signals.map(s => `- [${s.result.toUpperCase()}] ${s.name}: ${s.value} (Threshold: ${s.threshold}) - ${s.description}`).join("\n")}

Derived Metrics (For Context):
- PEG Ratio: ${analysis.derivedMetrics.pegRatio ?? "N/A"}
- Earnings Yield: ${analysis.derivedMetrics.earningsYield ? analysis.derivedMetrics.earningsYield.toFixed(2) + "%" : "N/A"}
- Valuation Premium: ${analysis.derivedMetrics.valuationPremium ? analysis.derivedMetrics.valuationPremium.toFixed(2) + "%" : "N/A"}
- Margin Advantage: ${analysis.derivedMetrics.marginAdvantage ? analysis.derivedMetrics.marginAdvantage.toFixed(2) + "%" : "N/A"}

Targeted Research Context (if any):
${analysis.additionalContext || "None"}
`;

  // Execute the LLM Call
  const response = await structuredModel.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: "Please generate the structured investment narrative and verdict based solely on the provided signals." }
  ]);

  // Construct the final VerdictOutput (injecting the deterministic signalBalance and initializing disclaimers)
  const finalVerdict = { 
    ...response, 
    signalBalance: analysis.signalBalance.balance, 
    disclaimers: [] 
  };
  
  const balance = analysis.signalBalance.balance;

  // Validation: Verdict-Signal Consistency check (Mandatory per EDD lines 200-204)
  if (balance >= 2 && finalVerdict.decision === "PASS") {
    finalVerdict.decision = "INVEST";
    finalVerdict.disclaimers.push("AI decision overridden from PASS to INVEST to strictly align with overwhelming positive quantitative signals.");
  } else if (balance <= -2 && finalVerdict.decision === "INVEST") {
    finalVerdict.decision = "PASS";
    finalVerdict.disclaimers.push("AI decision overridden from INVEST to PASS to strictly align with overwhelming negative quantitative signals.");
  }

  return finalVerdict;
}
