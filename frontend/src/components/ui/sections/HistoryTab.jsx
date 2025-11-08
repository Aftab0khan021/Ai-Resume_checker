import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { FileText, ServerCrash } from "lucide-react";
import AnalysisDetailModal from "./AnalysisDetailModal";
// --- FIXED IMPORTS (and added CardDescription) ---
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table";
import { Skeleton } from "../skeleton";
import { Badge } from "../badge";
// --------------------------------------------------

const HistoryTab = ({ isActive, api, toast }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  useEffect(() => {
    // Only fetch history if the tab is active and not already loaded
    if (isActive && history.length === 0 && loading) {
      const fetchHistory = async () => {
        try {
          setError(null);
          const { data } = await api.get("/analysis-history");
          setHistory(data || []);
        } catch (err) {
          console.error("History fetch error", err?.response || err);
          setError(err?.response?.data?.detail || err.message);
          toast({
            variant: "destructive",
            title: "Failed to load history",
            description: err?.response?.data?.detail || err.message,
          });
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [isActive, api, toast, history.length, loading]);

  const getMatchColor = (score) => {
    if (score > 75) return "bg-green-100 text-green-800";
    if (score > 50) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };
  
  const getAtsColor = (score) => {
    if (score > 80) return "text-green-600";
    if (score > 60) return "text-yellow-600";
    return "text-red-600";
  };

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
      return (
        <div className="flex flex-col items-center justify-center h-48 text-red-600">
          <ServerCrash className="w-12 h-12 mb-2" />
          <p className="font-semibold">Error loading history</p>
          <p className="text-sm">{error}</p>
        </div>
      );
    }

    if (history.length === 0) {
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
          {history.map((item) => (
            <TableRow 
              key={item.id} 
              onClick={() => setSelectedAnalysis(item.id)}
              className="cursor-pointer hover:bg-slate-50"
            >
              <TableCell className="text-sm text-slate-600">
                {format(new Date(item.created_at), "MMM d, yyyy")}
              </TableCell>
              <TableCell className="font-medium text-slate-900 max-w-xs truncate">
                {item.target_job_title || "Untitled Analysis"}
              </TableCell>
              <TableCell>
                <Badge className={getMatchColor(item.match_percentage)}>
                  {item.match_percentage.toFixed(0)}%
                </Badge>
              </TableCell>
              <TableCell className={`font-medium ${getAtsColor(item.ats_compatibility_score)}`}>
                {item.ats_compatibility_score.toFixed(0)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Analysis History</CardTitle>
          <CardDescription>
            View your 10 most recent analysis results. Click a row to see details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
      
      {/* Analysis Detail Modal */}
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