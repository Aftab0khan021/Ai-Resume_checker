// src/components/ui/sections/ResultsTab.jsx
import React from "react";
import { Button } from "../button";
import AnalysisDetailContent from "./AnalysisDetailContent";

const ResultsTab = ({ analysis, resetApp }) => {
  if (!analysis) {
    return (
      <div className="text-center p-12 bg-white rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-slate-700">No Analysis Found</h2>
        <p className="text-slate-500 mb-4">Please upload a resume and job description to see your results.</p>
        <Button onClick={resetApp}>Start New Analysis</Button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Analysis Results</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>Export Results (PDF)</Button>
          <Button onClick={resetApp}>Start New Analysis</Button>
        </div>
      </div>

      <AnalysisDetailContent analysis={analysis} />
    </div>
  );
};

export default ResultsTab;
