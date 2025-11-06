import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, CheckCircle, XCircle } from "lucide-react";
// --- FIXED IMPORTS ---
import { Button } from "../button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../card";
import { Textarea } from "../textarea";
// ---------------------

const UploadTab = ({ resumeText, setResumeText, setActiveTab, api, toast }) => {
  const [fileName, setFileName] = useState("");
  const [uploadStatus, setUploadStatus] = useState("idle"); // idle, uploading, success, error
  const [isPasting, setIsPasting] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setFileName(file.name);
      setUploadStatus("uploading");
      setResumeText(""); // Clear previous text

      const formData = new FormData();
      formData.append("file", file);

      try {
        const { data } = await api.post("/upload-resume", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setResumeText(data.text);
        setUploadStatus("success");
        toast({
          title: "Upload Successful",
          description: `Extracted ${data.text.length} characters from ${file.name}.`,
        });
        // Automatically switch to the next tab on success
        setTimeout(() => setActiveTab("analyze"), 1000);
      } catch (err) {
        console.error("File upload error", err?.response || err);
        setUploadStatus("error");
        toast({
          variant: "destructive",
          title: "Upload Failed",
          description: err?.response?.data?.detail || err.message,
        });
      }
    },
    [api, setResumeText, setActiveTab, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/msword": [".doc"],
    },
    maxFiles: 1,
  });

  const handlePasteToggle = () => {
    setIsPasting(!isPasting);
    setUploadStatus("idle");
    setFileName("");
  };
  
  const handleTextChange = (e) => {
    setResumeText(e.target.value);
    if (e.target.value.length > 10) {
      setUploadStatus("success");
      setFileName("Pasted Text");
    } else {
      setUploadStatus("idle");
      setFileName("");
    }
  };

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Upload Your Resume</CardTitle>
          <CardDescription>
            {isPasting 
              ? "Paste your resume text into the box below." 
              : "Drag & drop your .pdf or .docx file here, or click to select."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPasting ? (
            <div className="space-y-4">
              <Textarea
                placeholder="Paste your resume content here..."
                className="h-64"
                value={resumeText}
                onChange={handleTextChange}
              />
              <Button onClick={handlePasteToggle} variant="outline" className="w-full">
                Back to File Upload
              </Button>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors
                ${isDragActive ? "border-indigo-600 bg-indigo-50" : "border-slate-300 hover:border-slate-400"}`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2 text-slate-600">
                <Upload className="w-12 h-12" />
                <p className="font-semibold">
                  {isDragActive ? "Drop the file here..." : "Click to upload or drag & drop"}
                </p>
                <p className="text-sm">Supports: PDF, DOCX, DOC</p>
              </div>
            </div>
          )}

          {fileName && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-slate-100 rounded-lg">
              <FileText className="w-6 h-6 text-slate-700" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{fileName}</p>
                {uploadStatus === "uploading" && <p className="text-sm text-slate-500">Uploading & Parsing...</p>}
                {uploadStatus === "success" && <p className="text-sm text-green-600">Ready for Analysis</p>}
                {uploadStatus === "error" && <p className="text-sm text-red-600">Upload Failed</p>}
              </div>
              {uploadStatus === "uploading" && <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />}
              {uploadStatus === "success" && <CheckCircle className="w-5 h-5 text-green-600" />}
              {uploadStatus === "error" && <XCircle className="w-5 h-5 text-red-600" />}
            </div>
          )}
          
          {!isPasting && (
            <div className="mt-4 text-center">
              <Button onClick={handlePasteToggle} variant="link">
                ...or paste resume text instead
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadTab;