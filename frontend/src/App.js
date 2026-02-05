import React, { useState, useEffect } from "react";
import "./App.css";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  Upload,
  Target,
  Brain,
  BarChart3,
  Clock,
  Loader2,
  ClipboardCopy,
  FileText,
  Printer,
  LogOut,
  User
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/toaster";
import { useToast } from "./hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "./components/ui/dialog";
import { Card, CardContent } from "./components/ui/card";
import { ScrollArea } from "./components/ui/scroll-area";

import UploadTab from "./components/ui/sections/UploadTab";
import AnalyzeTab from "./components/ui/sections/AnalyzeTab";
import ResultsTab from "./components/ui/sections/ResultsTab";
import HistoryTab from "./components/ui/sections/HistoryTab";

import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ResumeBuilder from './pages/ResumeBuilder';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000/api",
  timeout: 60000,
});

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

function formatServerDetail(payload) {
  if (!payload && payload !== 0) return "";
  if (typeof payload === "string") return payload;
  if (Array.isArray(payload)) {
    return payload
      .map((it) => {
        if (!it) return JSON.stringify(it);
        try {
          const loc = Array.isArray(it.loc) ? it.loc.join(".") : it.loc || "";
          return loc ? `${loc}: ${it.msg || JSON.stringify(it)}` : it.msg || JSON.stringify(it);
        } catch {
          return JSON.stringify(it);
        }
      })
      .join(" | ");
  }
  if (typeof payload === "object") {
    if (payload.detail) return formatServerDetail(payload.detail);
    try {
      return JSON.stringify(payload, null, 2);
    } catch {
      return String(payload);
    }
  }
  return String(payload);
}

function serverWantsFunc(detail) {
  if (!detail) return false;
  const text = typeof detail === "string" ? detail : JSON.stringify(detail);
  if (!text) return false;
  return text.includes('"func"') || text.includes("query.func") || /"loc":\s*\[.*"query".*"func".*\]/.test(text) || /func/.test(text);
}

