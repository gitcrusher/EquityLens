export async function resolveCompany(query) {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    throw new Error("FMP_API_KEY is not configured.");
  }

  try {
    const [nameRes, symbolRes] = await Promise.all([
      fetch(
        `https://financialmodelingprep.com/stable/search-name?query=${encodeURIComponent(
          query
        )}&apikey=${apiKey}`
      ),
      fetch(
        `https://financialmodelingprep.com/stable/search-symbol?query=${encodeURIComponent(
          query
        )}&apikey=${apiKey}`
      )
    ]);

    if (!nameRes.ok && !symbolRes.ok) {
      throw new Error(`FMP search API error: Both name and symbol search failed`);
    }

    const nameData = nameRes.ok ? await nameRes.json() : [];
    const symbolData = symbolRes.ok ? await symbolRes.json() : [];

    // Merge and deduplicate by ticker
    const combinedData = [...symbolData, ...nameData];
    const uniqueTickers = new Set();
    const data = [];
    for (const item of combinedData) {
      if (!uniqueTickers.has(item.symbol)) {
        uniqueTickers.add(item.symbol);
        data.push(item);
      }
    }

    if (!data || data.length === 0) {
      return {
        type: "error",
        message: `Could not find a publicly listed company matching '${query}'.`,
      };
    }

    // Heuristic: If one result is highly relevant, resolve automatically.
    // Otherwise, return disambiguation choices.
    
    // Stable API returns: symbol, name, currency, exchangeFullName, exchange
    const matches = data.slice(0, 5).map((eq) => ({
      name: eq.name,
      ticker: eq.symbol,
      exchange: eq.exchange || eq.exchangeFullName,
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
    return { type: "error", message: "Failed to resolve company name." };
  }
}
