"use client";

import { useState } from "react";
import SearchHero from "./SearchHero";
import LoadingStepper from "./LoadingStepper";
import DisambiguationCards from "./DisambiguationCards";
import AnalysisReport from "./AnalysisReport";
import ErrorMessage from "./ErrorMessage";

/**
 * ClientApp serves as the finite-state machine orchestrating the frontend UI.
 * It manages the transitions between search, loading, disambiguation, and results.
 */
export default function ClientApp() {
  // viewState: "idle" | "loading" | "disambiguation" | "result" | "error"
  const [viewState, setViewState] = useState("idle");
  const [currentData, setCurrentData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  /**
   * Primary action handler triggered by the SearchHero or Disambiguation cards.
   * @param {string} query - The company name or ticker to analyze.
   */
  const handleSearch = async (query) => {
    if (!query || query.trim() === "") return;

    // Reset state for new search
    setViewState("loading");
    setErrorMsg(null);
    setCurrentData(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: query.trim() }),
      });

      const result = await response.json();

      if (!response.ok || result.type === "error") {
        setViewState("error");
        setErrorMsg(result.message || "An unexpected error occurred. Please try again.");
        return;
      }

      if (result.type === "disambiguation") {
        setViewState("disambiguation");
        setCurrentData(result.matches);
        return;
      }

      if (result.type === "result") {
        setViewState("result");
        setCurrentData(result.analysis);
        return;
      }

      // Fallback if API returns an unknown schema type
      setViewState("error");
      setErrorMsg("Received an invalid response format from the server.");
    } catch (err) {
      console.error("Fetch error:", err);
      setViewState("error");
      setErrorMsg("Network error. Please check your connection and try again.");
    }
  };

  /**
   * Helper to reset the application back to the initial state.
   */
  const handleReset = () => {
    setViewState("idle");
    setCurrentData(null);
    setErrorMsg(null);
  };

  // ---------------------------------------------------------------------------
  // RENDER ROUTER
  // Conditionally renders the correct component based strictly on viewState
  // ---------------------------------------------------------------------------
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "2rem" }}>
      {viewState === "idle" && (
        <SearchHero onSearch={handleSearch} />
      )}

      {viewState === "loading" && (
        <LoadingStepper />
      )}

      {viewState === "disambiguation" && (
        <DisambiguationCards 
          matches={currentData} 
          onSelect={handleSearch} 
          onCancel={handleReset}
        />
      )}

      {viewState === "result" && (
        <AnalysisReport 
          analysis={currentData} 
          onNewSearch={handleReset} 
        />
      )}

      {viewState === "error" && (
        <ErrorMessage 
          message={errorMsg} 
          onRetry={handleReset} 
        />
      )}
    </div>
  );
}
