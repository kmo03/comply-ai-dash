import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadAreaProps {
  onFileProcessed?: (result: any) => void;
  isProcessing?: boolean;
  onFileSelect?: (file: File) => void;
}

export function FileUploadArea({ onFileProcessed, isProcessing = false, onFileSelect }: FileUploadAreaProps) {
  const [isDragOver, setIsDragOver] = useState(false);
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

  const validateFile = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File Too Large",
        description: "Please upload a CSV file smaller than 10MB.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && validateFile(file)) {
      onFileSelect?.(file);
    }
  }, [validateFile, onFileSelect]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      onFileSelect?.(file);
    }
    // Reset input
    e.target.value = '';
  }, [validateFile, onFileSelect]);

  // Show processing state when isProcessing is true
  if (isProcessing) {
    return (
      <Card className="shadow-card hover:shadow-hover transition-shadow duration-200">
        <CardContent className="p-8">
          <div className="border-2 border-dashed rounded-lg p-8 text-center border-primary bg-primary/5">
            <div className="space-y-4">
              <Upload className="mx-auto h-12 w-12 text-primary animate-pulse" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Processing File...
                </h3>
                <p className="text-muted-foreground mb-4">
                  AI is analyzing and standardizing your employee data
                </p>
                <div className="w-full max-w-xs mx-auto">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Processing...</span>
                  </div>
                  <Progress value={undefined} className="h-2" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card hover:shadow-hover transition-shadow duration-200 card-border-thin equal-height">
      <CardContent className="p-8 flex flex-col justify-center h-full">
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
          <div className="space-y-4">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Upload Employee Data
              </h3>
              <p className="text-muted-foreground mb-4">
                Drag and drop your CSV file here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                CSV format required with columns: Name, Race, Gender, Management_Level
              </p>
              
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              
              <Button asChild className="cursor-pointer bg-yellow-400 hover:bg-yellow-500 text-black font-medium">
                <label htmlFor="file-upload">
                  Choose File
                </label>
              </Button>
              
              <p className="text-xs text-muted-foreground mt-3">
                AI will automatically standardize race, gender, and management level data
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}