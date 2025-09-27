import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
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

    // Prepare employee data for AI analysis
    const employeeData = employees.map(emp => ({
      race: emp.race,
      gender: emp.gender,
      management_level: emp.management_level
    }));

    const systemPrompt = `You are a strict B-BBEE Employment Equity calculator. Analyze employee data and calculate scores EXACTLY according to the official scorecard rules.

SCORECARD RULES:
- Each criterion is BINARY: Award points ONLY if target percentage is met or exceeded
- NO partial points for being close to targets
- Use EXACT percentages from calculations
- Management levels: Senior, Middle, Junior, Executive
- Black includes: Black African, African, Black, Coloured, Indian, Chinese

TARGETS:
Senior Management: Black ≥60% (2pts), Black Female ≥30% (1pt)
Middle Management: Black ≥75% (2pts), Black Female ≥38% (1pt)  
Junior Management: Black ≥88% (2pts), Black Female ≥44% (1pt)
Employees with Disabilities: Black ≥2% (2pts)

CALCULATION METHOD:
1. Count total employees in each management level
2. Count Black employees in each level (African, Coloured, Indian, Chinese)
3. Count Black Female employees in each level
4. Calculate percentages: (Black in level / Total in level) × 100
5. Award points ONLY if percentage ≥ target (use binary logic: points = target_met ? max_points : 0)

RESPONSE FORMAT (JSON only):
{
  "senior_management": {
    "total_employees": 18,
    "black_employees": 10,
    "black_female_employees": 5,
    "black_percentage": 55.6,
    "black_target": 60,
    "black_met_target": false,
    "black_points": 0,
    "black_female_percentage": 27.8, 
    "black_female_target": 30,
    "black_female_met_target": false,
    "black_female_points": 0,
    "level_total_points": 0
  },
  "middle_management": {
    "total_employees": 25,
    "black_employees": 11,
    "black_female_employees": 8,
    "black_percentage": 44.0,
    "black_target": 75,
    "black_met_target": false,
    "black_points": 0,
    "black_female_percentage": 32.0,
    "black_female_target": 38,
    "black_female_met_target": false,
    "black_female_points": 0,
    "level_total_points": 0
  },
  "junior_management": {
    "total_employees": 56,
    "black_employees": 48,
    "black_female_employees": 25,
    "black_percentage": 85.7,
    "black_target": 88,
    "black_met_target": false,
    "black_points": 0,
    "black_female_percentage": 44.6,
    "black_female_target": 44,
    "black_female_met_target": true,
    "black_female_points": 1,
    "level_total_points": 1
  },
  "total_points": 1,
  "max_points": 9,
  "compliance_status": "Non-Compliant"
}`;

    console.log('Calling OpenAI with employee data:', JSON.stringify(employeeData));

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
            content: `Analyze this employee data for B-BBEE Employment Equity compliance. Calculate exact percentages and award points using binary logic only. Employee data: ${JSON.stringify(employeeData)}` 
          }
        ],
        max_tokens: 2000,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'OpenAI API request failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('OpenAI response:', JSON.stringify(data));

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid OpenAI response structure:', data);
      return new Response(
        JSON.stringify({ error: 'Invalid AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiAnalysis = data.choices[0].message.content;
    
    try {
      // Parse the JSON response from AI
      const analysisResult = JSON.parse(aiAnalysis);
      
      return new Response(
        JSON.stringify({
          success: true,
          analysis: analysisResult,
          employee_count: employees.length
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('AI response was:', aiAnalysis);
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse AI analysis',
          raw_response: aiAnalysis 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error in ai-bee-analysis function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});