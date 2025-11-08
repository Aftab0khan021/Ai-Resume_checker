// AnalysisDetailContent.jsx
import React from "react";
import { Target, Star } from "lucide-react";
// UI components (adjust import paths if your project structure differs)
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Progress } from "../progress";
import { Badge } from "../badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../accordion";
import { ScrollArea } from "../scroll-area";

/**
 * Defensive AnalysisDetailContent
 * - Guards against missing/invalid fields coming from the server.
 * - Uses safe defaults for numbers and arrays.
 * - Avoids calling methods on undefined values (toFixed, map, etc.)
 */

const AnalysisDetailContent = ({ analysis }) => {
  if (!analysis || typeof analysis !== "object") {
    return (
      <div className="p-6 bg-white rounded shadow-sm text-center">
        <p className="text-slate-600">No analysis data available.</p>
      </div>
    );
  }

  // Safe helpers: ensure we always have numbers and arrays
  const safeNumber = (val, fallback = 0) => {
    const n = Number(val);
    return Number.isFinite(n) ? n : fallback;
  };

  const safeArray = (val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string" && val.trim()) return [val];
    return [];
  };

  const matchPercentage = safeNumber(analysis.match_percentage, 0);
  const atsScore = safeNumber(analysis.ats_compatibility_score, 0);
  const analysisSummary = (analysis.analysis_summary || "").toString();
  const quantificationFeedback = safeArray(analysis.quantification_feedback);
  const matchedSkills = safeArray(analysis.matched_skills);
  const missingSkills = safeArray(analysis.missing_skills);
  const resumeText = analysis.resume_text || "";
  const jobDescription = analysis.job_description || "";

  const getMatchColor = (score) => {
    if (score > 75) return "text-green-600";
    if (score > 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (score) => {
    if (score > 75) return "bg-green-600";
    if (score > 50) return "bg-yellow-500";
    return "bg-red-600";
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Left Column (Main Scores) */}
      <div className="xl:col-span-2 space-y-6">
        {/* Match Score */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Overall Match Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-6xl font-bold ${getMatchColor(matchPercentage)} mb-2`}>
              {matchPercentage.toFixed(0)}%
            </div>

            {/* Progress component expects numeric value 0-100 */}
            <Progress
              value={matchPercentage}
              className="w-full"
              indicatorClassName={getProgressColor(matchPercentage)}
            />

            <p className="text-slate-600 mt-4">
              {analysisSummary || "No summary provided by the analysis."}
            </p>
          </CardContent>
        </Card>

        {/* ATS & Quantification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex-row items-center gap-2 space-y-0">
              <Target className="w-5 h-5 text-indigo-600" />
              <CardTitle className="text-lg font-semibold text-slate-800">ATS Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-5xl font-bold ${getMatchColor(atsScore)}`}>
                {atsScore.toFixed(0)}
              </div>
              <p className="text-slate-600 mt-2">
                A score above 80 is ideal for passing automated screening.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center gap-2 space-y-0">
              <Star className="w-5 h-5 text-yellow-500" />
              <CardTitle className="text-lg font-semibold text-slate-800">Quantification</CardTitle>
            </CardHeader>
            <CardContent>
              {quantificationFeedback.length > 0 ? (
                <ul className="list-disc list-inside space-y-2 text-slate-700">
                  {quantificationFeedback.map((fb, i) => (
                    <li key={i}>{(fb || "").toString()}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">No quantification feedback provided.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">AI Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            {Array.isArray(analysis.recommendations) && analysis.recommendations.length > 0 ? (
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                {analysis.recommendations.map((rec, i) => (
                  <li key={i}>{(rec || "").toString()}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No recommendations provided.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column (Skills & Details) */}
      <div className="space-y-6">
        {/* Matched Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Matched Skills</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {matchedSkills.length > 0 ? (
              matchedSkills.map((skill, i) => (
                <Badge key={i} variant="success">{(skill || "").toString()}</Badge>
              ))
            ) : (
              <p className="text-sm text-slate-500">No strong skill matches found.</p>
            )}
          </CardContent>
        </Card>

        {/* Missing Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">Missing Keywords</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {missingSkills.length > 0 ? (
              missingSkills.map((skill, i) => (
                <Badge key={i} variant="destructive">{(skill || "").toString()}</Badge>
              ))
            ) : (
              <p className="text-sm text-slate-500">No critical missing keywords found.</p>
            )}
          </CardContent>
        </Card>

        {/* Original Text Accordion */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="resume">
            <AccordionTrigger>View Resume Text</AccordionTrigger>
            <AccordionContent>
              <ScrollArea className="h-64 p-4 border rounded-md bg-slate-50">
                <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono">
                  {resumeText || "No resume text available."}
                </pre>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="jd">
            <AccordionTrigger>View Job Description Text</AccordionTrigger>
            <AccordionContent>
              <ScrollArea className="h-64 p-4 border rounded-md bg-slate-50">
                <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono">
                  {jobDescription || "No job description provided."}
                </pre>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default AnalysisDetailContent;