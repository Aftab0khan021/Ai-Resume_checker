import React from 'react';
import { Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnalysisDetailContent from './AnalysisDetailContent';

/**
 * Component for the "View Results" tab.
 * Displays the analysis and action buttons.
 */
const ResultsTab = ({ analysis, resetApp }) => {
  if (!analysis) return null; // Should be handled by App.js (disabled tab)

  return (
    <div className="space-y-6">
      <AnalysisDetailContent analysis={analysis} />
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button
          onClick={resetApp}
          variant="outline"
          size="lg"
          className="gap-2 w-full sm:w-auto"
        >
          <Upload className="w-4 h-4" />
          New Analysis
        </Button>
        <Button onClick={() => window.print()} size="lg" className="gap-2 w-full sm:w-auto">
          <Download className="w-4 h-4" />
          Export Results
        </Button>
      </div>
    </div>
  );
};

export default ResultsTab;