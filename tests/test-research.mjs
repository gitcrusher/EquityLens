// Smoke test for research.js
// Tests: cache fallback path (no API keys), module exports, data shape

import { gatherResearchData, performTargetedSearch } from "../lib/research.js";

async function test() {
  console.log("=== research.js Smoke Test ===\n");

  // Test 1: Cache fallback for a known cached company (no API keys set)
  console.log("Test 1: Cache fallback for AAPL (no API keys)...");
  try {
    const result = await gatherResearchData({
      name: "Apple Inc.",
      ticker: "AAPL",
      exchange: "NASDAQ",
      currency: "USD",
    });

    console.log("  ✅ gatherResearchData returned successfully");
    console.log("  Identity:", result.identity?.name, result.identity?.ticker);
    console.log("  Financials source:", result.financials?.source || "NULL");
    console.log("  Financials marketCap:", result.financials?.marketCap || "NULL");
    console.log("  Financials freeCashFlow:", result.financials?.freeCashFlow || "NULL");
    console.log("  News items:", result.news?.items?.length ?? "NULL");
    console.log("  News overallSentiment:", result.news?.overallSentiment || "NULL");
    console.log("  Errors:", result.errors);
    console.log("");

    // Validate shape
    const hasIdentity = result.identity && result.identity.ticker;
    const hasFinancials = result.financials !== null;
    const hasNews = result.news !== null;
    const hasErrors = Array.isArray(result.errors);
    
    if (hasIdentity && hasFinancials && hasNews && hasErrors) {
      console.log("  ✅ Shape validation passed");
    } else {
      console.log("  ❌ Shape validation FAILED", { hasIdentity, hasFinancials, hasNews, hasErrors });
    }
  } catch (err) {
    console.log("  ❌ FAILED:", err.message);
  }

  console.log("\n---\n");

  // Test 2: Non-cached company with no API keys → should throw
  console.log("Test 2: Non-cached company 'GOOGL' (no API keys, no cache)...");
  try {
    await gatherResearchData({
      name: "Alphabet Inc.",
      ticker: "GOOGL",
      exchange: "NASDAQ",
      currency: "USD",
    });
    console.log("  ❌ Should have thrown, but didn't");
  } catch (err) {
    console.log("  ✅ Correctly threw error:", err.message);
  }

  console.log("\n---\n");

  // Test 3: performTargetedSearch with no API key → should return null gracefully
  console.log("Test 3: performTargetedSearch with no API key...");
  try {
    const ctx = await performTargetedSearch("Apple revenue decline");
    if (ctx === null) {
      console.log("  ✅ Correctly returned null (no API key)");
    } else {
      console.log("  ⚠️ Unexpected result:", ctx);
    }
  } catch (err) {
    console.log("  ❌ Should not throw:", err.message);
  }

  console.log("\n---\n");

  // Test 4: Cache fallback for Indian company (INFY.NS)
  console.log("Test 4: Cache fallback for INFY.NS...");
  try {
    const result = await gatherResearchData({
      name: "Infosys Limited",
      ticker: "INFY.NS",
      exchange: "NSE",
      currency: "INR",
    });

    console.log("  ✅ gatherResearchData returned for INFY.NS");
    console.log("  Identity currency:", result.identity?.currency);
    console.log("  Financials marketCap:", result.financials?.marketCap);
    console.log("  Financials sectorAverages:", JSON.stringify(result.financials?.sectorAverages));
    console.log("  News items:", result.news?.items?.length);
  } catch (err) {
    console.log("  ❌ FAILED:", err.message);
  }

  console.log("\n=== All tests complete ===");
}

test();
