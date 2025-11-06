import React, { useState, useEffect } from "react";
import { Loader2, ServerCrash } from "lucide-react";
import AnalysisDetailContent from "./AnalysisDetailContent";
// --- FIXED IMPORTS (and added DialogDescription) ---
import { Button } from "../button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, DialogClose } from "../dialog";
import { ScrollArea } from "../scroll-area";
// ---------------------------------------------------

const AnalysisDetailModal = ({ analysisId, isOpen, onClose, api, toast }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && analysisId) {
      const fetchAnalysis = async () => {
        setLoading(true);
        setError(null);
        setAnalysis(null);
        try {
          const { data } = await api.get(`/analysis/${analysisId}`);
          setAnalysis(data);
        } catch (err) {
          console.error("Fetch analysis detail error", err?.response || err);
          setError(err?.response?.data?.detail || err.message);
          toast({
            variant: "destructive",
            title: "Failed to load analysis",
            description: err?.response?.data?.detail || err.message,
          });
        } finally {
          setLoading(false);
        }
      };
      fetchAnalysis();
    }
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
      return (
        <div className="flex flex-col items-center justify-center h-96 text-red-600">
          <ServerCrash className="w-12 h-12 mb-2" />
          <p className="font-semibold">Error loading analysis</p>
          <p className="text-sm">{error}</p>
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
          <DialogDescription>
            Detailed breakdown for {analysis?.target_job_title || "your analysis"}.
          </DialogDescription>
        </DialogHeader>
        <div className="h-full pb-12">
          <ScrollArea className="h-full pr-6">
            {renderContent()}
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