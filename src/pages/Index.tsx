import { SidebarProvider } from "@/components/ui/sidebar";
import { Header } from "@/components/Header";
import { AppSidebar } from "@/components/AppSidebar";
import { BEEScoreCard } from "@/components/BEEScoreCard";
import { ManagementBreakdown } from "@/components/ManagementBreakdown";
import { FileUploadArea } from "@/components/FileUploadArea";
import { GapAnalysis } from "@/components/GapAnalysis";
import { DataPreviewTable } from "@/components/DataPreviewTable";

const Index = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <Header />
          
          <main className="flex-1 p-6 space-y-6 overflow-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                BEE Compliance Dashboard
              </h1>
              <p className="text-muted-foreground">
                Monitor and manage your Broad-Based Black Economic Empowerment compliance
              </p>
            </div>

            {/* Top Row - Score and Upload */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <BEEScoreCard 
                  score={65} 
                  maxScore={100} 
                  level="Level 6 Contributor" 
                />
              </div>
              
              <div className="lg:col-span-2">
                <FileUploadArea />
              </div>
            </div>

            {/* Management Breakdown */}
            <ManagementBreakdown />

            {/* Bottom Row - Data Preview and Gap Analysis */}
            <div className="grid gap-6 lg:grid-cols-2">
              <DataPreviewTable />
              <GapAnalysis />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
