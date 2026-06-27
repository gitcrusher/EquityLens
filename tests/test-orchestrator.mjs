import { analyzeCompany } from "../lib/orchestrator.js";

async function run() {
  console.log("=== Testing Orchestrator Pipeline ===");
  const result = await analyzeCompany("AAPL");
  
  if (result.type === "error") {
    console.error("Pipeline Error:", result.message);
    return;
  }
  
  if (result.type === "disambiguation") {
    console.log("Disambiguation required:", result.matches);
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
