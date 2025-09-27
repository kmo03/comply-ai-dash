import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { csvData, sessionId } = await req.json();
    
    if (!csvData || !sessionId) {
      return new Response(
        JSON.stringify({ error: 'Missing csvData or sessionId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // OpenAI API call for data validation and standardization
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `
You are a data standardization tool for BEE compliance. Your job is to ONLY standardize the format of data that is explicitly provided - DO NOT make assumptions or inferences about missing data.

CSV Data to process:
${csvData}

CRITICAL RULES:
1. NEVER guess or infer race from names - only use the race data explicitly provided in the CSV
2. NEVER guess gender from names - only use the gender data explicitly provided in the CSV  
3. Only standardize the FORMAT of existing data, do not fill in missing data

Standardization rules (ONLY apply to explicitly provided data):
- Race formatting: "Black African" or "Black" → "African", "Coloured" stays "Coloured", "Indian" stays "Indian", "White" stays "White"
- Gender formatting: "M" → "Male", "F" → "Female", "Male/Female" stay as-is
- Management Level formatting: "Snr Manager" → "Senior", "Team Lead" → "Senior", "Manager" → "Middle", "Junior" stays "Junior"

If any field is empty, missing, or unclear in the original CSV, mark it as "Unknown" in warnings.

Return ONLY valid JSON (no markdown):
{
  "employees": [
    {
      "name": "John Doe",
      "race": "African", 
      "gender": "Male",
      "management_level": "Senior"
    }
  ],
  "warnings": [
    "Race field empty for Michael Chen - marked as Unknown",
    "Gender unclear for Jane Smith - marked as Unknown"
  ]
}
`;

    console.log('Calling OpenAI for CSV processing...');
    
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are a data processing expert for BEE compliance. Return only valid JSON without markdown formatting. Keep responses concise and focused only on the required data structure.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.1,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to process data with AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAIData = await openAIResponse.json();
    const aiResponseText = openAIData.choices[0].message.content;
    
    console.log('Raw AI response:', aiResponseText);

    // Parse the AI response
    let parsedData;
    try {
      // Clean the response in case it has markdown formatting
      const cleanedResponse = aiResponseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      parsedData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError, 'Raw response:', aiResponseText);
      return new Response(
        JSON.stringify({ error: 'Invalid AI response format' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store the processed data in Supabase
    if (parsedData.employees && parsedData.employees.length > 0) {
      const employeeRecords = parsedData.employees.map((employee: any) => ({
        session_id: sessionId,
        name: employee.name,
        race: employee.race,
        gender: employee.gender,
        management_level: employee.management_level,
      }));

      const { error: insertError } = await supabase
        .from('employees')
        .insert(employeeRecords);

      if (insertError) {
        console.error('Database insert error:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to store employee data' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        employees: parsedData.employees || [],
        warnings: parsedData.warnings || [],
        processedCount: parsedData.employees?.length || 0
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in upload-csv function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});