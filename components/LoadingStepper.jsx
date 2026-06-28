"use client";

import { useState, useEffect } from "react";

const STEPS = [
  { label: "Resolving company identity", icon: "🔍", color: "var(--accent-primary)" },
  { label: "Gathering financial data", icon: "📊", color: "var(--accent-secondary)" },
  { label: "Computing deterministic signals", icon: "⚙️", color: "var(--signal-positive)" },
  { label: "Synthesizing AI verdict", icon: "🤖", color: "var(--accent-primary)" },
];

export default function LoadingStepper() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const progress = ((activeStep + 1) / STEPS.length) * 100;

  return (
    <div className="animate-fade-in" style={{ maxWidth: "550px", margin: "6vh auto 0", width: "100%" }}>

      {/* ── Central Spinner ── */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <div style={{
          width: "64px", height: "64px", margin: "0 auto 1.5rem",
          borderRadius: "50%",
          background: "var(--accent-gradient)",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "spin 2s linear infinite",
          boxShadow: "0 0 30px var(--accent-glow)",
        }}>
          <div style={{
            width: "52px", height: "52px", borderRadius: "50%",
            background: "var(--bg-primary)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.5rem",
          }}>
            {STEPS[activeStep].icon}
          </div>
        </div>
        <h2 style={{ fontSize: "1.4rem", color: "var(--text-primary)", marginBottom: "0.4rem" }}>
          Analyzing...
        </h2>
        <p style={{ fontSize: "0.9rem" }}>{STEPS[activeStep].label}</p>
      </div>

      {/* ── Progress Bar ── */}
      <div style={{
        height: "4px", borderRadius: "2px",
        background: "var(--chip-bg)",
        marginBottom: "2rem", overflow: "hidden",
      }}>
        <div style={{
          height: "100%", borderRadius: "2px",
          background: "var(--accent-gradient)",
          width: `${progress}%`,
          transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
        }} />
      </div>

      {/* ── Step List ── */}
      <div className="glass-panel" style={{ padding: "1.2rem 1.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {STEPS.map((step, i) => {
            const isDone = i < activeStep;
            const isActive = i === activeStep;
            return (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", gap: "0.8rem",
                  padding: "0.7rem 0.8rem", borderRadius: "var(--radius-sm)",
                  background: isActive ? "var(--card-hover-bg)" : "transparent",
                  opacity: i <= activeStep ? 1 : 0.35,
                  transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                  animation: isActive ? "slideInLeft 0.4s ease forwards" : "none",
                }}
              >
                {/* Status icon */}
                <div style={{
                  width: "28px", height: "28px", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.85rem",
                  background: isDone ? "var(--signal-positive-bg)" : isActive ? "var(--accent-glow)" : "var(--chip-bg)",
                  border: `1.5px solid ${isDone ? "var(--signal-positive)" : isActive ? "var(--accent-primary)" : "var(--border-subtle)"}`,
                  transition: "all 0.4s ease",
                }}>
                  {isDone ? "✓" : isActive ? (
                    <div style={{
                      width: "8px", height: "8px", borderRadius: "50%",
                      background: "var(--accent-primary)",
                      animation: "progressPulse 1s ease-in-out infinite",
                    }} />
                  ) : (i + 1)}
                </div>

                <span style={{
                  fontSize: "0.9rem",
                  fontWeight: isActive ? 600 : 400,
                  color: isDone ? "var(--signal-positive)" : isActive ? "var(--text-primary)" : "var(--text-muted)",
                  transition: "color 0.3s ease",
                }}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}