import { gatherResearchData } from "../lib/research.js";
import { computeAnalysis } from "../lib/compute.js";

async function run() {
  console.log("=== Testing Compute & Orchestrator Workflow ===");
  
  const identity = {
    name: "Apple Inc.",
    ticker: "AAPL",
    exchange: "NASDAQ",
    currency: "USD",
  };
  
  console.log("1. Gathering research data (falling back to cache)...");
  const researchData = await gatherResearchData(identity);
  
  console.log(`Financials fetched: ${!!researchData.financials}`);
  console.log(`News fetched: ${!!researchData.news}`);
  
  console.log("\n2. Computing quantitative analysis...");
  const analysis = await computeAnalysis(
    researchData.identity,
    researchData.financials,
    researchData.news
  );
  
  console.log("\n--- Derived Metrics ---");
  console.log(analysis.derivedMetrics);
  
  console.log("\n--- Signal Balance ---");
  console.log(analysis.signalBalance);
  
  console.log("\nTotal Signals Generated:", analysis.signals.length);
  
  if (analysis.additionalContext) {
    console.log("\nTargeted Search Context:", analysis.additionalContext);
  }
}

run();
