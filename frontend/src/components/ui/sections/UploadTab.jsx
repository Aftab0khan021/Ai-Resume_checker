import React, { useState, useRef, useEffect } from "react";
import { Upload, FileText, Target, Loader2, X } from "lucide-react";
// --- FIXED IMPORTS ---
import { Button } from "../button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../card";
import { Textarea } from "../textarea";
import { Alert, AlertDescription } from "../alert"; // Added Alert for better file display
// ---------------------\

/**
 * Component for the "Upload Resume" tab.
 * Manages file selection, drag-and-drop, and uploading.
 */
const UploadTab = ({
  resumeText,
  setResumeText,
  setActiveTab,
  api,
  toast,
  setResumeFile, // Make sure this is passed from App.js
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [internalResumeText, setInternalResumeText] = useState(resumeText);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setInternalResumeText(resumeText);
  }, [resumeText]);

  const onFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    const files = event.dataTransfer.files;
    if (files?.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (file && (file.type === "application/pdf" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document")) {
      setSelectedFile(file);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: "Please upload a .pdf or .docx file.",
      });
      setSelectedFile(null);
    }
  };

  const handleFileClear = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset the file input
    }
  };

  const handleUploadAndContinue = async () => {
    if (!selectedFile) return;

    setLoadingUpload(true);

    // --- FIX 1: Set the main app's file state *before* the API call ---
    // This ensures that even if the text extraction fails,
    // the app still has the file for the *analysis* step.
    setResumeFile(selectedFile);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // This endpoint is just for pre-filling the text area in the Analyze tab
      const { data } = await api.post("/upload", formData);
      setResumeText(data.text || ""); // Set extracted text on success
      toast({
        title: "Upload Successful",
        description: "Your resume text has been extracted.",
      });
    } catch (err) {
      // --- FIX 2: Do NOT reset the file on error ---
      // We still want to proceed to the analyze tab.
      // The backend /analyze endpoint will handle text extraction.
      console.error("Text extraction failed (will proceed anyway):", err?.response || err);
      toast({
        variant: "default", // Not "destructive", as we are still proceeding
        title: "Text Extraction Failed",
        description: "Moving to Analyze tab. Text will be extracted by the backend.",
      });
      // Clear any old text, since extraction failed
      setResumeText("");
      
      // setResumeFile(null); // <-- THIS WAS THE BUG. IT IS REMOVED.
      // setResumeText("");   // <-- THIS WAS ALSO BAD.
    } finally {
      // --- FIX 3: Always move to the analyze tab ---
      setLoadingUpload(false);
      setActiveTab("analyze"); // Move to analyze tab regardless of extraction success
    }
  };

  const handleContinueFromPaste = () => {
    setResumeText(internalResumeText); // Set parent text state
    setResumeFile(null); // Clear file state, since we're using text
    setActiveTab("analyze");
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Start Your Analysis</CardTitle>
        <CardDescription>
          Upload your resume (PDF or DOCX) or paste the text directly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* File Upload Section */}
          <Card
            className={`transition-all ${
              isDragOver ? "border-indigo-600 shadow-lg" : "border-slate-200"
            }`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                Upload Your Resume
              </CardTitle>
              <CardDescription>Supported formats: PDF, DOCX</CardDescription>
            </CardHeader>
            <CardContent
              className="space-y-4"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {!selectedFile ? (
                <div
                  className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md text-center ${
                    isDragOver
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-300"
                  }`}
                >
                  <Upload className="w-10 h-10 text-slate-400 mb-3" />
                  <p className="font-medium text-slate-700 mb-1">
                    {isDragOver
                      ? "Drop your file here"
                      : "Drag & drop your file here"}
                  </p>
                  <p className="text-sm text-slate-500 mb-3">
                    or click to browse
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse Files
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onFileChange}
                    className="hidden"
                    accept=".pdf,.docx"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert variant="default" className="bg-indigo-50 border-indigo-200">
                    <FileText className="w-5 h-5 text-indigo-700" />
                    <AlertDescription className="flex items-center justify-between">
                      <span className="font-medium text-indigo-900 truncate pr-2">
                        {selectedFile.name}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleFileClear}
                        className="h-7 w-7"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </AlertDescription>
                  </Alert>
                  <Button
                    onClick={handleUploadAndContinue}
                    disabled={loadingUpload}
                    className="w-full gap-2"
                    size="lg"
                  >
                    {loadingUpload ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Target className="w-4 h-4" />
                    )}
                    Continue to Analysis
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Divider */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-slate-300" />
            <span className="text-sm text-slate-500 px-3">OR</span>
            <div className="flex-1 h-px bg-slate-300" />
          </div>

          {/* Paste Text Section */}
          <Card className="border border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Paste Resume Text Directly
              </CardTitle>
              <CardDescription>
                Copy and paste your resume content here if you don't have a file
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={internalResumeText}
                onChange={(e) => setInternalResumeText(e.target.value)}
                placeholder="Paste your resume text here..."
                className="min-h-40 sm:min-h-52 md:min-h-64 resize-y"
              />
              {internalResumeText && (
                <Button
                  onClick={handleContinueFromPaste}
                  className="w-full gap-2 mt-3"
                  size="lg"
                >
                  Continue to Analysis
                  <Target className="w-4 h-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadTab;