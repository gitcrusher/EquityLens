import { getCachedResearch } from "./cache.js";
import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();

const TAVILY_URL = "https://api.tavily.com";

/**
 * Gathers all research data (financials and news) for a resolved company.
 * 
 * @param {object} identity - The resolved company identity (from resolveCompany)
 * @returns {Promise<{identity: object, financials: object|null, news: object|null, errors: string[]}>}
 */
export async function gatherResearchData(identity) {
  const errors = [];
  
  const tavilyKey = process.env.TAVILY_API_KEY;

  let financials = null;
  let news = null;
  let updatedIdentity = { ...identity };

  // 1. Fetch Yahoo Finance Data
  const yahooPromise = (async () => {
    try {
      const quote = await yahooFinance.quoteSummary(identity.ticker, {
        modules: ['summaryProfile', 'summaryDetail', 'defaultKeyStatistics', 'financialData']
      });

      const profile = quote.summaryProfile || {};
      const detail = quote.summaryDetail || {};
      const stats = quote.defaultKeyStatistics || {};
      const fin = quote.financialData || {};

      updatedIdentity.sector = profile.sector || updatedIdentity.sector || "Unknown";
      updatedIdentity.industry = profile.industry || "Unknown";
      updatedIdentity.description = profile.longBusinessSummary || "";
      updatedIdentity.currency = detail.currency || fin.financialCurrency || updatedIdentity.currency;

      if (!detail.marketCap && !fin.totalRevenue) {
        errors.push("Yahoo Finance returned empty data for this ticker.");
        financials = null;
      } else {
        financials = {
          marketCap: detail.marketCap || null,
          peRatio: detail.trailingPE || null,
          pbRatio: stats.priceToBook || null,
          revenue: fin.totalRevenue || null,
          revenueGrowthYoY: fin.revenueGrowth !== undefined ? fin.revenueGrowth * 100 : null,
          netIncome: fin.netIncomeToCommon || null,
          grossMargin: fin.grossMargins !== undefined ? fin.grossMargins * 100 : null,
          netMargin: fin.profitMargins !== undefined ? fin.profitMargins * 100 : null,
          returnOnEquity: fin.returnOnEquity !== undefined ? fin.returnOnEquity * 100 : null,
          debtToEquity: fin.debtToEquity || null,
          currentRatio: fin.currentRatio || null,
          freeCashFlow: fin.freeCashflow || fin.operatingCashflow || null,
          sectorAverages: null,
          source: "Yahoo Finance",
          dataAsOf: new Date().toISOString(),
        };
      }
    } catch (err) {
      console.error("Yahoo Finance API Error:", err);
      errors.push("Failed to fetch financial data from Yahoo Finance.");
    }
  })();

  // 2. Fetch News from Tavily
  const tavilyPromise = (async () => {
    if (!tavilyKey) {
      errors.push("Tavily API key missing.");
      return;
    }
    try {
      const tavilyRes = await fetch(`${TAVILY_URL}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: tavilyKey,
          query: `${identity.name} company financial news OR analysis OR earnings`,
          search_depth: "basic",
          include_images: false,
          days_back: 14,
        }),
      });

      if (tavilyRes.ok) {
        const tavilyData = await tavilyRes.json();
        
        const items = (tavilyData.results || []).map(r => {
          const text = (r.title + " " + r.content).toLowerCase();
          let sentiment = "neutral";
          if (text.match(/surge|jump|beat|grow|profit|upgrade|bull|strong/)) sentiment = "positive";
          else if (text.match(/plunge|drop|miss|decline|loss|downgrade|bear|weak/)) sentiment = "negative";
          
          return {
            headline: r.title,
            summary: r.content,
            source: new URL(r.url).hostname.replace("www.", ""),
            publishedAt: "",
            url: r.url,
            sentiment
          };
        });

        const positive = items.filter(i => i.sentiment === "positive").length;
        const negative = items.filter(i => i.sentiment === "negative").length;
        let overallSentiment = "neutral";
        if (positive > negative) overallSentiment = "positive";
        else if (negative > positive) overallSentiment = "negative";
        else if (positive === negative && positive > 0) overallSentiment = "mixed";

        news = {
          items,
          overallSentiment,
          source: "Tavily Search",
          searchedAt: new Date().toISOString(),
        };
      } else {
        errors.push("Tavily search returned an error.");
      }
    } catch (err) {
      console.error("Tavily API Error:", err);
      errors.push("Failed to fetch news from Tavily.");
    }
  })();

  await Promise.allSettled([yahooPromise, tavilyPromise]);

  // 3. Fallback Logic (Demo Insurance)
  if (!financials) {
    const cached = await getCachedResearch(identity.ticker);
    if (cached) {
      return {
        identity: { ...identity, ...cached.identity },
        financials: cached.financials,
        news: news || cached.news,
        errors: ["Live financial APIs failed. Using offline cached data for demo purposes."],
      };
    }
    // If cache doesn't exist, throw fatal error
    throw new Error("Financial data is unavailable for this company (likely due to free-tier restrictions on international exchanges). " + errors.join(" "));
  }

  return { identity: updatedIdentity, financials, news, errors };
}

/**
 * Performs a targeted follow-up search based on data gaps identified by the compute layer.
 * 
 * @param {string} query - The targeted search query
 * @returns {Promise<string|null>} Additional context string
 */
export async function performTargetedSearch(query) {
  const tavilyKey = process.env.TAVILY_API_KEY;
  if (!tavilyKey || !query) return null;

  try {
    const res = await fetch(`${TAVILY_URL}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: tavilyKey,
        query: query,
        search_depth: "basic",
        max_results: 3,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.results.map(r => r.content).join(" ");
    }
  } catch (err) {
    console.error("Targeted search failed:", err);
  }
  return null;
}
