// src/components/ui/sections/UploadTab.jsx
import React, { useState, useRef, useEffect } from "react";
import { Upload, FileText, Target, Loader2, X, AlertCircle } from "lucide-react";
import { Button } from "../button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card";
import { Textarea } from "../textarea";
import { Alert, AlertDescription } from "../alert";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".doc"];

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const UploadTab = ({ resumeText, setResumeText, setActiveTab, api, toast, setResumeFile }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [internalResumeText, setInternalResumeText] = useState(resumeText);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setInternalResumeText(resumeText);
  }, [resumeText]);

  const handleFileSelect = (file) => {
    if (!file) return;

    const lowerName = (file.name || "").toLowerCase();
    const hasValidExt = ALLOWED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
    const hasValidMime =
      file.type === "application/pdf" ||
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.type === "application/msword";

    if (!hasValidExt && !hasValidMime) {
      toast({
        variant: "destructive",
        title: "Invalid File Type",
        description: `Please upload a ${ALLOWED_EXTENSIONS.join(", ")} file.`,
      });
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: `File size (${formatBytes(file.size)}) exceeds the ${MAX_FILE_SIZE_MB} MB limit.`,
      });
      setSelectedFile(null);
      return;
    }

    if (file.size === 0) {
      toast({ variant: "destructive", title: "Empty File", description: "The selected file appears to be empty." });
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const onFileChange = (e) => handleFileSelect(e.target.files?.[0] || null);

  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragOver(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files?.length > 0) handleFileSelect(files[0]);
  };

  const handleFileClear = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadAndContinue = async () => {
    if (!selectedFile) return;
    setLoadingUpload(true);
    setResumeFile(selectedFile);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const { data } = await api.post("/upload-resume", formData, { timeout: 60000 });
      const extracted = data.text || "";
      if (!extracted.trim()) {
        const detail = data?.detail || "No text extracted from uploaded file. Try another file.";
        toast({ variant: "destructive", title: "Text Extraction Failed", description: typeof detail === "string" ? detail : JSON.stringify(detail) });
        return;
      }
      setResumeText(extracted);
      toast({ title: "Upload Successful ✓", description: `Extracted ${extracted.split(/\s+/).length.toLocaleString()} words from ${selectedFile.name}.` });
      setActiveTab("analyze");
    } catch (err) {
      const status = err?.response?.status;
      let description = err?.response?.data?.detail || err?.message || "Unable to extract text from resume.";
      if (status === 413) description = `File too large. Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`;
      if (typeof description !== "string") description = JSON.stringify(description);
      toast({ variant: "destructive", title: "Upload Failed", description });
    } finally {
      setLoadingUpload(false);
    }
  };

  const handleContinueFromPaste = () => {
    if (!internalResumeText?.trim()) {
      toast({ variant: "destructive", title: "Empty", description: "Please paste resume text first." });
      return;
    }
    setResumeText(internalResumeText);
    setResumeFile(null);
    setActiveTab("analyze");
  };

  const wordCount = internalResumeText.trim() ? internalResumeText.trim().split(/\s+/).length : 0;

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Start Your Analysis</CardTitle>
        <CardDescription>Upload your resume (PDF or DOCX, max {MAX_FILE_SIZE_MB} MB) or paste the text directly.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* File Upload Zone */}
          <Card className={`transition-all duration-200 ${isDragOver ? "border-indigo-500 shadow-lg bg-indigo-50/50" : "border-slate-200"}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                Upload Your Resume
              </CardTitle>
              <CardDescription>Supported formats: PDF, DOCX · Max size: {MAX_FILE_SIZE_MB} MB</CardDescription>
            </CardHeader>
            <CardContent
              className="space-y-4"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {!selectedFile ? (
                <div
                  className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${
                    isDragOver ? "border-indigo-500 bg-indigo-50" : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-10 h-10 text-slate-400 mb-3" />
                  <p className="font-medium text-slate-700 mb-1">
                    {isDragOver ? "Drop your file here" : "Drag & drop your file here"}
                  </p>
                  <p className="text-sm text-slate-500 mb-3">or click to browse</p>
                  <Button type="button" variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                    Browse Files
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onFileChange}
                    className="hidden"
                    accept=".pdf,.docx,.doc,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <Alert variant="default" className="bg-indigo-50 border-indigo-200">
                    <FileText className="w-5 h-5 text-indigo-700" />
                    <AlertDescription className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-indigo-900 block truncate pr-2 max-w-xs">{selectedFile.name}</span>
                        <span className="text-xs text-indigo-600">{formatBytes(selectedFile.size)}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button type="button" variant="ghost" size="icon" onClick={handleFileClear} title="Remove file">
                          <X className="w-4 h-4" />
                        </Button>
                        <Button onClick={handleUploadAndContinue} disabled={loadingUpload} className="h-9 gap-2">
                          {loadingUpload ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Extracting…</>
                          ) : (
                            <><Target className="w-4 h-4" /> Extract & Continue</>
                          )}
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-sm text-slate-400 px-3">OR</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Paste Zone */}
          <Card className="border border-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Paste Resume Text Directly
              </CardTitle>
              <CardDescription>Copy and paste your resume content here if you don't have a file.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={internalResumeText}
                onChange={(e) => setInternalResumeText(e.target.value)}
                placeholder="Paste your resume text here…"
                className="min-h-40 sm:min-h-52 resize-y"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {wordCount > 0 ? `${wordCount.toLocaleString()} words` : ""}
                </span>
                {wordCount > 0 && wordCount < 50 && (
                  <span className="text-xs text-yellow-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Resume seems very short
                  </span>
                )}
              </div>
              {internalResumeText?.trim() && (
                <Button onClick={handleContinueFromPaste} className="w-full gap-2" size="lg">
                  Continue to Analysis <Target className="w-4 h-4" />
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
