"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "../lib/format.js";

export default function PriceChart({ data, currency }) {
  const formattedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.map((d) => ({
      ...d,
      dateFormatted: new Date(d.date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    }));
  }, [data]);

  if (formattedData.length === 0) {
    return null;
  }

  // Calculate min and max for the Y axis to give the chart some padding
  const minPrice = Math.min(...formattedData.map((d) => d.close));
  const maxPrice = Math.max(...formattedData.map((d) => d.close));
  const padding = (maxPrice - minPrice) * 0.1;

  return (
    <div className="glass-panel animate-fade-in stagger-2" style={{ padding: "1.5rem 1.8rem" }}>
      <h3 style={{ fontSize: "1.05rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ fontSize: "1.2rem" }}>📈</span> 1-Year Price History
      </h3>
      <div style={{ width: "100%", height: "240px", marginTop: "1rem" }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="dateFormatted" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: "var(--text-muted)" }} 
              minTickGap={30}
            />
            <YAxis 
              domain={[minPrice - padding, maxPrice + padding]} 
              hide={true} 
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div style={{
                      background: "var(--bg-secondary)",
                      border: "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-sm)",
                      padding: "0.5rem 0.8rem",
                      boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                    }}>
                      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.2rem" }}>{label}</p>
                      <p style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        {formatCurrency(payload[0].value, currency)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="close"
              stroke="var(--accent-primary)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrice)"
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
