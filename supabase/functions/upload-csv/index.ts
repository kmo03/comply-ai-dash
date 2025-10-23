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
