import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance();

export async function resolveCompany(query) {
  try {
    const searchResult = await yahooFinance.search(query);
    // Filter to primarily show equities, ETFs, etc.
    const data = searchResult.quotes.filter(q => q.quoteType === 'EQUITY' || q.quoteType === 'ETF');

    if (!data || data.length === 0) {
      return {
        type: "error",
        message: `Could not find a publicly listed company matching '${query}'.`,
      };
    }

    // Map to our identity format
    const matches = data.slice(0, 5).map((eq) => ({
      name: eq.shortname || eq.longname || eq.symbol,
      ticker: eq.symbol,
      exchange: eq.exchDisp || eq.exchange || "Unknown",
      currency: eq.currency || "USD",
    }));

    // Disambiguation logic:
    // If the query exactly matches a ticker, auto-select it.
    const exactTicker = matches.find(
      (m) => m.ticker.toLowerCase() === query.toLowerCase()
    );
    if (exactTicker) {
      return { type: "resolved", identity: exactTicker };
    }

    // If there is only one match, auto-select it.
    if (matches.length === 1) {
      return { type: "resolved", identity: matches[0] };
    }

    // Otherwise, return matches for the user to disambiguate
    return { type: "disambiguation", matches };
  } catch (error) {
    console.error("resolveCompany error:", error);
    
    // Offline Fallback for Demo Companies (When API Quota is Exceeded)
    const q = query.toLowerCase();
    const fallbackMap = {
      "apple": { name: "Apple Inc.", ticker: "AAPL", exchange: "NASDAQ", currency: "USD" },
      "aapl": { name: "Apple Inc.", ticker: "AAPL", exchange: "NASDAQ", currency: "USD" },
      "tesla": { name: "Tesla, Inc.", ticker: "TSLA", exchange: "NASDAQ", currency: "USD" },
      "tsla": { name: "Tesla, Inc.", ticker: "TSLA", exchange: "NASDAQ", currency: "USD" },
      "reliance": { name: "Reliance Industries", ticker: "RELIANCE.NS", exchange: "NSE", currency: "INR" },
      "reliance.ns": { name: "Reliance Industries", ticker: "RELIANCE.NS", exchange: "NSE", currency: "INR" },
      "infosys": { name: "Infosys Limited", ticker: "INFY.NS", exchange: "NSE", currency: "INR" },
      "infy.ns": { name: "Infosys Limited", ticker: "INFY.NS", exchange: "NSE", currency: "INR" },
      "zomato": { name: "Zomato Limited", ticker: "ZOMATO.NS", exchange: "NSE", currency: "INR" },
      "zomato.ns": { name: "Zomato Limited", ticker: "ZOMATO.NS", exchange: "NSE", currency: "INR" },
    };
    
    if (fallbackMap[q]) {
      return { type: "resolved", identity: fallbackMap[q] };
    }

    return { type: "error", message: "Failed to resolve company name (API Quota Exceeded). Try searching for 'Apple' or 'Tesla' instead." };
  }
}
