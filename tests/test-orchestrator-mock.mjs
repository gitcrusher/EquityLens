import * as resolver from "../lib/resolve.js";
import { gatherResearchData } from "../lib/research.js";
import { computeAnalysis } from "../lib/compute.js";
import { analyzeCompany } from "../lib/orchestrator.js";

// Mock resolveCompany to return Apple directly so we don't need FMP_API_KEY
resolver.resolveCompany = async (query) => {
  return {
    type: "resolved",
    identity: {
      name: "Apple Inc.",
      ticker: "AAPL",
      exchange: "NASDAQ",
      currency: "USD",
    }
  };
};

async function run() {
  console.log("=== Testing Orchestrator Pipeline (Mock Resolve) ===");
  const result = await analyzeCompany("AAPL");
  
  if (result.type === "error") {
    console.error("Pipeline Error:", result.message);
    return;
  }
  
  console.log("\n--- Identity ---");
  console.log(result.identity);
  
  console.log("\n--- Signal Balance ---");
  console.log(result.verdict);
  
  console.log("\n--- Metadata ---");
  console.log(result.metadata);
  
  console.log("\nTotal Signals Evaluated:", result.signals.length);
}

run();
