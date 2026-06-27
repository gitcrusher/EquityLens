import { analyzeCompany } from "../lib/orchestrator.js";

async function runTest() {
  console.log("=========================================");
  console.log("🚀 STARTING E2E LIVE PIPELINE TEST");
  console.log("=========================================\n");

  const ticker = "AAPL"; 
  console.log(`[Step 1] Initializing Orchestrator for: ${ticker}`);
  console.log(`   (Note: MSFT is not cached, so this forces a LIVE test)\n`);

  try {
    const result = await analyzeCompany(ticker);

    if (result.type === "error") {
      console.error("❌ PIPELINE FAILED WITH ERROR:", result.message);
      console.error("Details:", result.metadata);
      return;
    }

    if (result.type === "disambiguation") {
      console.log("⚠️ Disambiguation triggered. Matches:");
      console.log(result.matches);
      return;
    }

    console.log("✅ PIPELINE COMPLETED SUCCESSFULLY\n");

    console.log("--- 1. Identity Resolution ---");
    console.log(`   Name:     ${result.identity.name}`);
    console.log(`   Ticker:   ${result.identity.ticker}`);
    console.log(`   Sector:   ${result.identity.sector}`);
    
    console.log("\n--- 2. FMP Live Data (Financials) ---");
    if (result.financials) {
      console.log(`   Source:      ${result.financials.source}`);
      console.log(`   Market Cap:  $${(result.financials.marketCap / 1e9).toFixed(2)} Billion`);
      console.log(`   P/E Ratio:   ${result.financials.peRatio}`);
      console.log(`   Revenue:     $${(result.financials.revenue / 1e9).toFixed(2)} Billion`);
    } else {
      console.log("   ❌ Failed to fetch live financials.");
    }

    console.log("\n--- 3. Tavily Live Data (News) ---");
    if (result.news) {
      console.log(`   Source:            ${result.news.source}`);
      console.log(`   Total Headlines:   ${result.news.items.length}`);
      console.log(`   Overall Sentiment: ${result.news.overallSentiment}`);
      if (result.news.items.length > 0) {
        console.log(`   Sample Headline:   "${result.news.items[0].headline}"`);
      }
    } else {
      console.log("   ❌ Failed to fetch live news.");
    }

    console.log("\n--- 4. Compute Engine (Signals) ---");
    console.log(`   Total Signals:   ${result.signals.length}`);
    console.log(`   Balance Score:   ${result.verdict.signalBalance}`);
    console.log(`   Derived Metrics: PEG=${result.derivedMetrics.pegRatio?.toFixed(2) || "N/A"}, Yield=${result.derivedMetrics.earningsYield?.toFixed(2) || "N/A"}%`);
    
    if (result.additionalContext) {
      console.log(`\n   Targeted Search Triggered!`);
      console.log(`   Context snippet: "${result.additionalContext.substring(0, 100)}..."`);
    }

    console.log("\n--- 5. Gemini 2.0 Flash (Verdict) ---");
    console.log(`   Decision:        ${result.verdict.decision} (Confidence: ${result.verdict.confidence})`);
    console.log(`   Summary:         ${result.verdict.summary}`);
    console.log(`   Primary Strength: ${result.verdict.primaryStrength}`);
    console.log(`   Primary Risk:    ${result.verdict.primaryRisk}`);
    console.log(`   Bull Case:       ${result.verdict.bullCase}`);
    console.log(`   Bear Case:       ${result.verdict.bearCase}`);
    
    if (result.verdict.disclaimers && result.verdict.disclaimers.length > 0) {
      console.log(`\n   Disclaimers:`);
      result.verdict.disclaimers.forEach(d => console.log(`   - ${d}`));
    }

    console.log("\n--- 6. Orchestrator Metadata ---");
    console.log(`   Duration:      ${result.metadata.durationMs}ms`);
    console.log(`   Sources Used:  ${result.metadata.dataSourcesUsed.join(", ")}`);
    console.log(`   Errors logged: ${result.metadata.errors.length}`);
    if (result.metadata.errors.length > 0) {
      console.log(`   Error logs:`, result.metadata.errors);
    }
    
  } catch (err) {
    console.error("FATAL SCRIPT ERROR:", err);
  }
}

runTest();
