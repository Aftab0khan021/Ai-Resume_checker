import React, { useState, useRef, useEffect } from "react";
import { Upload, FileText, Target } from "lucide-react";
// --- FIXED IMPORTS ---
import { Button } from "../button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card";
import { Textarea } from "../textarea";
// ---------------------

/**
 * Component for the "Upload Resume" tab.
 * Manages file selection, drag-and-drop, and uploading.
 */
const UploadTab = ({ resumeText, setResumeText, setActiveTab, api, toast }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [internalResumeText, setInternalResumeText] = useState(resumeText);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setInternalResumeText(resumeText);
  }, [resumeText]);

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
      setResumeText(data?.text || ""); 
      setActiveTab("analyze"); 
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
  
  const handleContinueFromPaste = () => {
    setResumeText(internalResumeText); // Sync parent state
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