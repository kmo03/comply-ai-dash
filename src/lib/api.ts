import { supabase } from "@/integrations/supabase/client";

export interface Employee {
  id?: number;
  name: string;
  race: string;
  gender: string;
  management_level: string;
  created_at?: string;
}

export interface BEECalculationResult {
  seniorManagement: {
    total: number;
    black: number;
    blackFemale: number;
    blackPercentage: number;
    blackFemalePercentage: number;
    blackPoints: number;
    blackFemalePoints: number;
    totalPoints: number;
  };
  middleManagement: {
    total: number;
    black: number;
    blackFemale: number;
    blackPercentage: number;
    blackFemalePercentage: number;
    blackPoints: number;
    blackFemalePoints: number;
    totalPoints: number;
  };
  juniorManagement: {
    total: number;
    black: number;
    blackFemale: number;
    blackPercentage: number;
    blackFemalePercentage: number;
    blackPoints: number;
    blackFemalePoints: number;
    totalPoints: number;
  };
  totalScore: number;
  maxScore: number;
}

export interface AIBEEAnalysisResult {
  senior_management: {
    total_employees: number;
    black_employees: number;
    black_female_employees: number;
    black_percentage: number;
    black_target: number;
    black_met_target: boolean;
    black_points: number;
    black_female_percentage: number;
    black_female_target: number;
    black_female_met_target: boolean;
    black_female_points: number;
    level_total_points: number;
  };
  middle_management: {
    total_employees: number;
    black_employees: number;
    black_female_employees: number;
    black_percentage: number;
    black_target: number;
    black_met_target: boolean;
    black_points: number;
    black_female_percentage: number;
    black_female_target: number;
    black_female_met_target: boolean;
    black_female_points: number;
    level_total_points: number;
  };
  junior_management: {
    total_employees: number;
    black_employees: number;
    black_female_employees: number;
    black_percentage: number;
    black_target: number;
    black_met_target: boolean;
    black_points: number;
    black_female_percentage: number;
    black_female_target: number;
    black_female_met_target: boolean;
    black_female_points: number;
    level_total_points: number;
  };
  total_points: number;
  max_points: number;
  compliance_status: string;
}

export interface UploadResponse {
  success: boolean;
  employees: Employee[];
  warnings: string[];
  processedCount: number;
}

export interface EmployeesResponse {
  success: boolean;
  employees: Employee[];
  count: number;
}

// Upload CSV file and process with AI
export async function uploadCSV(csvData: string, sessionId: string): Promise<UploadResponse> {
  const { data, error } = await supabase.functions.invoke('upload-csv', {
    body: { csvData, sessionId }
  });

  if (error) {
    throw new Error(error.message || "Failed to upload CSV");
  }

  return data;
}

// Calculate BEE scores
export async function calculateBEE(sessionId: string): Promise<BEECalculationResult> {
  const { data, error } = await supabase.functions.invoke('calculate-bee', {
    body: { sessionId }
  });

  if (error) {
    throw new Error(error.message || "Failed to calculate BEE scores");
  }

  return data;
}

// Calculate BEE scores with AI analysis
export async function calculateBEEWithAI(sessionId: string): Promise<AIBEEAnalysisResult> {
  const { data, error } = await supabase.functions.invoke('ai-bee-analysis', {
    body: { sessionId }
  });

  if (error) {
    throw new Error(error.message || "Failed to calculate BEE scores with AI");
  }

  if (!data.success) {
    throw new Error(data.error || "AI analysis failed");
  }

  return data.analysis;
}

// Get employees for a session
export async function getEmployees(sessionId: string): Promise<EmployeesResponse> {
  const { data, error } = await supabase.functions.invoke(`get-employees/${sessionId}`, {});

  if (error) {
    throw new Error(error.message || "Failed to get employees");
  }

  return data;
}

// Parse CSV content
export function parseCSV(csvContent: string): string[][] {
  const lines = csvContent.trim().split('\n');
  return lines.map(line => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  });
}

// Generate session ID
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}