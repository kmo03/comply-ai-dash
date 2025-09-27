import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function FileUploadArea() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const simulateUpload = useCallback((fileName: string) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadedFile(fileName);
          toast({
            title: "Upload Complete",
            description: `${fileName} has been successfully uploaded and processed.`,
          });
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx'))) {
      simulateUpload(file.name);
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV or Excel file.",
        variant: "destructive",
      });
    }
  }, [simulateUpload, toast]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      simulateUpload(file.name);
    }
  }, [simulateUpload]);

  return (
    <Card className="shadow-card hover:shadow-hover transition-shadow duration-200">
      <CardContent className="p-8">
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
            isDragOver
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-secondary/50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {uploadedFile ? (
            <div className="space-y-4">
              <CheckCircle className="mx-auto h-12 w-12 text-success" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Upload Complete
                </h3>
                <p className="text-muted-foreground">
                  {uploadedFile} has been processed successfully
                </p>
              </div>
            </div>
          ) : isUploading ? (
            <div className="space-y-4">
              <Upload className="mx-auto h-12 w-12 text-primary animate-pulse" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Processing File...
                </h3>
                <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Upload Employee Data
                </h3>
                <p className="text-muted-foreground mb-4">
                  Drag and drop your CSV or Excel file here, or click to browse
                </p>
                
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                
                <Button asChild className="cursor-pointer">
                  <label htmlFor="file-upload">
                    Choose File
                  </label>
                </Button>
                
                <p className="text-xs text-muted-foreground mt-3">
                  Supported formats: CSV, Excel (.xlsx, .xls)
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}