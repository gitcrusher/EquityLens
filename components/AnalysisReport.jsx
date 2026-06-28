"use client";

import { formatCurrency, formatPercent, formatRatio } from "../lib/format.js";

// ─── Helpers ──────────────────────
function signalIcon(result) {
  if (result === "positive") return "✅";
  if (result === "negative") return "❌";
  return "➖";
}

function sentimentColor(s) {
  if (s === "positive") return "var(--signal-positive)";
  if (s === "negative") return "var(--signal-negative)";
  return "var(--text-muted)";
}

function sentimentBg(s) {
  if (s === "positive") return "var(--signal-positive-bg)";
  if (s === "negative") return "var(--signal-negative-bg)";
  return "var(--signal-neutral-bg)";
}

// ─── Main Component ──────────────────────────
export default function AnalysisReport({ analysis, onNewSearch }) {
  if (!analysis) return null;

  const { identity, financials, news, signals, derivedMetrics, verdict, metadata } = analysis;
  const currency = identity?.currency || financials?.currency || "USD";

  return (
    <div style={{ maxWidth: "950px", margin: "0 auto", width: "100%", display: "flex", flexDirection: "column", gap: "1.2rem" }}>

      {/* ════════════════════════════════════ */}
      {/*  COMPANY HEADER                     */}
      {/* ════════════════════════════════════ */}
      <div className="glass-panel animate-fade-in stagger-1" style={{ padding: "1.5rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "0.3rem" }}>
            <h2 style={{ fontSize: "1.7rem", color: "var(--text-primary)" }}>
              {identity?.name || "Unknown Company"}
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span className="gradient-pill" style={{ fontSize: "0.72rem" }}>{identity?.ticker}</span>
            {identity?.exchange && <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{identity.exchange}</span>}
            {identity?.sector && <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>· {identity.sector}</span>}
          </div>
        </div>
        <button
          onClick={onNewSearch}
          style={{
            background: "var(--chip-bg)", border: "1px solid var(--border-subtle)", borderRadius: "9999px",
            padding: "0.5rem 1.3rem", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.82rem", fontWeight: 500,
            transition: "all var(--transition-normal)",
          }}
          onMouseEnter={(e) => { e.target.style.color = "var(--text-primary)"; e.target.style.borderColor = "var(--accent-primary)"; e.target.style.transform = "translateY(-2px)"; }}
          onMouseLeave={(e) => { e.target.style.color = "var(--text-muted)"; e.target.style.borderColor = "var(--border-subtle)"; e.target.style.transform = "translateY(0)"; }}
        >
          ← New Search
        </button>
      </div>

      {/* ════════════════════════════════════ */}
      {/*  AI VERDICT                         */}
      {/* ════════════════════════════════════ */}
      {verdict && (
        <div className="glass-panel animate-fade-in stagger-2" style={{
          padding: "2rem",
          borderLeft: `4px solid ${verdict.decision === "INVEST" ? "var(--signal-positive)" : "var(--signal-negative)"}`,
        }}>
          {/* Tag */}
          <span style={{
            fontSize: "0.68rem", padding: "0.2rem 0.7rem", borderRadius: "4px",
            background: "rgba(124,92,252,0.12)", color: "var(--accent-primary)",
            fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            AI Interpretation
          </span>

          {/* Decision + Confidence */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "1rem 0 1.2rem", flexWrap: "wrap" }}>
            <span style={{
              fontSize: "2.2rem", fontWeight: 800,
              background: verdict.decision === "INVEST"
                ? "linear-gradient(135deg, var(--signal-positive), #34d399)"
                : "linear-gradient(135deg, var(--signal-negative), #fb923c)",
              WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
            }}>
              {verdict.decision}
            </span>
            <span style={{
              padding: "0.3rem 0.9rem", borderRadius: "9999px", fontSize: "0.78rem", fontWeight: 700,
              background: verdict.confidence === "HIGH" ? "var(--signal-positive-bg)" : verdict.confidence === "LOW" ? "var(--signal-negative-bg)" : "var(--signal-neutral-bg)",
              color: verdict.confidence === "HIGH" ? "var(--signal-positive)" : verdict.confidence === "LOW" ? "var(--signal-negative)" : "var(--signal-neutral)",
            }}>
              {verdict.confidence} Confidence
            </span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 500 }}>
              Signal Balance: {verdict.signalBalance >= 0 ? "+" : ""}{verdict.signalBalance}
            </span>
          </div>

          {/* Summary */}
          <p style={{ fontSize: "0.98rem", lineHeight: 1.75, marginBottom: "1.5rem" }}>
            {verdict.summary}
          </p>

          {/* Strength / Risk */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem", marginBottom: "1rem" }}>
            <div className="data-card" style={{ borderLeft: "3px solid var(--signal-positive)" }}>
              <p style={{ fontSize: "0.7rem", color: "var(--signal-positive)", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.4rem", letterSpacing: "0.04em" }}>Primary Strength</p>
              <p style={{ fontSize: "0.88rem", color: "var(--text-primary)", lineHeight: 1.5 }}>{verdict.primaryStrength || "N/A"}</p>
            </div>
            <div className="data-card" style={{ borderLeft: "3px solid var(--signal-negative)" }}>
              <p style={{ fontSize: "0.7rem", color: "var(--signal-negative)", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.4rem", letterSpacing: "0.04em" }}>Primary Risk</p>
              <p style={{ fontSize: "0.88rem", color: "var(--text-primary)", lineHeight: 1.5 }}>{verdict.primaryRisk || "N/A"}</p>
            </div>
          </div>

          {/* Bull / Bear */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
            <div className="data-card">
              <p style={{ fontSize: "0.72rem", color: "var(--signal-positive)", fontWeight: 700, marginBottom: "0.4rem" }}>🐂 Bull Case</p>
              <p style={{ fontSize: "0.88rem", lineHeight: 1.5 }}>{verdict.bullCase || "N/A"}</p>
            </div>
            <div className="data-card">
              <p style={{ fontSize: "0.72rem", color: "var(--signal-negative)", fontWeight: 700, marginBottom: "0.4rem" }}>🐻 Bear Case</p>
              <p style={{ fontSize: "0.88rem", lineHeight: 1.5 }}>{verdict.bearCase || "N/A"}</p>
            </div>
          </div>

          {/* Disclaimers */}
          {verdict.disclaimers && verdict.disclaimers.length > 0 && (
            <div style={{ marginTop: "1.2rem", padding: "0.6rem 1rem", borderRadius: "var(--radius-sm)", background: "rgba(234,179,8,0.06)", borderLeft: "3px solid #eab308" }}>
              <p style={{ fontSize: "0.75rem", color: "#eab308", fontWeight: 700, marginBottom: "0.2rem" }}>Disclaimers</p>
              {verdict.disclaimers.map((d, i) => (
                <p key={i} style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>• {d}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════ */}
      {/*  SIGNAL GRID                        */}
      {/* ════════════════════════════════════ */}
      {signals && signals.length > 0 && (
        <div className="glass-panel animate-fade-in stagger-3" style={{ padding: "1.5rem 1.8rem" }}>
          <h3 style={{ fontSize: "1.05rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.2rem" }}>⚡</span> Deterministic Signals
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {signals.map((s, i) => (
              <div key={i} className="signal-row">
                <span style={{ fontSize: "1rem", textAlign: "center" }}>{signalIcon(s.result)}</span>
                <div>
                  <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)" }}>{s.name}</span>
                  <span style={{ marginLeft: "0.4rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>{s.description}</span>
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap", fontFamily: "monospace" }}>
                  {typeof s.value === "number" ? s.value.toFixed(2) : s.value}
                </span>
              </div>
            ))}
          </div>

          {/* Signal Summary Bar */}
          {(() => {
            const pos = signals.filter(s => s.result === "positive").length;
            const neg = signals.filter(s => s.result === "negative").length;
            const neu = signals.filter(s => s.result === "neutral").length;
            const total = signals.length || 1;
            return (
              <div style={{ marginTop: "1rem" }}>
                {/* Visual bar */}
                <div style={{ display: "flex", height: "6px", borderRadius: "3px", overflow: "hidden", gap: "2px" }}>
                  <div style={{ width: `${(pos / total) * 100}%`, background: "var(--signal-positive)", borderRadius: "3px", transition: "width 0.5s ease" }} />
                  <div style={{ width: `${(neu / total) * 100}%`, background: "var(--signal-neutral)", borderRadius: "3px", transition: "width 0.5s ease" }} />
                  <div style={{ width: `${(neg / total) * 100}%`, background: "var(--signal-negative)", borderRadius: "3px", transition: "width 0.5s ease" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: "1.2rem", marginTop: "0.6rem" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--signal-positive)", fontWeight: 600 }}>{pos} Positive</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--signal-neutral)", fontWeight: 600 }}>{neu} Neutral</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--signal-negative)", fontWeight: 600 }}>{neg} Negative</span>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ════════════════════════════════════ */}
      {/*  FINANCIAL DATA BENTO               */}
      {/* ════════════════════════════════════ */}
      {financials && (
        <div className="glass-panel animate-fade-in stagger-3" style={{ padding: "1.5rem 1.8rem" }}>
          <h3 style={{ fontSize: "1.05rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.2rem" }}>📊</span> Financial Data
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "0.6rem" }}>
            {[
              { label: "Market Cap", value: formatCurrency(financials.marketCap, currency) },
              { label: "Revenue", value: formatCurrency(financials.revenue, currency) },
              { label: "Net Income", value: formatCurrency(financials.netIncome, currency) },
              { label: "P/E Ratio", value: financials.peRatio != null ? financials.peRatio.toFixed(1) : "N/A" },
              { label: "P/B Ratio", value: financials.pbRatio != null ? financials.pbRatio.toFixed(1) : "N/A" },
              { label: "Revenue Growth", value: formatPercent(financials.revenueGrowthYoY) },
              { label: "Net Margin", value: formatPercent(financials.netMargin) },
              { label: "Gross Margin", value: formatPercent(financials.grossMargin) },
              { label: "ROE", value: formatPercent(financials.returnOnEquity) },
              { label: "D/E Ratio", value: financials.debtToEquity != null ? financials.debtToEquity.toFixed(2) : "N/A" },
              { label: "Current Ratio", value: financials.currentRatio != null ? financials.currentRatio.toFixed(2) : "N/A" },
              { label: "Free Cash Flow", value: formatCurrency(financials.freeCashFlow, currency) },
            ].map((item) => (
              <div key={item.label} className="data-card">
                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.3rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.label}</p>
                <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════ */}
      {/*  DERIVED METRICS                    */}
      {/* ════════════════════════════════════ */}
      {derivedMetrics && (
        <div className="glass-panel animate-fade-in stagger-4" style={{ padding: "1.5rem 1.8rem" }}>
          <h3 style={{ fontSize: "1.05rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.2rem" }}>🧮</span> Derived Metrics
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))", gap: "0.6rem" }}>
            {[
              { label: "PEG Ratio", value: derivedMetrics.pegRatio != null ? derivedMetrics.pegRatio.toFixed(2) : "N/A" },
              { label: "Earnings Yield", value: derivedMetrics.earningsYield != null ? derivedMetrics.earningsYield.toFixed(2) + "%" : "N/A" },
              { label: "Valuation Premium", value: derivedMetrics.valuationPremium != null ? formatPercent(derivedMetrics.valuationPremium) : "N/A" },
              { label: "Margin Advantage", value: derivedMetrics.marginAdvantage != null ? formatPercent(derivedMetrics.marginAdvantage) : "N/A" },
            ].map((item) => (
              <div key={item.label} className="data-card">
                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "0.3rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>{item.label}</p>
                <p style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════ */}
      {/*  NEWS FEED                          */}
      {/* ════════════════════════════════════ */}
      {news && news.items && news.items.length > 0 && (
        <div className="glass-panel animate-fade-in stagger-4" style={{ padding: "1.5rem 1.8rem" }}>
          <h3 style={{ fontSize: "1.05rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.2rem" }}>📰</span> Recent News
            <span style={{
              marginLeft: "0.5rem", fontSize: "0.72rem", padding: "0.2rem 0.7rem",
              borderRadius: "9999px", fontWeight: 700, textTransform: "uppercase",
              background: sentimentBg(news.overallSentiment), color: sentimentColor(news.overallSentiment),
            }}>
              {news.overallSentiment}
            </span>
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {news.items.map((item, i) => (
              <a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="signal-row"
                style={{ textDecoration: "none", borderRadius: "var(--radius-sm)", gridTemplateColumns: "1fr auto" }}
              >
                <span style={{ fontSize: "0.88rem", color: "var(--text-secondary)" }}>{item.headline}</span>
                <span style={{
                  fontSize: "0.68rem", padding: "0.15rem 0.6rem", borderRadius: "9999px", fontWeight: 700,
                  background: sentimentBg(item.sentiment), color: sentimentColor(item.sentiment), whiteSpace: "nowrap",
                }}>
                  {item.sentiment}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════ */}
      {/*  FOOTER META                        */}
      {/* ════════════════════════════════════ */}
      {metadata && (
        <div className="animate-fade-in stagger-5" style={{ textAlign: "center", padding: "0.8rem 0" }}>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {metadata.dataSourcesUsed?.join(" · ")} · {new Date(metadata.analyzedAt).toLocaleTimeString()}
            · {(metadata.durationMs / 1000).toFixed(1)}s
          </p>
          {metadata.errors && metadata.errors.length > 0 && (
            <p style={{ fontSize: "0.7rem", color: "#eab308", marginTop: "0.2rem" }}>
              ⚠ {metadata.errors.length} warning{metadata.errors.length > 1 ? "s" : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
}