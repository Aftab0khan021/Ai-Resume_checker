import React, { useState } from "react";
import "./App.css";
import axios from "axios";
import {
  Upload,
  Target,
  Brain,
  BarChart3,
  Clock,
  Loader2,
  ClipboardCopy,
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/toaster";
import { toast, useToast } from "./hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "./components/ui/dialog";
import { Card, CardContent } from "./components/ui/card";
import { ScrollArea } from "./components/ui/scroll-area";

// Import new modular components (now located directly inside ui/)
import UploadTab from "./components/ui/UploadTab";
import AnalyzeTab from "./components/ui/AnalyzeTab";
import ResultsTab from "./components/ui/ResultsTab";
import HistoryTab from "./components/ui/HistoryTab";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const BACKEND_ROOT = BACKEND_URL 
  .replace(/\/+$/g, "")
  .replace(/\/api$/i, "");

if (!BACKEND_ROOT) {
  console.error("REACT_APP_BACKEND_URL is missing. Set it to your backend root (no /api).");
}

const api = axios.create({
  baseURL: `${BACKEND_ROOT}/api`,
  timeout: 20000,
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

function App() {
  // Core App State
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [targetJobTitle, setTargetJobTitle] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [loadingAnalyze, setLoadingAnalyze] = useState(false);
  const { toast } = useToast();

  // AI Summary State
  const [isSummaryModalOpen, setSummaryModalOpen] = useState(false);
  const [generatedSummaries, setGeneratedSummaries] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // --- Core Logic ---
  
  /**
   * Resets the app to the initial upload state.
   */
  const resetApp = () => {
    setActiveTab("upload");
    setResumeText("");
    setJobDescription("");
    setTargetJobTitle("");
    setAnalysis(null);
  };

  /**
   * Handles the main analysis API call.
   */
  const handleAnalysis = async (e) => {
    e?.preventDefault?.();
    if (!resumeText?.trim()) {
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: "Resume text is empty. Upload a file or paste text.",
      });
      return;
    }
    if (!jobDescription?.trim()) {
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
        target_job_title: targetJobTitle,
      });
      setAnalysis(data);
      setActiveTab("results");
    } catch (err) {
      console.error("Analyze error", err?.response || err);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: err?.response?.data?.detail || err.message,
      });
    } finally {
      setLoadingAnalyze(false);
    }
  };

  /**
   * Handles the AI Summary Generation API call.
   */
  const handleGenerateSummary = async () => {
    if (!resumeText?.trim()) {
      toast({
        variant: "destructive",
        title: "Summary Error",
        description: "Resume text is empty. Cannot generate summary.",
      });
      return;
    }
    
    setLoadingSummary(true);
    setGeneratedSummaries([]);
    setSummaryModalOpen(true);
    
    try {
      const { data } = await api.post("/generate-summary", {
        resume_text: resumeText,
      });
      setGeneratedSummaries(data.summaries || []);
    } catch (err) {
      console.error("Summary generation error", err?.response || err);
      toast({
        variant: "destructive",
        title: "Summary Failed",
        description: err?.response?.data?.detail || err.message,
      });
      setSummaryModalOpen(false); // Close modal on error
    } finally {
      setLoadingSummary(false);
    }
  };

  /**
   * Copies text to the clipboard (fallback for iframes).
   */
  const copyToClipboard = (text) => {
    // Attempt modern copy first
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => {
          toast({ title: "Copied!", description: "Summary copied to clipboard." });
        })
        .catch(err => {
          console.error("Clipboard copy failed", err);
          toast({ variant: "destructive", title: "Copy Failed", description: "Could not copy text." });
        });
    } else {
      // Fallback for older browsers or non-secure contexts (like iFrames/Canvas)
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
    }
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
          <Button
            variant={activeTab === "history" ? "default" : "ghost"}
            onClick={() => setActiveTab("history")}
            className="w-full sm:flex-1 gap-2"
          >
            <Clock className="w-4 h-4" />
            History
          </Button>
        </div>

        {/* --- Refactored Tab Content --- */}
        
        {activeTab === "upload" && (
          <UploadTab 
            setResumeText={setResumeText} 
            setActiveTab={setActiveTab} 
            api={api} 
            toast={toast} 
          />
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

        {activeTab === "results" && (
          <ResultsTab 
            analysis={analysis}
            resetApp={resetApp} 
          />
        )}
        
        {activeTab === "history" && (
          <HistoryTab 
            isActive={activeTab === "history"}
            api={api}
            toast={toast}
          />
        )}

      </main>

      {/* --- AI Summary Modal --- */}
      <Dialog open={isSummaryModalOpen} onOpenChange={setSummaryModalOpen}>
        <DialogContent className="max-w-2xl h-[70vh]">
          <DialogHeader>
            <DialogTitle>AI Generated Summaries</DialogTitle>
            <DialogDescription>
              Here are 3 professional summary suggestions based on your resume. Copy your favorite.
            </DialogDescription>
          </DialogHeader>
          <div className="h-full pb-12">
            <ScrollArea className="h-full pr-6">
              {loadingSummary ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  {generatedSummaries.map((summary, index) => (
                    <Card key={index} className="bg-slate-50">
                      <CardContent className="p-4 flex items-start gap-4">
                        <p className="text-sm text-slate-800 flex-1">{summary}</p>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => copyToClipboard(summary)}
                          className="text-slate-500 hover:text-indigo-600"
                        >
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
      <Toaster />
    </div>
  );
}

export default App;
```

---

## 2. New File: `frontend/src/components/ui/UploadTab.jsx`
```javascript
import React, { useState, useRef } from "react";
import { Upload, FileText, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

/**
 * Component for the "Upload Resume" tab.
 * Manages file selection, drag-and-drop, and uploading.
 */
const UploadTab = ({ setResumeText, setActiveTab, api, toast }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [internalResumeText, setInternalResumeText] = useState("");
  const fileInputRef = useRef(null);

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

  const handleFileUpload = async (e) => {
    e?.preventDefault?.();
    if (!selectedFile) {
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
      form.append("file", selectedFile);
      const { data } = await api.post("/upload-resume", form, {
        maxBodyLength: 25 * 1024 * 1024,
      });
      setResumeText(data?.text || ""); // Update parent state
      setInternalResumeText(data?.text || ""); // Update internal state for preview
    } catch (err) {
      console.error("Upload error", err?.response || err);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: err?.response?.data?.detail || err.message,
      });
    } finally {
      setLoadingUpload(false);
    }
  };
  
  // Handles moving to the analyze tab from the "Paste" section
  const handleContinueFromPaste = () => {
    setResumeText(internalResumeText);
    setActiveTab("analyze");
  };

  return (
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
              <input
                ref={fileInputRef}
                id="resume-upload"
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={onFileChange}
                className="hidden"
              />
              <div className="flex flex-wrap items-stretch gap-3">
                <Button type="button" size="lg" variant="outline" className="cursor-pointer w-full sm:w-auto" onClick={() => fileInputRef.current?.click()}>
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

          {internalResumeText && (
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-900">Extracted Text Preview:</h4>
              <div className="bg-slate-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">
                  {internalResumeText.substring(0, 500)}...
                </p>
              </div>
              <Button onClick={() => setActiveTab("analyze")} className="w-full gap-2" size="lg">
                Continue to Analysis
                <Target className="w-4 h-4" />
              </Button>
            </div>
          )}

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
                  value={internalResumeText}
                  onChange={(e) => setInternalResumeText(e.target.value)}
                  placeholder="Paste your resume text here..."
                  className="min-h-40 sm:min-h-52 md:min-h-64 resize-y"
                />
                {internalResumeText && (
                  <Button onClick={handleContinueFromPaste} className="w-full gap-2 mt-3" size="lg">
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
  );
};

export default UploadTab;
```

#### 3. `frontend/src/components/ui/AnalyzeTab.jsx`
```javascript
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
```

#### 4. `frontend/src/components/ui/ResultsTab.jsx`
```javascript
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
```

#### 5. `frontend/src/components/ui/HistoryTab.jsx`
```javascript
import React, { useState, useEffect } from 'react';
import { Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import AnalysisDetailModal from './AnalysisDetailModal';

// Helper function to get badge color based on score
const getMatchColor = (percentage) => {
    if (percentage >= 80) return "bg-emerald-500";
    if (percentage >= 60) return "bg-amber-500";
    return "bg-rose-500";
  };
  
/**
 * Component for the "History" tab.
 * Manages fetching history, displaying it in a table, and handling the detail modal.
 */
const HistoryTab = ({ isActive, api, toast }) => {
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Modal State
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  
  // Fetch history when the tab becomes active
  useEffect(() => {
    if (isActive) {
      fetchHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]); // Dependency on isActive

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data } = await api.get("/analysis-history");
      setHistory(data);
    } catch (err) {
      console.error("History fetch error", err?.response || err);
      toast({
        variant: "destructive",
        title: "History Failed",
        description: "Could not fetch analysis history: " + (err?.response?.data?.detail || err.message),
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleHistoryClick = async (analysisId) => {
    setLoadingModal(true);
    setIsModalOpen(true);
    setSelectedHistoryItem(null);
    
    try {
      const { data } = await api.get(`/analysis/${analysisId}`);
      setSelectedHistoryItem(data);
    } catch (err) {
      console.error("Fetch analysis detail error", err?.response || err);
      toast({
        variant: "destructive",
        title: "Load Failed",
        description: "Could not load analysis details: " + (err?.response?.data?.detail || err.message),
      });
      setIsModalOpen(false);
    } finally {
      setLoadingModal(false);
    }
  };

  return (
    <>
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Clock className="w-6 h-6 text-indigo-600" />
            Analysis History (Last 10)
          </CardTitle>
          <CardDescription>
            Click a row to see the full analysis details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-1/2" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No analysis history found. Start by analyzing a match!</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Date</TableHead>
                    <TableHead className="w-[150px]">Target Role</TableHead>
                    <TableHead>Summary</TableHead>
                    <TableHead className="text-right">Match %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => (
                    <TableRow 
                        key={item.id} 
                        onClick={() => handleHistoryClick(item.id)}
                        className="cursor-pointer hover:bg-slate-100/50 transition-colors"
                    >
                      <TableCell className="font-medium text-xs">
                          {new Date(item.created_at).toLocaleDateString('en-US')}
                      </TableCell>
                      <TableCell className="font-medium">
                          {item.target_job_title || "General Role"}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                          {item.analysis_summary.substring(0, 70)}...
                      </TableCell>
                      <TableCell className="text-right">
                          <Badge className={getMatchColor(item.match_percentage)}>
                              {Math.round(item.match_percentage)}%
                          </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AnalysisDetailModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        isLoading={loadingModal}
        itemData={selectedHistoryItem}
      />
    </>
  );
};

export default HistoryTab;
```

#### 6. `frontend/src/components/ui/AnalysisDetailModal.jsx`
```javascript
import React from 'react';
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import AnalysisDetailContent from './AnalysisDetailContent';

/**
 * Modal to display the full details of a past analysis.
 */
const AnalysisDetailModal = ({ isOpen, setIsOpen, isLoading, itemData }) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl h-[90vh]">
        <DialogHeader>
          <DialogTitle>Analysis Detail</DialogTitle>
          <DialogDescription>
            Full analysis result for {itemData?.target_job_title || "General Role"} from {itemData?.created_at ? new Date(itemData.created_at).toLocaleString('en-US') : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="h-full pb-12">
          <ScrollArea className="h-full pr-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
              </div>
            ) : (
              <AnalysisDetailContent analysis={itemData} />
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
  );
};

export default AnalysisDetailModal;