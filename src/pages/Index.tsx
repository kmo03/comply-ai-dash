import { useEffect, useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Header } from "@/components/Header";
import { AppSidebar } from "@/components/AppSidebar";
import { BEEScoreCard } from "@/components/BEEScoreCard";
import { ManagementBreakdown } from "@/components/ManagementBreakdown";
import { FileUploadArea } from "@/components/FileUploadArea";
import { DataPreviewTable } from "@/components/DataPreviewTable";
import { useSession } from "@/hooks/useSession";
import { useBEEData } from "@/hooks/useBEEData";

const Index = () => {
  const { sessionId } = useSession();
  const { isProcessing, employees, beeResult, warnings, processCSVFile, loadExistingData } = useBEEData(sessionId);

  // Load existing data on component mount
  useEffect(() => {
    loadExistingData();
  }, [loadExistingData]);

  const handleFileSelect = async (file: File) => {
    try {
      await processCSVFile(file);
    } catch (error) {
      console.error('Failed to process file:', error);
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <Header />
          
          <main className="flex-1 p-6 space-y-6 overflow-auto">
            {/* Welcome Section */}
