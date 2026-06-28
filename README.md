# AI Investment Research Agent (EquityLens)

An autonomous AI agent that takes a company name, fetches real-time financial data and news, computes deterministic signals, and produces a transparent investment analysis with a final Invest/Pass verdict.

## Overview

EquityLens bridges the gap between raw financial data and actionable investment analysis. Unlike typical LLM wrappers that simply pass data to an AI model for a subjective opinion, EquityLens uses a **signal-based architecture**. It computes verifiable financial signals deterministically in code (e.g., leverage ratios against sector benchmarks, growth trajectories against inflation), and only uses the LLM to synthesize and interpret the signal pattern. 

This results in a two-layer output:
1. **Evidence Layer**: Objective, verifiable facts and computed signals.
2. **AI Interpretation**: The LLM's synthesis of the evidence, generating a verdict, confidence level, and bull/bear cases.

## Architecture

The system is built on a Next.js framework with a plain orchestration pipeline, separating data collection, deterministic analysis, and AI interpretation.

- **Frontend**: Next.js App Router (React)
- **API Layer**: Next.js API Routes orchestrating a 5-step analysis pipeline
- **Data Providers**:
  - Financial Modeling Prep (FMP) for company profiles, income statements, and sector data
  - Tavily Search for real-time news and sentiment
- **LLM Integration**: Google Gemini 2.0 Flash (via LangChain structured outputs)
- **Validation**: Zod schema validation at all system boundaries

## Setup and Run Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Copy `.env.example` to `.env.local` and add your API keys:
   ```bash
   cp .env.example .env.local
   ```
   *Required Keys:*
   - `GOOGLE_API_KEY`: Google Gemini API key
   - `FMP_API_KEY`: Financial Modeling Prep API key
   - `TAVILY_API_KEY`: Tavily Search API key

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:3000` to use the application.

## Key Decisions & Trade-offs

- **Signal-Based Scoring vs. LLM Scoring**: We chose to compute signals in code rather than having the LLM score companies 1-10. This ensures deterministic, auditable results and removes LLM subjectivity from the quantitative analysis.
- **Why no LangGraph**: Evaluated LangGraph for orchestration but chose a plain async function because the research flow is linear with no cycles or dynamic replanning. LangChain core handles structured LLM output.
- **Full-Stack Next.js vs. Separate Frontend/Backend**: A monolithic Next.js architecture (App Router + API Routes) was chosen over a separate React SPA and Express backend. This eliminates CORS complexities, allows shared Zod schemas across the stack, and enables zero-config deployment to Vercel—maximizing development speed for a 24-hour MVP while remaining highly scalable via serverless functions.
- **Signal Thresholds**: Thresholds are general-purpose defaults based on standard equity analysis conventions (e.g., D/E > 2.0 as high leverage).
- **Free Cash Flow Approximation**: To minimize FMP API quota usage, raw FCF is not fetched via the cash-flow-statement endpoint. Instead, it is mathematically approximated using `Free Cash Flow per Share * Outstanding Shares` (where Outstanding Shares = `marketCap / price`). 
- **Sentiment Analysis**: News sentiment uses a simple deterministic keyword matching system (e.g., checking headlines for "surge", "beat" vs "miss", "plunge"). An advanced NLP pipeline was excluded to prevent latency and infrastructure overhead for a 24-hour MVP. The LLM's interpretation phase naturally mitigates any minor sentiment classification errors.

## Testing

We have consolidated our test scripts into a dedicated `tests/` directory. To run the full live end-to-end pipeline:
```bash
node --env-file=.env.local tests/test-e2e.mjs
```

## Engineering Challenges & Resolutions

### 1. FMP Legacy API Deprecation
- **Challenge**: During live integration testing, we discovered that FMP abruptly restricted their `v3` legacy endpoints (Search, Profile, Key Metrics, Income Statement) behind a paywall (HTTP 403) for free-tier users, breaking our data layer. Furthermore, the new Stable API for Key Metrics stripped out crucial valuation ratios (`P/E`, `P/B`, `ROE`, etc.).
- **Resolution**: We successfully migrated `lib/resolve.js` and `lib/research.js` to the FMP Stable APIs (`/stable/search-name` and `/stable/search-symbol`). To handle the missing ratios, we added a fourth parallel data fetch to the `/stable/ratios-ttm` endpoint and mapped the new keys back to our robust internal Zod schema (`FinancialDataSchema`). Because our architecture enforces strict boundaries, the rest of the application (Compute, Signal Engine, Orchestrator) required zero changes.

### 2. Graceful LLM Fallback (Rate Limits)
- **Challenge**: Generative AI APIs (like Gemini) often suffer from stringent rate limits or temporary outages.
- **Resolution**: The `Orchestrator` catches LLM failures (like a `429 Too Many Requests`) natively. Instead of crashing, it degrades gracefully by returning a deterministic verdict (`Decision: INVEST/PASS`, `Confidence: MEDIUM`) based entirely on the Signal Balance computed in step 3.

## Current Status
- ✅ **Module 1 (Foundation)**: Setup, Zod schemas, formatters, Signal Engine (`lib/signals.js`).
- ✅ **Module 2 (Data Providers)**: FMP (Stable API migration) + Tavily fetchers (`lib/research.js`), Disambiguation (`lib/resolve.js`), offline cache.
- ✅ **Module 3 (Compute Layer)**: Orchestrator wiring (`lib/orchestrator.js`) and quantitative orchestration (`lib/compute.js`).
- ✅ **Module 4 (LLM Layer)**: LangChain Google GenAI integration, Live Integration Testing, and Graceful Fallback verified.
- ✅ **Module 5 (Frontend API & UI)**: 
  - ✅ Next.js API Route (`app/api/analyze/route.js`)
  - ✅ Premium Design System (`app/globals.css`, `app/layout.js`) with responsive Light/Dark mode and dynamic mesh background.
  - ✅ React State Core (`app/page.js`, `ClientApp.jsx`)
  - ✅ View Components: `SearchHero`, `LoadingStepper`, `AnalysisReport`, `DisambiguationCards`, and `ErrorMessage` completely built with bento-box layouts, gradient pills, and staggered CSS animations.

## Data Providers & Demo Resilience

EquityLens integrates with:
- **Financial Modeling Prep (FMP)**: Provides company profile, key metrics, and income statements.
- **Tavily Search**: Retrieves recent financial news and provides basic keyword-based sentiment tagging.

**Demo Insurance (Cache Fallback)**: FMP's free tier is limited to 250 requests/day. To guarantee a flawless demo experience regardless of API limits, EquityLens ships with pre-cached data for 5 sample companies:
1. Apple Inc. (AAPL)
2. Infosys (INFY.NS)
3. Tesla (TSLA)
4. Reliance Industries (RELIANCE.NS)
5. Zomato (ZOMATO.NS)

If live API requests fail (e.g., due to rate limits), the system falls back to the local cache, allowing the AI interpretation and signal generation steps to continue seamlessly.
