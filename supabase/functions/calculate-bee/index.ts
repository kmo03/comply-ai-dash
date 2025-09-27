import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  totalScore: number;
  maxScore: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId } = await req.json();
    
    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: 'Missing sessionId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch employees data for the session
    const { data: employees, error } = await supabase
      .from('employees')
      .select('race, gender, management_level')
      .eq('session_id', sessionId);

    if (error) {
      console.error('Database fetch error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch employee data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!employees || employees.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No employee data found for this session' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate BEE scores based on BEE Generic Scorecard rules
    const result = calculateBEEScore(employees);

    return new Response(
      JSON.stringify(result),
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
  // Separate employees by management level
  const senior = employees.filter(emp => emp.management_level === 'Senior');
  const middle = employees.filter(emp => emp.management_level === 'Middle');
  const junior = employees.filter(emp => emp.management_level === 'Junior');

  // Helper function to check if employee is black (African, Coloured, or Indian)
  const isBlack = (race: string) => ['African', 'Coloured', 'Indian'].includes(race);
  
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

  // Calculate scores for each level based on BEE Generic Scorecard
  const seniorManagement = calculateLevelPoints(senior, 60, 40, 30);  // 60%/40%, 30%
  const middleManagement = calculateLevelPoints(middle, 75, 50, 38);  // 75%/50%, 38%
  const juniorManagement = calculateLevelPoints(junior, 88, 60, 44);  // 88%/60%, 44%

  const totalScore = seniorManagement.totalPoints + middleManagement.totalPoints + juniorManagement.totalPoints;

  return {
    seniorManagement,
    middleManagement,
    juniorManagement,
    totalScore,
    maxScore: 11  // 3 + 3 + 3 + 2 points for other elements (not calculated here)
  };
}