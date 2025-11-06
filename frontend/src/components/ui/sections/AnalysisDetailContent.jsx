import React from "react";
import { CheckCircle, XCircle, Info, Target, Star, FileText } from "lucide-react";
// --- FIXED IMPORTS ---
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Progress } from "../progress";
import { Badge } from "../badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../accordion";
import { ScrollArea } from "../scroll-area";
// ---------------------

const AnalysisDetailContent = ({ analysis }) => {
  if (!analysis) return null;

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
            <div className={`text-6xl font-bold ${getMatchColor(analysis.match_percentage)} mb-2`}>
              {analysis.match_percentage.toFixed(0)}%
            </div>
            <Progress value={analysis.match_percentage} className="w-full" indicatorClassName={getProgressColor(analysis.match_percentage)} />
            <p className="text-slate-600 mt-4">{analysis.analysis_summary}</p>
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
              <div className={`text-5xl font-bold ${getMatchColor(analysis.ats_compatibility_score)}`}>
                {analysis.ats_compatibility_score.toFixed(0)}
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
              <ul className="list-disc list-inside space-y-2 text-slate-700">
                {analysis.quantification_feedback.map((fb, i) => (
                  <li key={i}>{fb}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-800">AI Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-slate-700">
              {analysis.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
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
            {analysis.matched_skills.length > 0 ? (
              analysis.matched_skills.map((skill, i) => (
                <Badge key={i} variant="success">{skill}</Badge>
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
            {analysis.missing_skills.length > 0 ? (
              analysis.missing_skills.map((skill, i) => (
                <Badge key={i} variant="destructive">{skill}</Badge>
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
                  {analysis.resume_text}
                </pre>
              </ScrollArea>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="jd">
            <AccordionTrigger>View Job Description Text</AccordionTrigger>
            <AccordionContent>
              <ScrollArea className="h-64 p-4 border rounded-md bg-slate-50">
                <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono">
                  {analysis.job_description}
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