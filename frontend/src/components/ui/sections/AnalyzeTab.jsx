import React from 'react';
import { FileText, Target, Brain, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

/**
 * Component for the "Analyze Match" tab.
 * Manages text inputs and triggers the analysis or summary generation.
 */
const AnalyzeTab = ({
  resumeText,
  setResumeText,
  jobDescription,
  setJobDescription,
  targetJobTitle,
  setTargetJobTitle,
  handleAnalysis,
  loadingAnalyze,
  handleGenerateSummary,
  loadingSummary,
}) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-wrap justify-between items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Resume Content
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateSummary}
              disabled={loadingSummary || !resumeText}
              className="gap-2"
            >
              {loadingSummary ? (
                <div className="animate-spin w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full" />
              ) : (
                <Sparkles className="w-4 h-4 text-indigo-600" />
              )}
              Generate AI Summary
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Your resume text will appear here..."
            className="min-h-60 sm:min-h-72 resize-y"
          />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            Job Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here..."
            className="min-h-60 sm:min-h-72 resize-y"
          />
        </CardContent>
      </Card>

      <div className="lg:col-span-2 space-y-4">
        <Input
            value={targetJobTitle}
            onChange={(e) => setTargetJobTitle(e.target.value)}
            placeholder="Enter Target Job Title (e.g., Senior Backend Developer)"
            className="text-lg"
        />
        <Button
          type="button"
          onClick={handleAnalysis}
          disabled={loadingAnalyze || !resumeText || !jobDescription}
          size="lg"
          className="w-full gap-2 text-lg py-6"
        >
          {loadingAnalyze ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              Analyzing Match...
            </>
          ) : (
            <>
              <Brain className="w-5 h-5" />
              Analyze Resume Match
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default AnalyzeTab;