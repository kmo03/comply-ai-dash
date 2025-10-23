import { useState, useCallback } from 'react';
import { uploadCSV, calculateBEE, getEmployees, parseCSV, Employee, BEECalculationResult, EmployeesResponse } from '@/lib/api';
import { mockUploadCSV, mockCalculateBEEFromSession, mockGetEmployees } from '@/lib/mockApi';
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
      console.log('Starting CSV processing for file:', file.name);
      
      // Read file content
      const csvContent = await file.text();
      console.log('CSV content length:', csvContent.length);
      
      // Basic validation
      const parsedRows = parseCSV(csvContent);
      console.log('Parsed rows:', parsedRows.length);
      if (parsedRows.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row');
      }

      console.log('Uploading CSV to Supabase...');
      let uploadResult;
      let beeResult;
      let employeesResult;
      
      try {
        // Try Supabase functions first
        uploadResult = await uploadCSV(csvContent, sessionId);
        console.log('Upload result:', uploadResult);
        
        beeResult = await calculateBEE(sessionId);
        employeesResult = await getEmployees(sessionId);
      } catch (supabaseError) {
        console.log('Supabase functions not available, using mock functions:', supabaseError);
        
        // Fallback to mock functions
        uploadResult = await mockUploadCSV(csvContent, sessionId);
        console.log('Mock upload result:', uploadResult);
        
        beeResult = await mockCalculateBEEFromSession(sessionId);
        employeesResult = await mockGetEmployees(sessionId);
      }
      
      if (uploadResult.warnings.length > 0) {
        setWarnings(uploadResult.warnings);
        toast({
          title: "Data Processing Warnings",
          description: `${uploadResult.warnings.length} warnings detected. Please review.`,
          variant: "destructive",
        });
      }

      setBeeResult(beeResult);
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
      let employeesResult;
      let beeResult;
      
      try {
        // Try Supabase functions first
        employeesResult = await getEmployees(sessionId);
        if (employeesResult.employees.length > 0) {
          beeResult = await calculateBEE(sessionId);
        }
      } catch (supabaseError) {
        console.log('Supabase functions not available, using mock functions:', supabaseError);
        
        // Fallback to mock functions
        employeesResult = await mockGetEmployees(sessionId);
        if (employeesResult.employees.length > 0) {
          beeResult = await mockCalculateBEEFromSession(sessionId);
        }
      }
      
      if (employeesResult.employees.length > 0) {
        setEmployees(employeesResult.employees);
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