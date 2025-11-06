import React from 'react';
import { Loader2 } from "lucide-react";
import { Button } from "../button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter, DialogClose } from "../dialog"
import { ScrollArea } from "../scroll-area"
import AnalysisDetailContent from './AnalysisDetailContent';

/**
 * Modal to display the full details of a past analysis.
 */
const AnalysisDetailModal = ({ isOpen, setIsOpen, isLoading, itemData }) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl h-[90vh]">
        <DialogHeader>
          <DialogTitle>Analysis Detail</DialogTitle>
          <DialogDescription>
            Full analysis result for {itemData?.target_job_title || "General Role"} from {itemData?.created_at ? new Date(itemData.created_at).toLocaleString('en-US') : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="h-full pb-12">
          <ScrollArea className="h-full pr-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
              </div>
            ) : (
              <AnalysisDetailContent analysis={itemData} />
            )}
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