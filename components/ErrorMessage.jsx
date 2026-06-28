"use client";

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="animate-fade-in" style={{ maxWidth: "550px", margin: "8vh auto 0", textAlign: "center" }}>
      {/* Animated error icon */}
      <div style={{
        width: "80px", height: "80px", borderRadius: "50%", margin: "0 auto 1.5rem",
        background: "var(--signal-negative-bg)",
        border: "2px solid var(--signal-negative)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "2.2rem",
        animation: "float 3s ease-in-out infinite",
      }}>
        ⚠️
      </div>

      <h2 style={{ fontSize: "1.5rem", color: "var(--signal-negative)", marginBottom: "0.8rem" }}>
        Something went wrong
      </h2>

      <div className="glass-panel" style={{ padding: "1.2rem 1.5rem", marginBottom: "2rem", textAlign: "left" }}>
        <p style={{ fontSize: "0.92rem", lineHeight: 1.65 }}>
          {message || "An unexpected error occurred."}
        </p>
      </div>

      <button
        onClick={onRetry}
        style={{
          background: "var(--accent-gradient)", color: "#fff", border: "none",
          borderRadius: "9999px", padding: "0.8rem 2.2rem",
          fontSize: "0.95rem", fontWeight: 700, cursor: "pointer",
          transition: "all var(--transition-normal)",
          boxShadow: "0 4px 16px var(--accent-glow)",
        }}
        onMouseEnter={(e) => { e.target.style.transform = "translateY(-3px)"; e.target.style.boxShadow = "0 8px 28px var(--accent-glow)"; }}
        onMouseLeave={(e) => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 4px 16px var(--accent-glow)"; }}
      >
        ← Try Another Company
      </button>
    </div>
  );
}