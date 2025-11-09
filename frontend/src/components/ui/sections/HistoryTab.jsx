// src/components/ui/sections/HistoryTab.jsx
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { FileText, ServerCrash } from "lucide-react";
import AnalysisDetailModal from "./AnalysisDetailModal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table";
import { Skeleton } from "../skeleton";
import { Badge } from "../badge";

const safeErrorString = (err) => {
  if (!err && err !== 0) return "";
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err, null, 2);
  } catch {
    return String(err);
  }
};

const HistoryTab = ({ isActive, api, toast }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  useEffect(() => {
    if (!isActive) return;
    if (history.length > 0 || !loading) return;

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get("/analysis-history");
        setHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("History fetch error", err?.response || err);
        const detail = err?.response?.data || err?.message || "Failed to fetch history.";
        setError(detail);
        toast({ variant: "destructive", title: "Failed to load history", description: safeErrorString(detail) });
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [isActive, api, toast, history.length, loading]);

  const safeNumber = (val, fallback = 0) => {
    const n = Number(val);
    return Number.isFinite(n) ? n : fallback;
  };

  const safeDateString = (val) => {
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return null;
      return format(d, "MMM d, yyyy");
    } catch {
      return null;
    }
  };

  const getMatchColor = (score) => (score > 75 ? "bg-green-100 text-green-800" : score > 50 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800");
  const getAtsColor = (score) => (score > 80 ? "text-green-600" : score > 60 ? "text-yellow-600" : "text-red-600");

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      );
    }

    if (error) {
      const errText = safeErrorString(error) || "Unknown error";
      return (
        <div className="flex flex-col items-start justify-start h-48">
          <div className="flex items-center gap-3 mb-3">
            <ServerCrash className="w-12 h-12 text-red-600" />
            <div>
              <p className="font-semibold text-red-700">Error loading history</p>
              <p className="text-sm text-slate-600">See details below.</p>
            </div>
          </div>

          <div className="w-full overflow-auto bg-slate-50 p-3 rounded text-xs font-mono text-red-800">
            <pre className="whitespace-pre-wrap">{errText}</pre>
          </div>
        </div>
      );
    }

    if (!history || history.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-slate-500">
          <FileText className="w-12 h-12 mb-2" />
          <p className="font-semibold">No History Found</p>
          <p className="text-sm">Your past analysis results will appear here.</p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Job Title</TableHead>
            <TableHead>Match %</TableHead>
            <TableHead>ATS Score</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.map((item) => {
            const match = safeNumber(item?.match_percentage, 0);
            const ats = safeNumber(item?.ats_compatibility_score, 0);
            const createdAt = safeDateString(item?.created_at) || "Unknown date";

            return (
              <TableRow key={item?.id || Math.random().toString(36).slice(2)} onClick={() => setSelectedAnalysis(item?.id)} className="cursor-pointer hover:bg-slate-50">
                <TableCell className="text-sm text-slate-600">{createdAt}</TableCell>
                <TableCell className="font-medium text-slate-900 max-w-xs truncate">{item?.target_job_title || "Untitled Analysis"}</TableCell>
                <TableCell><Badge className={getMatchColor(match)}>{match.toFixed(0)}%</Badge></TableCell>
                <TableCell className={`font-medium ${getAtsColor(ats)}`}>{ats.toFixed(0)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Analysis History</CardTitle>
          <CardDescription>View your 10 most recent analysis results. Click a row to see details.</CardDescription>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>

      <AnalysisDetailModal analysisId={selectedAnalysis} isOpen={!!selectedAnalysis} onClose={() => setSelectedAnalysis(null)} api={api} toast={toast} />
    </>
  );
};

export default HistoryTab;
