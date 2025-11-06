import React from 'react';
import {
  TrendingUp,
  CheckCircle,
  XCircle,
  Lightbulb,
  Brain,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";

// Helper function to get badge color based on score
const getMatchColor = (percentage) => {
  if (percentage >= 80) return "bg-emerald-500";
  if (percentage >= 60) return "bg-amber-500";
  return "bg-rose-500";
};

// Helper function to get badge label based on score
const getMatchLabel = (percentage) => {
  if (percentage >= 80) return "Excellent Match";
  if (percentage >= 60) return "Good Match";
  return "Needs Improvement";
};

/**
 * A reusable component to render the full analysis detail.
 * Used by both the ResultsTab and the History Detail Modal.
 * @param {object} props - Component props.
 * @param {object} props.analysis - The analysis data object.
 */
const AnalysisDetailContent = ({ analysis }) => {
  if (!analysis) return null;

  return (
    <div className="space-y-6">
      {/* Match Score Card */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white via-white to-indigo-50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <TrendingUp className="w-8 h-8 text-indigo-600" />
              <h2 className="text-3xl font-bold text-slate-900">Match Score</h2>
            </div>
            <div className="space-y-3">
              <div className="text-6xl font-bold text-indigo-600">
                {Math.round(analysis.match_percentage)}%
              </div>
              <Badge className={`${getMatchColor(analysis.match_percentage)} text-white px-4 py-2 text-lg`}>
                {getMatchLabel(analysis.match_percentage)}
              </Badge>
              <Progress value={analysis.match_percentage} className="w-full h-4 bg-slate-200" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ATS Compatibility Score Card */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            ATS Compatibility Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-indigo-600">
              {Math.round(analysis.ats_compatibility_score)}%
            </div>
            <Progress value={analysis.ats_compatibility_score} className="w-full h-3 bg-slate-200" />
            <p className="text-sm text-slate-600">
              This score estimates how well an Applicant Tracking System (ATS) can parse your resume.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Summary */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-600" />
            AI Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700 leading-relaxed text-lg">{analysis.analysis_summary}</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Matched Skills */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700">
              <CheckCircle className="w-5 h-5" />
              Matched Skills ({analysis.matched_skills.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.matched_skills.map((skill, index) => (
                <Badge key={index} className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Missing Skills */}
        <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-rose-700">
              <XCircle className="w-5 h-5" />
              Missing Skills ({analysis.missing_skills.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.missing_skills.map((skill, index) => (
                <Badge key={index} className="bg-rose-100 text-rose-800 hover:bg-rose-200">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            General Improvement Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.recommendations.map((recommendation, index) => (
              <div key={index} className="flex gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                </div>
                <p className="text-slate-700">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quantification Feedback Card */}
      {analysis.quantification_feedback?.length > 0 && (
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700">
                      <XCircle className="w-5 h-5" />
                      Quantifiable Achievement Feedback
                  </CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="space-y-3">
                      {analysis.quantification_feedback.map((feedback, index) => (
                          <div key={index} className="flex gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                              <p className="text-slate-700">{feedback}</p>
                          </div>
                      ))}
                  </div>
              </CardContent>
          </Card>
      )}
      
      {/* STEP 2: View Original Text Accordion */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger>View Original Resume Text</AccordionTrigger>
          <AccordionContent>
            <ScrollArea className="h-64 w-full rounded-md border p-4">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                {analysis.resume_text}
              </pre>
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>View Original Job Description</AccordionTrigger>
          <AccordionContent>
            <ScrollArea className="h-64 w-full rounded-md border p-4">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                {analysis.job_description}
              </pre>
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default AnalysisDetailContent;