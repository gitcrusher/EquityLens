import { Inter } from "next/font/google";
import "./globals.css";
import ThemeToggle from "../components/ThemeToggle";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "EquityLens | AI Investment Research",
  description: "Signal-based autonomous AI agent for deep financial analysis and deterministic verdicts.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', t);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={inter.variable}>
        <div className="bg-mesh" />

        <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1.5rem 3rem', width: '100%', flex: 1, display: 'flex', flexDirection: 'column' }}>

          {/* ── Header ── */}
          <header style={{
            display: 'flex', alignItems: 'center', marginBottom: '2.5rem',
            animation: 'fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards', opacity: 0,
          }}>
            {/* Logo */}
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px',
              background: 'var(--accent-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: '1rem',
              marginRight: '0.8rem',
              boxShadow: '0 4px 16px var(--accent-glow)',
            }}>
              EL
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '1.3rem', color: 'var(--text-primary)', fontWeight: 800, letterSpacing: '-0.03em' }}>
                Equity<span style={{ color: 'var(--accent-primary)' }}>Lens</span>
              </h1>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', letterSpacing: '0.02em' }}>Deterministic AI Investment Signals</p>
            </div>
            <ThemeToggle />
          </header>

          {children}

          {/* ── Footer ── */}
          <footer style={{ marginTop: 'auto', paddingTop: '3rem', textAlign: 'center', borderTop: '1px solid var(--border-subtle)' }}>
            <p style={{ fontSize: '0.8rem' }}>
              Powered by <strong>Financial Modeling Prep</strong> · <strong>Tavily Search</strong> · <strong>Google Gemini</strong>
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
              Not financial advice. For educational demonstration only.
            </p>
          </footer>
        </main>
      </body>
    </html>
  );
}
