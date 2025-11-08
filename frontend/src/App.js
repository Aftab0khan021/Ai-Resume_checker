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
import { useToast } from "./hooks/use-toast";
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

// Import new section components from their correct new path
import UploadTab from "./components/ui/sections/UploadTab";
import AnalyzeTab from "./components/ui/sections/AnalyzeTab";
import ResultsTab from "./components/ui/sections/ResultsTab";
import HistoryTab from "./components/ui/sections/HistoryTab";

// --- FIX: Removed all BACKEND_URL logic ---

const api = axios.create({
  // --- FIX: Use relative path for Vercel proxy ---
  baseURL: "/api",
  timeout: 20000, // Increased timeout for analysis
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
  // --- FIX: Added resumeFile state ---
  const [resumeFile, setResumeFile] = useState(null);
  
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
    // --- FIX: Reset resumeFile state ---
    setResumeFile(null); 
    setJobDescription("");
    setTargetJobTitle("");
    setAnalysis(null);
  };

  /**
   * Handles the main analysis API call.
   * --- FIX: This function is rewritten to handle both file and text ---
   */
  const handleAnalysis = async (e) => {
    e?.preventDefault?.();
    
    // Check if we have neither a file nor text
    if (!resumeFile && !resumeText?.trim()) {
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: "Please upload a resume or paste its text first.",
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

    setLoadingAnalyze(true);
    
    try {
      let payload;
      let config = {};

      if (resumeFile) {
        // --- Path 1: We have a file. Send as FormData ---
        payload = new FormData();
        payload.append("file", resumeFile);
        payload.append("job_description", jobDescription);
        payload.append("target_job_title", targetJobTitle);
        config = { headers: { "Content-Type": "multipart/form-data" } };
      
      } else {
        // --- Path 2: No file. Send resume text as JSON ---
        payload = {
          resume_text: resumeText,
          job_description: jobDescription,
          target_job_title: targetJobTitle,
        };
      }

      const { data } = await api.post("/analyze", payload, config);
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
    // --- FIX: Check for file *or* text ---
    const textToSummarize = resumeText || (analysis ? analysis.resume_text : "");
    
    if (!textToSummarize?.trim()) {
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
        resume_text: textToSummarize,
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
  
  // --- Animation classes for nav buttons ---
  const navButtonClasses = "w-full sm:flex-1 gap-2 transform transition-transform duration-150 active:scale-95";

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
            className={navButtonClasses} // <-- UPDATED
          >
            <Upload className="w-4 h-4" />
            Upload Resume
          </Button>
          <Button
            variant={activeTab === "analyze" ? "default" : "ghost"}
            onClick={() => setActiveTab("analyze")}
            className={navButtonClasses} // <-- UPDATED
          >
            <Target className="w-4 h-4" />
            Analyze Match
          </Button>
          <Button
            variant={activeTab === "results" ? "default" : "ghost"}
            onClick={() => setActiveTab("results")}
            className={navButtonClasses} // <-- UPDATED
            disabled={!analysis}
          >
            <BarChart3 className="w-4 h-4" />
            View Results
          </Button>
          <Button
            variant={activeTab === "history" ? "default" : "ghost"}
            onClick={() => setActiveTab("history")}
            className={navButtonClasses} // <-- UPDATED
          >
            <Clock className="w-4 h-4" />
            History
          </Button>
        </div>

        {/* --- Refactored Tab Content --- */}
        
        {activeTab === "upload" && (
          <UploadTab 
            resumeText={resumeText} 
            setResumeText={setResumeText} 
            // --- FIX: Pass setResumeFile ---
            setResumeFile={setResumeFile} 
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