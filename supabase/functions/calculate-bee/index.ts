// @ts-ignore - Deno module resolution
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore - Deno module resolution  
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Declare Deno global for TypeScript
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Employee {
  race: string;
  gender: string;
  management_level: string;
}

interface BEEResult {
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
  disabilities: {
    total: number;
    blackDisabled: number;
    blackDisabledPercentage: number;
    target: number;
    points: number;
  };
  totalScore: number;
  maxScore: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { sessionId } = body;
    
    if (!sessionId) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing sessionId',
          code: 'MISSING_SESSION_ID',
          message: 'A valid session ID is required to calculate BEE scores'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (typeof sessionId !== 'string' || sessionId.trim().length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid sessionId format',
          code: 'INVALID_SESSION_ID',
          message: 'Session ID must be a non-empty string'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error',
          code: 'CONFIG_ERROR',
          message: 'Server is not properly configured'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch employees data for the session
    const { data: employees, error } = await supabase
      .from('employees')
      .select('race, gender, management_level')
      .eq('session_id', sessionId);

    if (error) {
      console.error('Database fetch error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch employee data',
          code: 'DATABASE_FETCH_ERROR',
          message: 'Unable to retrieve employee data from database',
          details: error.message
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!employees || employees.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No employee data found',
          code: 'NO_DATA_FOUND',
          message: 'No employee data found for this session. Please upload employee data first.',
          sessionId: sessionId
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate BEE scores based on BEE Generic Scorecard rules
    let result;
    try {
      result = calculateBEEScore(employees);
    } catch (calcError) {
      console.error('BEE calculation error:', calcError);
      return new Response(
        JSON.stringify({ 
          error: 'BEE calculation failed',
          code: 'CALCULATION_ERROR',
          message: 'Failed to calculate BEE scores',
          details: calcError instanceof Error ? calcError.message : 'Unknown calculation error'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        ...result,
        metadata: {
          employeeCount: employees.length,
          calculatedAt: new Date().toISOString(),
          sessionId: sessionId
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in calculate-bee function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function calculateBEEScore(employees: Employee[]): BEEResult {
  // Validate input
  if (!employees || !Array.isArray(employees) || employees.length === 0) {
    throw new Error('Invalid employee data: must be a non-empty array');
  }

  // Validate employee structure
  const invalidEmployees = employees.filter(emp => 
    !emp || 
    typeof emp.race !== 'string' || 
    typeof emp.gender !== 'string' || 
    typeof emp.management_level !== 'string'
  );
  
  if (invalidEmployees.length > 0) {
    console.warn(`Found ${invalidEmployees.length} employees with invalid data structure`);
  }

  // Separate employees by management level
  const senior = employees.filter(emp => emp.management_level === 'Senior');
  const middle = employees.filter(emp => emp.management_level === 'Middle');
  const junior = employees.filter(emp => emp.management_level === 'Junior');

  // Helper function to check if employee qualifies as black under B-BBEE
  // Must be African, Coloured, Indian, or Chinese (South African citizens)
  const isBlack = (race: string) => ['African', 'Coloured', 'Indian', 'Chinese'].includes(race);
  
  // Helper function to check if employee is black female
  const isBlackFemale = (race: string, gender: string) => 
    isBlack(race) && gender === 'Female';

  // Calculate points for each management level
  function calculateLevelPoints(
    levelEmployees: Employee[],
    blackThreshold1: number,
    blackThreshold2: number,
    blackFemaleThreshold: number
  ) {
    const total = levelEmployees.length;
    if (total === 0) return {
      total: 0,
      black: 0,
      blackFemale: 0,
      blackPercentage: 0,
      blackFemalePercentage: 0,
      blackPoints: 0,
      blackFemalePoints: 0,
      totalPoints: 0
    };

    const black = levelEmployees.filter(emp => isBlack(emp.race)).length;
    const blackFemale = levelEmployees.filter(emp => isBlackFemale(emp.race, emp.gender)).length;
    
    const blackPercentage = (black / total) * 100;
    const blackFemalePercentage = (blackFemale / total) * 100;

    // Calculate black representation points (0-2 points)
    let blackPoints = 0;
    if (blackPercentage >= blackThreshold1) blackPoints = 2;
    else if (blackPercentage >= blackThreshold2) blackPoints = 1;

    // Calculate black female points (0-1 points)
    const blackFemalePoints = blackFemalePercentage >= blackFemaleThreshold ? 1 : 0;

    return {
      total,
      black,
      blackFemale,
      blackPercentage: Math.round(blackPercentage * 100) / 100,
      blackFemalePercentage: Math.round(blackFemalePercentage * 100) / 100,
      blackPoints,
      blackFemalePoints,
      totalPoints: blackPoints + blackFemalePoints
    };
  }

  // Calculate scores for each level based on OFFICIAL B-BBEE Employment Equity scorecard
  // 4.3 Senior Management: 60% black (2 pts), 30% black female (1 pt) = 3 pts total
  const seniorManagement = calculateLevelPoints(senior, 60, 60, 30);  // 60% black, 30% black female
  
  // 4.4 Middle Management: 75% black (2 pts), 38% black female (1 pt) = 3 pts total  
  const middleManagement = calculateLevelPoints(middle, 75, 75, 38);  // 75% black, 38% black female
  
  // 4.5 Junior Management: 88% black (2 pts), 44% black female (1 pt) = 3 pts total
  const juniorManagement = calculateLevelPoints(junior, 88, 88, 44);  // 88% black, 44% black female

  // 4.6 Employees with disabilities: 2% black disabled (2 pts)
  const totalEmployees = employees.length;
  const disabledEmployees = employees.filter(emp => 
    emp.race && emp.race.toLowerCase().includes('disabled')
  );
  const blackDisabledEmployees = disabledEmployees.filter(emp => isBlack(emp.race));
  const blackDisabledPercentage = totalEmployees > 0 ? (blackDisabledEmployees.length / totalEmployees) * 100 : 0;
  const disabilityPoints = blackDisabledPercentage >= 2 ? 2 : 0;

  const totalScore = seniorManagement.totalPoints + middleManagement.totalPoints + juniorManagement.totalPoints + disabilityPoints;

  return {
    seniorManagement,
    middleManagement,
    juniorManagement,
    disabilities: {
      total: totalEmployees,
      blackDisabled: blackDisabledEmployees.length,
      blackDisabledPercentage: Math.round(blackDisabledPercentage * 100) / 100,
      target: 2,
      points: disabilityPoints
    },
    totalScore,
    maxScore: 11  // 3 + 3 + 3 + 2 = 11 points for Employment Equity
  };
}