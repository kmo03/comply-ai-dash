import { useState, useCallback } from 'react';
import { uploadCSV, calculateBEE, getEmployees, parseCSV, Employee, BEECalculationResult, EmployeesResponse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useBEEData(sessionId: string) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [beeResult, setBeeResult] = useState<BEECalculationResult | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const { toast } = useToast();

  const processCSVFile = useCallback(async (file: File) => {
    try {
      setIsProcessing(true);
      
      // Read file content
      const csvContent = await file.text();
      
      // Basic validation
      const parsedRows = parseCSV(csvContent);
      if (parsedRows.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row');
      }

      // Upload and process with AI
      const uploadResult = await uploadCSV(csvContent, sessionId);
      
      if (uploadResult.warnings.length > 0) {
        setWarnings(uploadResult.warnings);
        toast({
          title: "Data Processing Warnings",
          description: `${uploadResult.warnings.length} warnings detected. Please review.`,
          variant: "destructive",
        });
      }

      // Calculate BEE scores
      const beeResult = await calculateBEE(sessionId);
      setBeeResult(beeResult);

      // Get processed employees
      const employeesResult = await getEmployees(sessionId);
      setEmployees(employeesResult.employees);

      toast({
        title: "Processing Complete",
        description: `Successfully processed ${uploadResult.processedCount} employees and calculated BEE scores.`,
      });

      return {
        employees: employeesResult.employees,
        beeResult,
        warnings: uploadResult.warnings
      };

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to process CSV file';
      toast({
        title: "Processing Failed",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [sessionId, toast]);

  const loadExistingData = useCallback(async () => {
    try {
      const employeesResult = await getEmployees(sessionId);
      if (employeesResult.employees.length > 0) {
        setEmployees(employeesResult.employees);
        
        const beeResult = await calculateBEE(sessionId);
        setBeeResult(beeResult);
        
        return { employees: employeesResult.employees, beeResult };
      }
    } catch (error) {
      // Silently fail - no existing data
      console.log('No existing data found for session');
    }
    return null;
  }, [sessionId]);

  return {
    isProcessing,
    employees,
    beeResult,
    warnings,
    processCSVFile,
    loadExistingData
  };
}