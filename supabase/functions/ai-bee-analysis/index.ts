import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Standardization functions (local, reliable)
function standardizeRace(race) {
  if (!race) return 'Other';
  const blackRaces = ['african', 'black african', 'black', 'coloured', 'indian', 'chinese'];
  return blackRaces.includes(race.toLowerCase()) ? 'Black' : 'Other';
}

function standardizeGender(gender) {
  if (!gender) return 'Male';
  return gender.toLowerCase().startsWith('f') ? 'Female' : 'Male';
}

function standardizeManagementLevel(level) {
  if (!level) return 'Junior';
  const levelLower = level.toLowerCase();
  if (levelLower.includes('senior') || levelLower.includes('exec') || levelLower === 'executive') return 'Senior';
  if (levelLower.includes('middle') || levelLower.includes('mid')) return 'Middle';
  if (levelLower.includes('junior') || levelLower.includes('jr')) return 'Junior';
  return 'Junior';
}

// Core calculation logic (local, reliable)
function calculateBEECompliance(employees) {
  // First, standardize the data locally
  const standardizedEmployees = employees.map(emp => ({
    race: standardizeRace(emp.race),
    gender: standardizeGender(emp.gender),
    management_level: standardizeManagementLevel(emp.management_level)
  }));

  // Count employees by management level
  const levels = ['Senior', 'Middle', 'Junior'];
  const counts = {};
  
  levels.forEach(level => {
    const levelEmployees = standardizedEmployees.filter(emp => emp.management_level === level);
    const total = levelEmployees.length;
    const blackEmployees = levelEmployees.filter(emp => emp.race === 'Black');
    const blackFemaleEmployees = blackEmployees.filter(emp => emp.gender === 'Female');
    
    const blackPercentage = total > 0 ? (blackEmployees.length / total) * 100 : 0;
    const blackFemalePercentage = total > 0 ? (blackFemaleEmployees.length / total) * 100 : 0;
    
    counts[level.toLowerCase() + '_management'] = {
      total_employees: total,
      black_employees: blackEmployees.length,
      black_female_employees: blackFemaleEmployees.length,
      black_percentage: parseFloat(blackPercentage.toFixed(1)),
      black_female_percentage: parseFloat(blackFemalePercentage.toFixed(1))
    };
  });

  // Apply STRICT BINARY scoring with >= (FIXED: was using > instead of >=)
  const targets = {
    senior_management: { black: 60, black_female: 30, black_points: 2, black_female_points: 1 },
    middle_management: { black: 75, black_female: 38, black_points: 2, black_female_points: 1 },
    junior_management: { black: 88, black_female: 44, black_points: 2, black_female_points: 1 }
  };

  let totalPoints = 0;
  const results = {};

  Object.keys(counts).forEach(level => {
    const data = counts[level];
    const target = targets[level];
    
    if (target) {
      // FIXED: Using >= instead of >
      const blackPoints = data.black_percentage >= target.black ? target.black_points : 0;
      const blackFemalePoints = data.black_female_percentage >= target.black_female ? target.black_female_points : 0;
      const levelTotalPoints = blackPoints + blackFemalePoints;
      
      results[level] = {
        ...data,
        black_target: target.black,
        black_met_target: data.black_percentage >= target.black,
        black_points: blackPoints,
        black_female_target: target.black_female,
        black_female_met_target: data.black_female_percentage >= target.black_female,
        black_female_points: blackFemalePoints,
        level_total_points: levelTotalPoints
      };
      
      totalPoints += levelTotalPoints;
    }
  });

  // Calculate disabilities
  const disabilityData = {
    total_employees: standardizedEmployees.length,
    black_disabled_employees: 0,
    black_disabled_percentage: 0,
    black_disabled_target: 2,
    black_disabled_met_target: false,
    black_disabled_points: 0
  };

  // Check for disabled employees
  const disabledEmployees = standardizedEmployees.filter(emp => 
    emp.original_race && emp.original_race.toLowerCase().includes('disabled')
  );
  if (disabledEmployees.length > 0) {
    const blackDisabled = disabledEmployees.filter(emp => emp.race === 'Black').length;
    disabilityData.black_disabled_employees = blackDisabled;
    disabilityData.black_disabled_percentage = (blackDisabled / standardizedEmployees.length) * 100;
    disabilityData.black_disabled_met_target = disabilityData.black_disabled_percentage >= 2; // FIXED: >=
    disabilityData.black_disabled_points = disabilityData.black_disabled_met_target ? 2 : 0;
  }

  totalPoints += disabilityData.black_disabled_points;

  return {
    ...results,
    disabilities: disabilityData,
    total_points: totalPoints,
    max_points: 11,
    compliance_status: totalPoints >= 8 ? 'Compliant' : 'Non-Compliant',
    employee_count: standardizedEmployees.length
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId, includeAIInsights = false } = await req.json();
    
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

    // Fetch employees data
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

    // Calculate BEE compliance LOCALLY (reliable)
    const complianceResults = calculateBEECompliance(employees);

    let aiInsights = null;

    // Optional: Get AI insights for recommendations only
    if (includeAIInsights && openAIApiKey) {
      try {
        const systemPrompt = `You are a B-BBEE compliance expert. Analyze the calculated scores and provide strategic insights for improvement. Focus on recommendations, not calculations. Be specific and actionable.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { 
                role: 'user', 
                content: `Based on these B-BBEE Employment Equity results, provide specific recommendations for improvement. Focus on which areas need the most attention and practical steps to achieve compliance. Results: ${JSON.stringify(complianceResults)}` 
              }
            ],
            max_tokens: 1000,
            temperature: 0.3,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          aiInsights = data.choices[0]?.message?.content || null;
        }
      } catch (aiError) {
        console.error('AI insights failed, but continuing with local results:', aiError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis: complianceResults,
        ai_insights: aiInsights,
        calculated_locally: true,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in ai-bee-analysis function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});