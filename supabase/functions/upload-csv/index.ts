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

    // Parse CSV data into rows
    const rows = csvData.trim().split('\n');
    const headers = rows[0].split(',').map((h: string) => h.replace(/"/g, '').trim());
    const dataRows = rows.slice(1);

    console.log(`Processing ${dataRows.length} employee records...`);

    // Process data locally for better reliability with large files
    const processedEmployees: any[] = [];
    const warnings: string[] = [];

    // Helper functions for data standardization
    const standardizeRace = (race: string): string => {
      if (!race || race.trim() === '') return 'Unknown';
      const normalized = race.toLowerCase().trim();
      if (normalized.includes('black') || normalized === 'african') return 'African';
      if (normalized === 'coloured') return 'Coloured';
      if (normalized === 'indian') return 'Indian';
      if (normalized === 'chinese') return 'Chinese';
      if (normalized === 'white') return 'White';
      if (normalized === 'asian' && !normalized.includes('chinese')) return 'Asian';
      return race; // Keep original if not in standard categories
    };

    const standardizeGender = (gender: string): string => {
      if (!gender || gender.trim() === '') return 'Unknown';
      const normalized = gender.toLowerCase().trim();
      if (normalized === 'm' || normalized === 'male') return 'Male';
      if (normalized === 'f' || normalized === 'female') return 'Female';
      return gender; // Keep original if already standardized
    };

    const standardizeManagementLevel = (level: string): string => {
      if (!level || level.trim() === '') return 'Unknown';
      const normalized = level.toLowerCase().trim();
      if (normalized.includes('senior') || normalized.includes('snr') || normalized.includes('team lead')) return 'Senior';
      if (normalized.includes('middle') || normalized === 'manager') return 'Middle';
      if (normalized.includes('junior')) return 'Junior';
      return level; // Keep original if already standardized
    };

    // Process each row
    for (let i = 0; i < dataRows.length; i++) {
      try {
        const row = dataRows[i];
        if (!row.trim()) continue; // Skip empty rows

        // Simple CSV parsing (handles basic cases)
        const values: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let char of row) {
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim()); // Add the last value

        // Map values to expected structure
        const nameIndex = headers.findIndex((h: string) => h.toLowerCase().includes('name'));
        const raceIndex = headers.findIndex((h: string) => h.toLowerCase().includes('race'));
        const genderIndex = headers.findIndex((h: string) => h.toLowerCase().includes('gender'));
        const levelIndex = headers.findIndex((h: string) => h.toLowerCase().includes('management') || h.toLowerCase().includes('level'));

        const name = values[nameIndex] || `Employee ${i + 1}`;
        const rawRace = values[raceIndex] || '';
        const rawGender = values[genderIndex] || '';
        const rawLevel = values[levelIndex] || '';

        const employee = {
          name: name.replace(/"/g, ''),
          race: standardizeRace(rawRace.replace(/"/g, '')),
          gender: standardizeGender(rawGender.replace(/"/g, '')),
          management_level: standardizeManagementLevel(rawLevel.replace(/"/g, ''))
        };

        // Add warnings for missing data
        if (!rawRace.trim()) warnings.push(`Race field empty for ${employee.name}`);
        if (!rawGender.trim()) warnings.push(`Gender field empty for ${employee.name}`);
        if (!rawLevel.trim()) warnings.push(`Management level field empty for ${employee.name}`);

        processedEmployees.push(employee);
      } catch (rowError) {
        console.error(`Error processing row ${i + 1}:`, rowError);
        warnings.push(`Failed to process row ${i + 1}`);
      }
    }

    const parsedData = {
      employees: processedEmployees,
      warnings: warnings
    };

    console.log(`Successfully processed ${processedEmployees.length} employees with ${warnings.length} warnings`);

    // Store the processed data in Supabase
    if (parsedData.employees && parsedData.employees.length > 0) {
      // First, delete existing records for this session
      const { error: deleteError } = await supabase
        .from('employees')
        .delete()
        .eq('session_id', sessionId);

      if (deleteError) {
        console.error('Database delete error:', deleteError);
        return new Response(
          JSON.stringify({ error: 'Failed to clear existing employee data' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

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