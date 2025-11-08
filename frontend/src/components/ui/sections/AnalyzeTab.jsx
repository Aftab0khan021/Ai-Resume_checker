import React from "react";
import { Loader2 } from "lucide-react";
// --- FIXED IMPORTS ---
import { Button } from "../button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card";
import { Textarea } from "../textarea";
import { Input } from "../input";
// ---------------------

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
   <form onSubmit={(e) => { e.preventDefault(); handleAnalysis(); }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Resume */}
        <Card>
          <CardHeader>
            <CardTitle>Your Resume</CardTitle>
            <CardDescription>
              This text was extracted from your upload. You can edit it here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              className="h-80 lg:h-96 font-mono text-xs"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here if you didn't upload a file."
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleGenerateSummary}
              disabled={loadingSummary || loadingAnalyze || !resumeText}
              className="w-full"
            >
              {loadingSummary ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                "✨ Generate AI Summary"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Right Column: Job Description & Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>
              Paste the target job title and job description below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              value={targetJobTitle}
              onChange={(e) => setTargetJobTitle(e.target.value)}
              placeholder="Target Job Title (e.g., Senior Software Engineer)"
              className="font-medium"
            />
            <Textarea
              className="h-80 lg:h-96 font-mono text-xs"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
            />
            <Button
              type="submit"
              disabled={loadingAnalyze || !resumeText || !jobDescription}
              className="w-full"
            >
              {loadingAnalyze ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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