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
            <div className="mb-8 pb-4">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                BEE Compliance Dashboard
              </h1>
              <p className="text-muted-foreground">
                Monitor and manage your Broad-Based Black Economic Empowerment compliance
              </p>
            </div>

            {/* Top Row - Score and Upload */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
              <div className="lg:col-span-1">
                <BEEScoreCard beeResult={beeResult} employees={employees} sessionId={sessionId} />
              </div>
              
              <div className="lg:col-span-2">
                <FileUploadArea 
                  onFileSelect={handleFileSelect}
                  isProcessing={isProcessing}
                />
              </div>
            </div>

            {/* Management Breakdown */}
            <ManagementBreakdown beeResult={beeResult} />

            {/* Bottom Row - Data Preview */}
            <div className="mb-6">
              <DataPreviewTable employees={employees} />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;