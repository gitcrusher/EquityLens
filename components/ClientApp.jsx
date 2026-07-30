"use client";

import { useState, useEffect } from "react";
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

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (e) => {
      if (e.state && e.state.viewState) {
        setViewState(e.state.viewState);
        setCurrentData(e.state.currentData);
        setErrorMsg(e.state.errorMsg);
      } else {
        setViewState("idle");
        setCurrentData(null);
        setErrorMsg(null);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateTo = (stateObj) => {
    setViewState(stateObj.viewState);
    setCurrentData(stateObj.currentData);
    setErrorMsg(stateObj.errorMsg);
    // Push the state to the browser history
    window.history.pushState(stateObj, "");
  };

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
        navigateTo({ viewState: "error", errorMsg: result.message || "An unexpected error occurred. Please try again.", currentData: null });
        return;
      }

      if (result.type === "disambiguation") {
        navigateTo({ viewState: "disambiguation", currentData: result.matches, errorMsg: null });
        return;
      }

      if (result.type === "result") {
        navigateTo({ viewState: "result", currentData: result.analysis, errorMsg: null });
        return;
      }

      // Fallback if API returns an unknown schema type
      navigateTo({ viewState: "error", errorMsg: "Received an invalid response format from the server.", currentData: null });
    } catch (err) {
      console.error("Fetch error:", err);
      navigateTo({ viewState: "error", errorMsg: "Network error. Please check your connection and try again.", currentData: null });
    }
  };

  /**
   * Helper to reset the application back to the initial state.
   */
  const handleReset = () => {
    navigateTo({ viewState: "idle", currentData: null, errorMsg: null });
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
