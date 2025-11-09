// src/components/ui/sections/AnalysisDetailModal.jsx
import React, { useState, useEffect } from "react";
import { Loader2, ServerCrash } from "lucide-react";
import AnalysisDetailContent from "./AnalysisDetailContent";
import { Button } from "../button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../dialog";
import { ScrollArea } from "../scroll-area";

const safeErrorString = (err) => {
  if (!err && err !== 0) return "";
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err, null, 2);
  } catch {
    return String(err);
  }
};

const AnalysisDetailModal = ({ analysisId, isOpen, onClose, api, toast }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !analysisId) return;
    const fetchAnalysis = async () => {
      setLoading(true);
      setError(null);
      setAnalysis(null);
      try {
        const { data } = await api.get(`/analysis/${analysisId}`);
        setAnalysis(data);
      } catch (err) {
        console.error("Fetch analysis detail error", err?.response || err);
        const detail = err?.response?.data || err?.message || "Unknown error";
        setError(detail);
        toast({
          variant: "destructive",
          title: "Failed to load analysis",
          description: safeErrorString(detail),
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [analysisId, isOpen, api, toast]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        </div>
      );
    }

    if (error) {
      const txt = safeErrorString(error) || "Unknown error";
      return (
        <div className="flex flex-col items-start justify-start h-96">
          <div className="flex items-center gap-3 mb-4">
            <ServerCrash className="w-12 h-12 text-red-600" />
            <div>
              <p className="font-semibold text-red-700">Error loading analysis</p>
              <p className="text-sm text-slate-600">See details below.</p>
            </div>
          </div>

          <div className="w-full overflow-auto bg-slate-50 p-3 rounded text-xs font-mono text-red-800">
            <pre className="whitespace-pre-wrap">{txt}</pre>
          </div>
        </div>
      );
    }

    if (analysis) {
      return <AnalysisDetailContent analysis={analysis} />;
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh]">
        <DialogHeader>
          <DialogTitle>Analysis Details</DialogTitle>
          <DialogDescription>Detailed breakdown for {analysis?.target_job_title || "your analysis"}.</DialogDescription>
        </DialogHeader>

        <div className="h-full pb-12">
          <ScrollArea className="h-full pr-6">{renderContent()}</ScrollArea>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AnalysisDetailModal;
