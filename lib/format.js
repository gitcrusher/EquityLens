// ─────────────────────────────────────────────
// Currency & Number Formatting Utilities
// ─────────────────────────────────────────────

const CURRENCY_SYMBOLS = {
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CNY: "¥",
  KRW: "₩",
  HKD: "HK$",
  CAD: "C$",
  AUD: "A$",
};

/**
 * Get currency symbol for a currency code.
 * Falls back to the code itself if not mapped.
 */
export function getCurrencySymbol(currencyCode) {
  if (!currencyCode) return "$";
  return CURRENCY_SYMBOLS[currencyCode.toUpperCase()] || currencyCode;
}

/**
 * Format a large number with B/M/T suffixes.
 * Examples: 394300000000 → "394.3B", 1630000000000 → "1.63T"
 *
 * @param {number|null} value - The raw number
 * @param {string} currency - Currency code (e.g. "USD", "INR")
 * @param {number} decimals - Decimal places (default 1)
 * @returns {string} Formatted string like "$394.3B" or "₹1.63T"
 */
export function formatCurrency(value, currency = "USD", decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return "N/A";

  const symbol = getCurrencySymbol(currency);
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absValue >= 1e12) {
    return `${sign}${symbol}${(absValue / 1e12).toFixed(decimals)}T`;
  }
  if (absValue >= 1e9) {
    return `${sign}${symbol}${(absValue / 1e9).toFixed(decimals)}B`;
  }
  if (absValue >= 1e6) {
    return `${sign}${symbol}${(absValue / 1e6).toFixed(decimals)}M`;
  }
  if (absValue >= 1e3) {
    return `${sign}${symbol}${(absValue / 1e3).toFixed(decimals)}K`;
  }
  return `${sign}${symbol}${absValue.toFixed(decimals)}`;
}

/**
 * Format a percentage value.
 * Examples: 0.263 → "26.3%", 8.2 → "8.2%"
 *
 * @param {number|null} value - Percentage (can be 0-1 ratio or already a percentage)
 * @param {boolean} isRatio - If true, value is 0-1 and will be multiplied by 100
 * @returns {string} Formatted like "26.3%"
 */
export function formatPercent(value, isRatio = false) {
  if (value === null || value === undefined || isNaN(value)) return "N/A";
  const pct = isRatio ? value * 100 : value;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

/**
 * Format a ratio value.
 * Examples: 1.87 → "1.87x", 0.27 → "0.27x"
 */
export function formatRatio(value) {
  if (value === null || value === undefined || isNaN(value)) return "N/A";
  return `${value.toFixed(2)}x`;
}

/**
 * Format a number with commas.
 * Examples: 1234567 → "1,234,567"
 */
export function formatNumber(value) {
  if (value === null || value === undefined || isNaN(value)) return "N/A";
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}
