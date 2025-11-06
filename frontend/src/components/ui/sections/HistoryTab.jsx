import React, { useState, useEffect } from 'react';
import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../table"
import { Skeleton } from "../skeleton"
import { Badge } from "../badge"
import AnalysisDetailModal from './AnalysisDetailModal'; // Relative import

// Helper function to get badge color based on score
const getMatchColor = (percentage) => {
    if (percentage >= 80) return "bg-emerald-500";
    if (percentage >= 60) return "bg-amber-500";
    return "bg-rose-500";
  };
  
/**
 * Component for the "History" tab.
 * Manages fetching history, displaying it in a table, and handling the detail modal.
 */
const HistoryTab = ({ isActive, api, toast }) => {
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Modal State
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  
  // Fetch history when the tab becomes active
  useEffect(() => {
    if (isActive) {
      fetchHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]); // Dependency on isActive

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data } = await api.get("/analysis-history");
      setHistory(data);
    } catch (err) {
      console.error("History fetch error", err?.response || err);
      toast({
        variant: "destructive",
        title: "History Failed",
        description: "Could not fetch analysis history: " + (err?.response?.data?.detail || err.message),
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleHistoryClick = async (analysisId) => {
    setLoadingModal(true);
    setIsModalOpen(true);
    setSelectedHistoryItem(null);
    
    try {
      const { data } = await api.get(`/analysis/${analysisId}`);
      setSelectedHistoryItem(data);
    } catch (err) {
      console.error("Fetch analysis detail error", err?.response || err);
      toast({
        variant: "destructive",
        title: "Load Failed",
        description: "Could not load analysis details: " + (err?.response?.data?.detail || err.message),
      });
      setIsModalOpen(false);
    } finally {
      setLoadingModal(false);
    }
  };

  return (
    <>
      <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Clock className="w-6 h-6 text-indigo-600" />
            Analysis History (Last 10)
          </CardTitle>
          <CardDescription>
            Click a row to see the full analysis details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-1/2" />
            </div>
          ) : history.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No analysis history found. Start by analyzing a match!</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Date</TableHead>
                    <TableHead className="w-[150px]">Target Role</TableHead>
                    <TableHead>Summary</TableHead>
                    <TableHead className="text-right">Match %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => (
                    <TableRow 
                        key={item.id} 
                        onClick={() => handleHistoryClick(item.id)}
                        // --- UPDATED: Added subtle transition classes ---
                        className="cursor-pointer hover:bg-slate-100/50 transition-all duration-150 ease-in-out"
                    >
                      <TableCell className="font-medium text-xs">
                          {new Date(item.created_at).toLocaleDateString('en-US')}
                      </TableCell>
                      <TableCell className="font-medium">
                          {item.target_job_title || "General Role"}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                          {item.analysis_summary.substring(0, 70)}...
                      </TableCell>
                      <TableCell className="text-right">
                          <Badge className={getMatchColor(item.match_percentage)}>
                              {Math.round(item.match_percentage)}%
                          </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AnalysisDetailModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        isLoading={loadingModal}
        itemData={selectedHistoryItem}
      />
    </>
  );
};

export default HistoryTab;