// Ensure the Home component is defined properly for the routing
function Home() {
  const [resumeText, setResumeText] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [targetJobTitle, setTargetJobTitle] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [loadingAnalyze, setLoadingAnalyze] = useState(false);
  const { toast } = useToast();

  const [isSummaryModalOpen, setSummaryModalOpen] = useState(false);
  const [generatedSummaries, setGeneratedSummaries] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const resetApp = () => {
    setActiveTab("upload");
    setResumeText("");
    setResumeFile(null);
    setJobDescription("");
    setTargetJobTitle("");
    setAnalysis(null);
  };

  useEffect(() => {
    let cancelled = false;
    const autoUploadIfNeeded = async () => {
      if (activeTab !== "analyze") return;
      if (!resumeFile || (resumeText && resumeText.trim())) return;

      setLoadingAnalyze(true);
      const formData = new FormData();
      formData.append("file", resumeFile);

      try {
        const uploadRes = await api.post("/upload-resume", formData, { timeout: 60000 });
        const extracted = uploadRes?.data?.text || "";
        if (!extracted || !extracted.trim()) {
          if (cancelled) return;
          const detail = uploadRes?.data?.detail || "No text extracted from the uploaded file.";
          toast({ variant: "destructive", title: "Text Extraction Failed", description: formatServerDetail(detail) });
          setActiveTab("upload");
          return;
        }
        if (cancelled) return;
        setResumeText(extracted);
      } catch (err) {
        if (cancelled) return;
        console.error("Auto-upload error:", err?.response || err);
        const detail = err?.response?.data || err?.message || "Unable to extract text from resume.";
        toast({ variant: "destructive", title: "Text Extraction Failed", description: formatServerDetail(detail) });
        setActiveTab("upload");
      } finally {
        if (!cancelled) setLoadingAnalyze(false);
      }
    };

    autoUploadIfNeeded();
    return () => {
      cancelled = true;
    };
  }, [activeTab, resumeFile, resumeText, toast]);

  const handleAnalysis = async () => {
    try {
      if (!resumeFile && !resumeText?.trim()) {
        toast({ variant: "destructive", title: "Error", description: "Please upload or paste your resume first." });
        setActiveTab("upload");
        return;
      }

      if (!jobDescription?.trim()) {
        toast({ variant: "destructive", title: "Error", description: "Please enter the job description." });
        setActiveTab("analyze");
        return;
      }

      setLoadingAnalyze(true);

      let finalResumeText = resumeText;
      if (resumeFile && !finalResumeText.trim()) {
        const formData = new FormData();
        formData.append("file", resumeFile);
        try {
          const uploadRes = await api.post("/upload-resume", formData, { timeout: 60000 });
          finalResumeText = uploadRes?.data?.text || "";
          if (!finalResumeText || !finalResumeText.trim()) {
            const detail = uploadRes?.data?.detail || "No text extracted from uploaded file.";
            toast({ variant: "destructive", title: "Text Extraction Failed", description: formatServerDetail(detail) });
            setActiveTab("upload");
            return;
          }
          setResumeText(finalResumeText);
        } catch (err) {
          console.error("Upload / text extraction error:", err?.response || err);
          const detail = err?.response?.data || err?.message || "Unable to extract text from resume.";
          toast({ variant: "destructive", title: "Text Extraction Failed", description: formatServerDetail(detail) });
          setActiveTab("upload");
          return;
        }
      }

      const payload = {
        resume_text: finalResumeText,
        job_description: jobDescription,
        target_job_title: targetJobTitle,
      };

      console.log("ANALYZE: sending payload:", payload);

      let didRetryWithFunc = false;

      const doAnalyzeRequest = async (urlSuffix = "") => {
        const bodyString = JSON.stringify(payload);
        return api.post(`/analyze${urlSuffix}`, bodyString, {
          timeout: 60000,
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
      };

      try {
        const res = await doAnalyzeRequest("");
        if (res && res.data && typeof res.data === "object") {
          setAnalysis(res.data);
          setActiveTab("results");
          return;
        } else {
          toast({ variant: "destructive", title: "Analysis Failed", description: "Unexpected response from analysis endpoint." });
          return;
        }
      } catch (err) {
        const status = err?.response?.status;
        const respData = err?.response?.data;
        console.error("Analyze API error:", err?.response || err);

        if (!didRetryWithFunc && status && (status === 422 || status === 400) && serverWantsFunc(respData)) {
          didRetryWithFunc = true;
          try {
            const res2 = await doAnalyzeRequest("?func=match");
            if (res2 && res2.data && typeof res2.data === "object") {
              setAnalysis(res2.data);
              setActiveTab("results");
              return;
            } else {
              toast({ variant: "destructive", title: "Analysis Failed", description: "Unexpected response from analysis endpoint (retry)." });
              return;
            }
          } catch (err2) {
            console.error("Analyze retry error:", err2?.response || err2);
            const fd = formatServerDetail(err2?.response?.data || err2?.message);
            toast({ variant: "destructive", title: "Analysis Failed", description: fd || "Analysis failed (retry)." });
            setActiveTab("analyze");
            return;
          }
        }

        const formatted = formatServerDetail(respData || err?.message);
        toast({ variant: "destructive", title: "Analysis Failed", description: formatted || "Analysis endpoint failed." });
        setActiveTab("analyze");
        return;
      }
    } finally {
      setLoadingAnalyze(false);
    }
  };

  const handleGenerateSummary = async () => {
    const textToSummarize = resumeText || (analysis ? analysis.resume_text : "");
    if (!textToSummarize?.trim()) {
      toast({ variant: "destructive", title: "Summary Error", description: "Resume text is empty. Cannot generate summary." });
      return;
    }

    setLoadingSummary(true);
    setGeneratedSummaries([]);
    setSummaryModalOpen(true);

    try {
      const { data } = await api.post("/generate-summary", { resume_text: textToSummarize });
      setGeneratedSummaries(data.summaries || []);
    } catch (err) {
      console.error("Summary generation error", err?.response || err);
      const detail = err?.response?.data || err?.message || "Summary generation failed.";
      toast({ variant: "destructive", title: "Summary Failed", description: formatServerDetail(detail) });
      setSummaryModalOpen(false);
    } finally {
      setLoadingSummary(false);
    }
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(
        () => toast({ title: "Copied!", description: "Summary copied to clipboard." }),
        (e) => {
          console.error("Clipboard copy failed", e);
          toast({ variant: "destructive", title: "Copy Failed", description: "Could not copy text." });
        }
      );
      return;
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      toast({ title: "Copied!", description: "Summary copied to clipboard." });
    } catch (err) {
      console.error("Fallback copy failed", err);
      toast({ variant: "destructive", title: "Copy Failed", description: "Could not copy text." });
    }
    document.body.removeChild(ta);
  };

  const navButtonClasses = "w-full sm:flex-1 gap-2 transform transition-transform duration-150 active:scale-95";

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-8 bg-white/60 p-2 rounded-xl backdrop-blur-sm">
        <Button variant={activeTab === "upload" ? "default" : "ghost"} onClick={() => setActiveTab("upload")} className={navButtonClasses}>
          <Upload className="w-4 h-4" />
          Upload Resume
        </Button>
        <Button variant={activeTab === "analyze" ? "default" : "ghost"} onClick={() => setActiveTab("analyze")} className={navButtonClasses}>
          <Target className="w-4 h-4" />
          Analyze Match
        </Button>
        <Button variant={activeTab === "results" ? "default" : "ghost"} onClick={() => setActiveTab("results")} className={navButtonClasses} disabled={!analysis}>
          <BarChart3 className="w-4 h-4" />
          View Results
        </Button>
        <Button variant={activeTab === "history" ? "default" : "ghost"} onClick={() => setActiveTab("history")} className={navButtonClasses}>
          <Clock className="w-4 h-4" />
          History
        </Button>
      </div>

      {activeTab === "upload" && (
        <UploadTab resumeText={resumeText} setResumeText={setResumeText} setResumeFile={setResumeFile} setActiveTab={setActiveTab} api={api} toast={toast} />
      )}

      {activeTab === "analyze" && (
        <AnalyzeTab
          resumeText={resumeText}
          setResumeText={setResumeText}
          jobDescription={jobDescription}
          setJobDescription={setJobDescription}
          targetJobTitle={targetJobTitle}
          setTargetJobTitle={setTargetJobTitle}
          handleAnalysis={handleAnalysis}
          loadingAnalyze={loadingAnalyze}
          handleGenerateSummary={handleGenerateSummary}
          loadingSummary={loadingSummary}
        />
      )}

      {activeTab === "results" && <ResultsTab analysis={analysis} resetApp={resetApp} />}

      {activeTab === "history" && <HistoryTab isActive={activeTab === "history"} api={api} toast={toast} />}

      <Dialog open={isSummaryModalOpen} onOpenChange={setSummaryModalOpen}>
        <DialogContent className="max-w-2xl h-[70vh]">
          <DialogHeader>
            <DialogTitle>AI Generated Summaries</DialogTitle>
            <DialogDescription>Here are 3 professional summary suggestions based on your resume. Copy your favorite.</DialogDescription>
          </DialogHeader>
          <div className="h-full pb-12">
            <ScrollArea className="h-full pr-6">
              {loadingSummary ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {generatedSummaries.map((summary, idx) => (
                    <Card key={idx} className="bg-slate-50">
                      <CardContent className="p-4 flex items-start gap-4">
                        <p className="text-sm text-slate-800 flex-1">{summary}</p>
                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(summary)} className="text-slate-500 hover:text-indigo-600">
                          <ClipboardCopy className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Layout({ children }) {
  const { user, logout, loading } = useAuth();

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-300">
      <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-700 transition-colors">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                ResumeAI
              </span>
            </Link>

            <div className="flex items-center space-x-2 md:space-x-6">
              <Link to="/resume-builder" className="text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors flex items-center gap-1">
                <Printer size={16} /> <span className="hidden sm:inline">Resume Builder</span>
              </Link>
              <Link to="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors">
                Analyze
              </Link>

              {user ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-1">
                    <User size={16} /> <span className="hidden sm:inline">{user.username}</span>
                  </span>
                  <button
                    onClick={logout}
                    className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1"
                  >
                    <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 px-3 py-2">
                    Login
                  </Link>
                  <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20">
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="bg-slate-900 text-white py-8 mt-16">
        <div className="w-full max-w-none px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-indigo-400" />
            <span className="font-semibold">AI Resume Matcher</span>
          </div>
          <p className="text-slate-400">Powered by advanced AI to help you land your dream job</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <img src="https://avatars.githubusercontent.com/in/1201222?s=120&u=2686cf91179bbafbc7a71bfbc43004cf9ae1acea&v=4" alt="Author Avatar" className="w-5 h-5 rounded-full" />
            <p className="text-xs text-slate-400">Made By Aftab</p>
          </div>
        </div>
      </footer>

      <Toaster position="bottom-right" theme="system" />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ErrorBoundary>
          <div className="min-h-screen bg-slate-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/resume-builder" element={
                <Layout>
                  <ResumeBuilder />
                </Layout>
              } />
              <Route path="/" element={
                <Layout>
                  <Home />
                </Layout>
              } />
            </Routes>
          </div>
        </ErrorBoundary>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
