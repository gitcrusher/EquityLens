"use client";

import { useState } from "react";

export default function SearchHero({ onSearch }) {
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);
  const [focusedChip, setFocusedChip] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      setError("Please enter a company name or ticker.");
      return;
    }
    setError(null);
    onSearch(trimmed);
  };

  const handleChipClick = (ticker) => {
    setQuery(ticker);
    setError(null);
    onSearch(ticker);
  };

  const sampleCompanies = [
    { name: "Apple", ticker: "AAPL", emoji: "🍎" },
    { name: "Tesla", ticker: "TSLA", emoji: "⚡" },
    { name: "Infosys", ticker: "INFY.NS", emoji: "💎" },
    { name: "Reliance", ticker: "RELIANCE.NS", emoji: "🏭" },
    { name: "Zomato", ticker: "ZOMATO.NS", emoji: "🍕" },
  ];

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", width: "100%", marginTop: "5vh" }}>

      {/* ── Hero Text ── */}
      <div className="animate-fade-in" style={{ textAlign: "center", marginBottom: "3rem" }}>
        <div style={{ marginBottom: "1.2rem" }}>
          <span className="gradient-pill" style={{ animation: "fadeInUp 0.4s ease forwards" }}>
            🔬 AI-Powered Analysis
          </span>
        </div>
        <h2 className="shimmer-text" style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)", lineHeight: 1.15, marginBottom: "1rem" }}>
          Decode the Market.
        </h2>
        <p style={{ fontSize: "1.1rem", maxWidth: "550px", margin: "0 auto", lineHeight: 1.7 }}>
          Enter any publicly traded company and get a deterministic signal analysis with an AI-synthesized investment verdict.
        </p>
      </div>

      {/* ── Search Bar ── */}
      <form
        onSubmit={handleSubmit}
        className="glass-panel animate-fade-in stagger-2"
        style={{
          padding: "0.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          maxWidth: "650px",
          margin: "0 auto",
        }}
      >
        <label htmlFor="companySearch" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
          Search Company
        </label>
        
        {/* Search icon */}
        <div style={{ padding: "0 0.5rem 0 0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <input
          id="companySearch"
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setError(null); }}
          placeholder="Search company name or ticker..."
          style={{
            flex: 1,
            padding: "1rem 0.5rem",
            fontSize: "1.05rem",
            background: "transparent",
            border: "none",
            color: "var(--text-primary)",
          }}
        />

        <button
          type="submit"
          disabled={!query.trim()}
          style={{
            padding: "0.8rem 1.8rem",
            fontSize: "0.95rem",
            fontWeight: 700,
            background: query.trim() ? "var(--accent-gradient)" : "var(--chip-bg)",
            color: query.trim() ? "#fff" : "var(--text-muted)",
            border: "none",
            borderRadius: "var(--radius-md)",
            cursor: query.trim() ? "pointer" : "not-allowed",
            transition: "all var(--transition-normal)",
            boxShadow: query.trim() ? "0 4px 16px var(--accent-glow)" : "none",
          }}
          onMouseEnter={(e) => {
            if (query.trim()) { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 24px var(--accent-glow)"; }
          }}
          onMouseLeave={(e) => {
            if (query.trim()) { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 4px 16px var(--accent-glow)"; }
          }}
        >
          Analyze →
        </button>
      </form>

      {error && (
        <p className="animate-fade-in" style={{ color: "var(--signal-negative)", fontSize: "0.85rem", textAlign: "center", marginTop: "0.75rem" }}>
          {error}
        </p>
      )}

      {/* ── Quick Pick Chips ── */}
      <div className="animate-fade-in stagger-3" style={{ marginTop: "2.5rem", textAlign: "center" }}>
        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem", fontWeight: 600 }}>
          Quick Pick
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.6rem" }}>
          {sampleCompanies.map((co, i) => (
            <button
              key={co.ticker}
              onClick={() => handleChipClick(co.ticker)}
              onMouseEnter={() => setFocusedChip(i)}
              onMouseLeave={() => setFocusedChip(null)}
              style={{
                background: focusedChip === i ? "var(--card-hover-bg)" : "var(--chip-bg)",
                border: `1px solid ${focusedChip === i ? "var(--accent-primary)" : "var(--border-subtle)"}`,
                borderRadius: "9999px",
                padding: "0.55rem 1.2rem",
                color: focusedChip === i ? "var(--text-primary)" : "var(--text-secondary)",
                fontSize: "0.88rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                transform: focusedChip === i ? "translateY(-3px) scale(1.05)" : "translateY(0) scale(1)",
                boxShadow: focusedChip === i ? "0 6px 20px var(--accent-glow)" : "none",
              }}
            >
              <span style={{ marginRight: "0.35rem" }}>{co.emoji}</span>
              {co.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Feature Cards ── */}
      <div className="animate-fade-in stagger-4" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginTop: "3.5rem", maxWidth: "650px", margin: "3.5rem auto 0" }}>
        {[
          { icon: "📊", title: "Signal Engine", desc: "Deterministic, code-computed financial signals" },
          { icon: "🤖", title: "AI Verdict", desc: "Google Gemini synthesizes bull & bear cases" },
          { icon: "📰", title: "Live News", desc: "Real-time sentiment from Tavily Search" },
        ].map((f, i) => (
          <div
            key={f.title}
            className="data-card"
            style={{ textAlign: "center", padding: "1.5rem 1rem" }}
          >
            <div style={{ fontSize: "1.8rem", marginBottom: "0.6rem" }}>{f.icon}</div>
            <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.3rem" }}>{f.title}</p>
            <p style={{ fontSize: "0.75rem", lineHeight: 1.5 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}