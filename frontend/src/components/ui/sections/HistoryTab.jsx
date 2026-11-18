// src/components/ui/sections/HistoryTab.jsx
import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { FileText, ServerCrash, RefreshCw } from "lucide-react";
import AnalysisDetailModal from "./AnalysisDetailModal";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table";
import { Skeleton } from "../skeleton";
import { Badge } from "../badge";
import { Button } from "../button";

const safeErrorString = (err) => {
  if (!err && err !== 0) return "";
  if (typeof err === "string") return err;
  try {
    if (err?.detail) return typeof err.detail === "string" ? err.detail : JSON.stringify(err.detail);
    return JSON.stringify(err, null, 2);
  } catch {
    return String(err);
  }
};

const HistoryTab = ({ isActive, api, toast }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/analysis-history");
      setHistory(Array.isArray(data) ? data : []);
      setHasFetched(true);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        setError("Please log in to view your analysis history.");
      } else {
        const detail = err?.response?.data || err?.message || "Failed to fetch history.";
        setError(detail);
        toast({
          variant: "destructive",
          title: "Failed to load history",
          description: safeErrorString(detail),
        });
      }
      setHasFetched(true);
    } finally {
      setLoading(false);
    }
  }, [api, toast]);

  useEffect(() => {
    if (isActive && !hasFetched) {
      fetchHistory();
    }
  }, [isActive, hasFetched, fetchHistory]);

  const safeNumber = (val, fallback = 0) => {
    const n = Number(val);
    return Number.isFinite(n) ? n : fallback;
  };

  const safeDateString = (val) => {
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return null;
      return format(d, "MMM d, yyyy · HH:mm");
    } catch {
      return null;
    }
  };

  const getMatchColor = (score) =>
    score > 75
      ? "bg-green-100 text-green-800"
      : score > 50
      ? "bg-yellow-100 text-yellow-800"
      : "bg-red-100 text-red-800";

  const getAtsColor = (score) =>
    score > 80 ? "text-green-600" : score > 60 ? "text-yellow-600" : "text-red-600";

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      );
    }

    if (error) {
      const errText = safeErrorString(error) || "Unknown error";
      const isAuthError = typeof errText === "string" && errText.toLowerCase().includes("log in");
      return (
        <div className="flex flex-col items-start justify-start gap-4">
          <div className="flex items-center gap-3">
            <ServerCrash className="w-10 h-10 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-700">
                {isAuthError ? "Authentication Required" : "Error loading history"}
              </p>
              <p className="text-sm text-slate-600">{errText}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchHistory} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Retry
          </Button>
        </div>
      );
    }

    if (!history || history.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-slate-500 gap-2">
          <FileText className="w-12 h-12 mb-1 text-slate-300" />
          <p className="font-semibold">No History Found</p>
          <p className="text-sm text-center">
            Your past analysis results will appear here after you run an analysis.
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Job Title</TableHead>
              <TableHead>Match</TableHead>
              <TableHead>ATS Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((item) => {
              const match = safeNumber(item?.match_percentage, 0);
              const ats = safeNumber(item?.ats_compatibility_score, 0);
              const createdAt = safeDateString(item?.created_at) || "Unknown date";

              return (
                <TableRow
                  key={item?.id || Math.random().toString(36).slice(2)}
                  onClick={() => setSelectedAnalysis(item?.id)}
                  className="cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <TableCell className="text-sm text-slate-600 whitespace-nowrap">{createdAt}</TableCell>
                  <TableCell className="font-medium text-slate-900 max-w-xs truncate">
                    {item?.target_job_title || "Untitled Analysis"}
                  </TableCell>
                  <TableCell>
                    <Badge className={getMatchColor(match)}>{match.toFixed(0)}%</Badge>
                  </TableCell>
                  <TableCell className={`font-semibold ${getAtsColor(ats)}`}>
                    {ats.toFixed(0)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Analysis History</CardTitle>
            <CardDescription className="mt-1">
              Your 10 most recent analysis results. Click a row to see full details.
            </CardDescription>
          </div>
          {hasFetched && !loading && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setHasFetched(false); fetchHistory(); }}
              className="gap-2 text-slate-500"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
          )}
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>

      <AnalysisDetailModal
        analysisId={selectedAnalysis}
        isOpen={!!selectedAnalysis}
        onClose={() => setSelectedAnalysis(null)}
        api={api}
        toast={toast}
      />
    </>
  );
};

export default HistoryTab;
