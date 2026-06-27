import { getCachedResearch } from "./cache.js";

const FMP_URL = "https://financialmodelingprep.com/stable";
const TAVILY_URL = "https://api.tavily.com";

/**
 * Gathers all research data (financials and news) for a resolved company.
 * 
 * @param {object} identity - The resolved company identity (from resolveCompany)
 * @returns {Promise<{identity: object, financials: object|null, news: object|null, errors: string[]}>}
 */
export async function gatherResearchData(identity) {
  const errors = [];
  
  const fmpKey = process.env.FMP_API_KEY;
  const tavilyKey = process.env.TAVILY_API_KEY;

  let financials = null;
  let news = null;
  let updatedIdentity = { ...identity };

  // 1. Fetch FMP Data
  const fmpPromise = (async () => {
    if (!fmpKey) {
      errors.push("FMP_API_KEY missing.");
      return;
    }
    try {
      const [profileRes, metricsRes, incomeRes, ratiosRes, sectorRes] = await Promise.all([
        fetch(`${FMP_URL}/profile?symbol=${identity.ticker}&apikey=${fmpKey}`),
        fetch(`${FMP_URL}/key-metrics-ttm?symbol=${identity.ticker}&apikey=${fmpKey}`),
        fetch(`${FMP_URL}/income-statement?symbol=${identity.ticker}&period=annual&limit=2&apikey=${fmpKey}`),
        fetch(`${FMP_URL}/ratios-ttm?symbol=${identity.ticker}&apikey=${fmpKey}`),
        Promise.resolve(null)
      ]);

      const profileData = profileRes.ok ? await profileRes.json() : [];
      const metricsData = metricsRes.ok ? await metricsRes.json() : [];
      const incomeData = incomeRes.ok ? await incomeRes.json() : [];
      const ratiosData = ratiosRes.ok ? await ratiosRes.json() : [];

      const profile = profileData[0] || {};
      const metrics = metricsData[0] || {};
      const latestIncome = incomeData[0] || {};
      const previousIncome = incomeData[1] || {};
      const ratios = ratiosData[0] || {};

      updatedIdentity.sector = profile.sector || updatedIdentity.sector || "Unknown";
      updatedIdentity.industry = profile.industry || "Unknown";
      updatedIdentity.description = profile.description || "";
      updatedIdentity.currency = profile.currency || updatedIdentity.currency;
      if (profile.companyName) updatedIdentity.name = profile.companyName;

      let revenueGrowthYoY = null;
      if (latestIncome.revenue !== undefined && previousIncome.revenue) {
        revenueGrowthYoY = ((latestIncome.revenue - previousIncome.revenue) / previousIncome.revenue) * 100;
      }

      let netMargin = null;
      if (latestIncome.netIncome !== undefined && latestIncome.revenue) {
        netMargin = (latestIncome.netIncome / latestIncome.revenue) * 100;
      }
      
      let grossMargin = null;
      if (latestIncome.grossProfit !== undefined && latestIncome.revenue) {
        grossMargin = (latestIncome.grossProfit / latestIncome.revenue) * 100;
      }

      financials = {
        marketCap: profile.marketCap || null,
        peRatio: ratios.priceToEarningsRatioTTM || null,
        pbRatio: ratios.priceToBookRatioTTM || null,
        revenue: latestIncome.revenue || null,
        revenueGrowthYoY: revenueGrowthYoY,
        netIncome: latestIncome.netIncome || null,
        grossMargin: grossMargin,
        netMargin: netMargin,
        returnOnEquity: ratios.returnOnEquityTTM !== undefined ? ratios.returnOnEquityTTM * 100 : null,
        debtToEquity: ratios.debtEquityRatioTTM || null,
        currentRatio: metrics.currentRatioTTM || null,
        freeCashFlow: ratios.freeCashFlowPerShareTTM && profile.marketCap && profile.price 
                       ? (ratios.freeCashFlowPerShareTTM * (profile.marketCap / profile.price)) 
                       : null,
        sectorAverages: null,
        source: "Financial Modeling Prep",
        dataAsOf: new Date().toISOString(),
      };
    } catch (err) {
      console.error("FMP API Error:", err);
      errors.push("Failed to fetch financial data from FMP.");
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

  await Promise.allSettled([fmpPromise, tavilyPromise]);

  // 3. Fallback Logic (Demo Insurance)
  // If BOTH live data sources failed, try the local cache.
  if (!financials && !news) {
    const cached = await getCachedResearch(identity.ticker);
    if (cached) {
      return {
        identity: { ...identity, ...cached.identity },
        financials: cached.financials,
        news: cached.news,
        errors: ["Live APIs failed. Using offline cached data for demo purposes."],
      };
    }
    // If cache doesn't exist, throw fatal error
    throw new Error("Failed to retrieve both financial data and news. " + errors.join(" "));
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
