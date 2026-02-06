// src/components/ui/sections/ATSBreakdownDashboard.jsx
import React from "react";
import { Target, CheckCircle2, AlertTriangle, TrendingUp, FileText, Mail, Eye, Award, Zap, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../card";
import { Progress } from "../progress";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

const ATSBreakdownDashboard = ({ analysis }) => {
  if (!analysis || typeof analysis !== "object") {
    return null;
  }

  const safeNumber = (val, fallback = 0) => {
    const n = Number(val);
    return Number.isFinite(n) ? n : fallback;
  };

  const safeArray = (val) => {
    if (Array.isArray(val)) return val;
    return [];
  };

  const atsBreakdown = analysis.ats_breakdown || {};
  const redFlags = safeArray(analysis.ats_red_flags);
  const greenFlags = safeArray(analysis.ats_green_flags);
  const overallScore = safeNumber(analysis.ats_compatibility_score, 0);

  // Category data for radar chart
  const radarData = [
    { category: "Formatting", score: safeNumber(atsBreakdown.formatting_score, overallScore), fullMark: 100 },
    { category: "Keywords", score: safeNumber(atsBreakdown.keyword_density, overallScore), fullMark: 100 },
    { category: "Contact", score: safeNumber(atsBreakdown.contact_info_score, overallScore), fullMark: 100 },
    { category: "Readability", score: safeNumber(atsBreakdown.readability_score, overallScore), fullMark: 100 },
    { category: "Sections", score: safeNumber(atsBreakdown.section_completeness, overallScore), fullMark: 100 },
    { category: "Metrics", score: safeNumber(atsBreakdown.quantification_score, overallScore), fullMark: 100 },
    { category: "Length", score: safeNumber(atsBreakdown.length_score, overallScore), fullMark: 100 },
    { category: "Language", score: safeNumber(atsBreakdown.professional_language, overallScore), fullMark: 100 }
  ];

  // Category details with icons and descriptions
  const categories = [
    {
      name: "Formatting",
      score: safeNumber(atsBreakdown.formatting_score, overallScore),
      icon: FileText,
      description: "Clear sections and structure",
      color: "text-blue-600"
    },
    {
      name: "Keywords",
      score: safeNumber(atsBreakdown.keyword_density, overallScore),
      icon: Target,
      description: "Job-relevant keywords",
      color: "text-purple-600"
    },
    {
      name: "Contact Info",
      score: safeNumber(atsBreakdown.contact_info_score, overallScore),
      icon: Mail,
      description: "Email, phone, LinkedIn",
      color: "text-green-600"
    },
    {
      name: "Readability",
      score: safeNumber(atsBreakdown.readability_score, overallScore),
      icon: Eye,
      description: "Bullet points and clarity",
      color: "text-indigo-600"
    },
    {
      name: "Sections",
      score: safeNumber(atsBreakdown.section_completeness, overallScore),
      icon: TrendingUp,
      description: "Required sections present",
      color: "text-cyan-600"
    },
    {
      name: "Quantification",
      score: safeNumber(atsBreakdown.quantification_score, overallScore),
      icon: Award,
      description: "Numbers and metrics",
      color: "text-yellow-600"
    },
    {
      name: "Length",
      score: safeNumber(atsBreakdown.length_score, overallScore),
      icon: Zap,
      description: "Optimal resume length",
      color: "text-orange-600"
    },
    {
      name: "Language",
      score: safeNumber(atsBreakdown.professional_language, overallScore),
      icon: MessageSquare,
      description: "Professional terminology",
      color: "text-pink-600"
    }
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = (score) => {
    if (score >= 80) return "bg-green-600";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-600";
  };

  const getScoreStatus = (score) => {
    if (score >= 80) return { icon: CheckCircle2, text: "Excellent", color: "text-green-600" };
    if (score >= 60) return { icon: AlertTriangle, text: "Good", color: "text-yellow-600" };
    return { icon: AlertTriangle, text: "Needs Work", color: "text-red-600" };
  };

  return (
    <div className="space-y-6">
      {/* Overall ATS Score */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-600" />
            ATS Compatibility Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score Display */}
            <div className="flex flex-col items-center justify-center">
              <div className={`text-7xl font-bold ${getScoreColor(overallScore)} mb-2`}>
                {overallScore.toFixed(0)}
              </div>
              <div className="text-lg text-slate-600 mb-4">Overall ATS Score</div>
              <Progress value={overallScore} className="w-full max-w-xs" indicatorClassName={getProgressColor(overallScore)} />
              <p className="text-sm text-slate-500 mt-4 text-center max-w-md">
                {overallScore >= 80
                  ? "Excellent! Your resume is highly ATS-friendly."
                  : overallScore >= 60
                    ? "Good foundation. Some improvements will boost your score."
                    : "Needs attention. Follow recommendations to improve ATS compatibility."}
              </p>
            </div>

            {/* Radar Chart */}
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Radar name="ATS Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat, idx) => {
          const status = getScoreStatus(cat.score);
          const Icon = cat.icon;
          const StatusIcon = status.icon;

          return (
            <Card key={idx} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <Icon className={`w-5 h-5 ${cat.color}`} />
                  <StatusIcon className={`w-4 h-4 ${status.color}`} />
                </div>
                <div className={`text-3xl font-bold ${getScoreColor(cat.score)} mb-1`}>
                  {cat.score.toFixed(0)}
                </div>
                <div className="text-sm font-semibold text-slate-700 mb-1">{cat.name}</div>
                <div className="text-xs text-slate-500 mb-3">{cat.description}</div>
                <Progress value={cat.score} className="h-2" indicatorClassName={getProgressColor(cat.score)} />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Red Flags and Green Flags */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Red Flags */}
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-red-700 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              ATS Red Flags ({redFlags.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {redFlags.length > 0 ? (
              <ul className="space-y-2">
                {redFlags.map((flag, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-red-800">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-green-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                No critical ATS issues detected!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Green Flags */}
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-green-700 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              ATS Strengths ({greenFlags.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {greenFlags.length > 0 ? (
              <ul className="space-y-2">
                {greenFlags.map((flag, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-green-800">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-600">
                Follow the recommendations to improve your ATS score.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ATSBreakdownDashboard;
