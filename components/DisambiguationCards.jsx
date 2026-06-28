"use client";

export default function DisambiguationCards({ matches, onSelect, onCancel }) {
  if (!matches || matches.length === 0) return null;

  return (
    <div className="animate-fade-in" style={{ maxWidth: "700px", margin: "4vh auto 0", width: "100%" }}>

      {/* ── Header ── */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <span className="gradient-pill" style={{ marginBottom: "1rem", display: "inline-flex" }}>🎯 Multiple Matches</span>
        <h2 style={{ fontSize: "1.8rem", color: "var(--text-primary)", marginTop: "0.8rem", marginBottom: "0.4rem" }}>
          Which company?
        </h2>
        <p style={{ fontSize: "0.95rem" }}>
          Select the one you want to analyze.
        </p>
      </div>

      {/* ── Company Cards ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {matches.map((match, i) => (
          <button
            key={match.ticker}
            onClick={() => onSelect(match.ticker)}
            className={`glass-panel animate-fade-in stagger-${Math.min(i + 1, 5)}`}
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "1.2rem 1.5rem", cursor: "pointer", textAlign: "left",
              width: "100%", border: "1px solid var(--border-subtle)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent-primary)";
              e.currentTarget.style.transform = "translateY(-3px) scale(1.01)";
              e.currentTarget.style.boxShadow = "0 12px 32px var(--accent-glow)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-subtle)";
              e.currentTarget.style.transform = "translateY(0) scale(1)";
              e.currentTarget.style.boxShadow = "var(--shadow-glass)";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
              {/* Index circle */}
              <div style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: "var(--accent-gradient)", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.8rem", fontWeight: 700, flexShrink: 0,
              }}>
                {i + 1}
              </div>
              <div>
                <span style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--text-primary)" }}>
                  {match.name}
                </span>
                <span style={{ marginLeft: "0.6rem", fontSize: "0.85rem", color: "var(--accent-primary)", fontWeight: 600 }}>
                  {match.ticker}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{match.exchange}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* ── Back Button ── */}
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <button
          onClick={onCancel}
          style={{
            background: "none", border: "1px solid var(--border-subtle)",
            borderRadius: "9999px", padding: "0.6rem 1.8rem",
            color: "var(--text-muted)", cursor: "pointer", fontSize: "0.88rem", fontWeight: 500,
            transition: "all var(--transition-normal)",
          }}
          onMouseEnter={(e) => {
            e.target.style.color = "var(--text-primary)";
            e.target.style.borderColor = "var(--accent-primary)";
            e.target.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.color = "var(--text-muted)";
            e.target.style.borderColor = "var(--border-subtle)";
            e.target.style.transform = "translateY(0)";
          }}
        >
          ← Search Again
        </button>
      </div>
    </div>
  );
}