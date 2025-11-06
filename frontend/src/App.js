import React, { useState, useRef } from "react";
import "./App.css";
import axios from "axios";
import {
  Upload,
  FileText,
  Target,
  TrendingUp,
  CheckCircle,
  XCircle,
  Lightbulb,
  Brain,
  BarChart3,
  Download,
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Textarea } from "./components/ui/textarea";
import { Progress } from "./components/ui/progress";
import { Badge } from "./components/ui/badge";
import { Toaster } from "./components/ui/toaster"; // <-- NEW: Import Toaster
import { toast, useToast } from "./hooks/use-toast"; // <-- NEW: Import toast hook
import { Input } from "./components/ui/input"; // <-- ADDED: Assuming this is the path to your Input component

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; // e.g. https://ai-resume-checker-f4xs.onrender.com
const BACKEND_ROOT = BACKEND_URL 
  .replace(/\/+$/g, "")       // remove trailing slashes
  .replace(/\/api$/i, "");    // remove trailing /api if someone set it by mistake

if (!BACKEND_ROOT) {
  console.error("REACT_APP_BACKEND_URL is missing. Set it to your backend root (no /api).");
}

// Single axios client for all calls
const api = axios.create({
  baseURL: `${BACKEND_ROOT}/api`,
  timeout: 20000,
});
console.log("API base:", api.defaults.baseURL);
// Auto-retry once if Render free dyno is waking (503)
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    if (error?.response?.status === 503 && !error.config.__retried) {
      error.config.__retried = true;
      await new Promise((res) => setTimeout(res, 1500));
      return api.request(error.config);
    }
    throw error;
  }
);

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [targetJobTitle, setTargetJobTitle] = useState(""); // <-- NEW: State for Job Title
  const [analysis, setAnalysis] = useState(null);
  const [loadingAnalyze, setLoadingAnalyze] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const fileInputRef = useRef(null);
  const { toast } = useToast(); // <-- NEW: Initialize toast

  // --- File selection (does NOT upload) ---
  const onFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer.files;
    if (files?.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  // --- Explicit upload action (button) ---
  const handleFileUpload = async (e) => {
    e?.preventDefault?.(); // in case this is inside a <form>
    if (!selectedFile) {
      // Replaced alert() with toast()
      toast({
        variant: "destructive",
        title: "Upload Error",
        description: "Please select a PDF/DOC/DOCX file first.",
      });
      return;
    }
    try {
      setLoadingUpload(true);
      const form = new FormData();
      // field name MUST be "file" (FastAPI expects this)
      form.append("file", selectedFile);

      // ✅ FIX: DO NOT set Content-Type manually (Axios will set boundary)
      const { data } = await api.post("/upload-resume", form, {
        maxBodyLength: 25 * 1024 * 1024,
      });

      // Put extracted text into box and move to Analyze
      setResumeText(data?.text || "");
      setActiveTab("analyze");
    } catch (err) {
      console.error("Upload error", err?.response || err);
      // Replaced alert() with toast()
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: err?.response?.data?.detail || err.message,
      });
    } finally {
      setLoadingUpload(false);
    }
  };

  // --- Analyze action ---
  const handleAnalysis = async (e) => {
    e?.preventDefault?.();
    if (!resumeText?.trim()) {
      // Replaced alert() with toast()
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: "Resume text is empty. Upload a file or paste text.",
      });
      return;
    }
    if (!jobDescription?.trim()) {
      // Replaced alert() with toast()
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: "Please paste a job description.",
      });
      return;
    }

    try {
      setLoadingAnalyze(true);
      const { data } = await api.post("/analyze", {
        resume_text: resumeText,
        job_description: jobDescription,
        target_job_title: targetJobTitle, // <-- NEW: Pass job title
      });
      setAnalysis(data);
      setActiveTab("results");
    } catch (err) {
      console.error("Analyze error", err?.response || err);
      // Replaced alert() with toast()
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: err?.response?.data?.detail || err.message,
      });
    } finally {
      setLoadingAnalyze(false);
    }
  };

  const getMatchColor = (percentage) => {
    if (percentage >= 80) return "bg-emerald-500";
    if (percentage >= 60) return "bg-amber-500";
    return "bg-rose-500";
  };

  const getMatchLabel = (percentage) => {
    if (percentage >= 80) return "Excellent Match";
    if (percentage >= 60) return "Good Match";
    return "Needs Improvement";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="w-full max-w-none px-4 sm:px-6 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-slate-900">AI Resume Matcher</h1>
              <p className="text-sm text-slate-600">Smart Resume & Job Description Analysis</p>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full max-w-none px-4 sm:px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white/60 p-2 rounded-xl backdrop-blur-sm">
          <Button
            variant={activeTab === "upload" ? "default" : "ghost"}
            onClick={() => setActiveTab("upload")}
            className="w-full sm:flex-1 gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload Resume
          </Button>
          <Button
            variant={activeTab === "analyze" ? "default" : "ghost"}
            onClick={() => setActiveTab("analyze")}
            className="w-full sm:flex-1 gap-2"
          >
            <Target className="w-4 h-4" />
            Analyze Match
          </Button>
          <Button
            variant={activeTab === "results" ? "default" : "ghost"}
            onClick={() => setActiveTab("results")}
            className="w-full sm:flex-1 gap-2"
            disabled={!analysis}
          >
            <BarChart3 className="w-4 h-4" />
            View Results
          </Button>
        </div>

        {/* Upload Tab */}
        {activeTab === "upload" && (
          <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl flex items-center gap-3 justify-center">
                  <FileText className="w-8 h-8 text-indigo-600" />
                  Upload Your Resume
                </CardTitle>
                <CardDescription className="text-lg">
                  Upload your resume in PDF or DOCX format to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div
                  className="border-2 border-dashed border-indigo-300 rounded-xl p-6 sm:p-8 text-center hover:border-indigo-400 transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-indigo-100 rounded-full">
                      <Upload className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-slate-900">Choose your resume file</p>
                      <p className="text-slate-600">PDF or DOCX files supported</p>
                      <p className="text-sm text-slate-500 mt-1">Or drag and drop a file here</p>
                    </div>
                    {/* Hidden input + visible buttons */}
                    <input
                      ref={fileInputRef}
                      id="resume-upload"
                      type="file"
                      accept=".pdf,.docx,.doc"
                      onChange={onFileChange}
                      className="hidden"
                    />
                    <div className="flex flex-wrap items-stretch gap-3">
                        <Button type="button"size="lg"variant="outline"className="cursor-pointer w-full sm:w-auto"onClick={() => fileInputRef.current?.click()}>
                          Select File
                        </Button>
                      

                      <Button
                      type="button"
                      size="lg"
                      onClick={handleFileUpload}
                      disabled={!selectedFile || loadingUpload}
                      className="cursor-pointer w-full sm:w-auto"
                      >
                        {loadingUpload ? (
                          <>
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                            Upload & Extract...
                          </>
                        ) : (
                          "Upload & Extract"
                        )}
                      </Button>
                    </div>

                    {selectedFile && (
                      <div className="text-sm text-slate-700 mt-1">
                        Selected: <span className="font-medium">{selectedFile.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                {resumeText && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-900">Extracted Text Preview:</h4>
                    <div className="bg-slate-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">
                        {resumeText.substring(0, 500)}...
                      </p>
                    </div>
                    <Button onClick={() => setActiveTab("analyze")} className="w-full gap-2" size="lg">
                      Continue to Analysis
                      <Target className="w-4 h-4" />
                    </Button>
                  </div>
                )}

                {/* Manual Text Input Option */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-slate-300" />
                    <span className="text-sm text-slate-500 px-3">OR</span>
                    <div className="flex-1 h-px bg-slate-300" />
                  </div>

                  <Card className="border border-slate-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        Paste Resume Text Directly
                      </CardTitle>
                      <CardDescription>Copy and paste your resume content here if you don't have a file</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="Paste your resume text here..."
                        className="min-h-40 sm:min-h-52 md:min-h-64 resize-y"
                      />
                      {resumeText && (
                        <Button onClick={() => setActiveTab("analyze")} className="w-full gap-2 mt-3" size="lg">
                          Continue to Analysis
                          <Target className="w-4 h-4" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === "analyze" && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Resume Content
                </CardTitle>
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

            <div className="lg:col-span-2 space-y-4"> {/* <-- ADDED space-y-4 */}
              {/* NEW: Input for Target Job Title */}
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
        )}

        {/* Results Tab */}
        {activeTab === "results" && analysis && (
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

            {/* NEW: ATS Compatibility Score Card */}
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

            {/* NEW: Quantification Feedback Card */}
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

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                onClick={() => {
                  setActiveTab("upload");
                  setSelectedFile(null);
                  setResumeText("");
                  setJobDescription("");
                  setTargetJobTitle(""); // <-- ADDED
                  setAnalysis(null);
                }}
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
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 mt-16">
        <div className="w-full max-w-none px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-indigo-400" />
            <span className="font-semibold">AI Resume Matcher</span>
          </div>
          <p className="text-slate-400">Powered by advanced AI to help you land your dream job</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <img
              src="https://avatars.githubusercontent.com/in/1201222?s=120&u=2686cf91179bbafbc7a71bfbc43004cf9ae1acea&v=4"
              alt="Author Avatar"
              className="w-5 h-5 rounded-full"
            />
            <p className="text-xs text-slate-400">Made By Aftab</p>
          </div>

        </div>
      </footer>
      <Toaster /> {/* <-- RENDER TOASTER HERE */}
    </div>
  );
}

export default App;