// src/components/ui/sections/AnalyzeTab.jsx
import React from "react";
import { Loader2, Brain, AlertCircle } from "lucide-react";
import { Button } from "../button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card";
import { Textarea } from "../textarea";
import { Input } from "../input";

const MAX_RESUME = 50000;
const MAX_JD = 20000;

const CharCounter = ({ current, max, warn = 0.85 }) => {
  const pct = current / max;
  const color =
    pct >= 1 ? "text-red-600" : pct >= warn ? "text-yellow-600" : "text-slate-400";
  return (
    <span className={`text-xs font-mono ${color}`}>
      {current.toLocaleString()} / {max.toLocaleString()}
    </span>
  );
};

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
  const resumeLen = (resumeText || "").length;
  const jdLen = (jobDescription || "").length;
  const canAnalyze = !loadingAnalyze && resumeText?.trim() && jobDescription?.trim();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleAnalysis();
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resume Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Resume</CardTitle>
            <CardDescription>
              This text was extracted from your upload. You can edit it here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              className="h-80 lg:h-96 font-mono text-xs resize-y"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value.slice(0, MAX_RESUME))}
              placeholder="Paste your resume text here if you didn't upload a file."
            />
            {/* Character counter */}
            <div className="flex items-center justify-between">
              <CharCounter current={resumeLen} max={MAX_RESUME} />
              {resumeLen === 0 && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> No resume text
                </span>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerateSummary}
              disabled={loadingSummary || loadingAnalyze || !resumeText?.trim()}
              className="w-full"
            >
              {loadingSummary ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…</>
              ) : (
                <><Brain className="w-4 h-4 mr-2" /> ✨ Generate AI Summary</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Job Details Card */}
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>
              Paste the target job title and job description below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={targetJobTitle}
              onChange={(e) => setTargetJobTitle(e.target.value.slice(0, 200))}
              placeholder="Target Job Title (e.g., Senior Software Engineer)"
              className="font-medium"
            />
            <Textarea
              className="h-72 lg:h-80 font-mono text-xs resize-y"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value.slice(0, MAX_JD))}
              placeholder="Paste the full job description here…"
            />
            {/* Character counter */}
            <div className="flex items-center justify-between">
              <CharCounter current={jdLen} max={MAX_JD} />
              {jdLen === 0 && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> No job description
                </span>
              )}
            </div>
            <Button
              type="submit"
              disabled={!canAnalyze}
              className="w-full"
            >
              {loadingAnalyze ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing…</>
              ) : (
                "Analyze Resume Match"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  );
};

export default AnalyzeTab;
