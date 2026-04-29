import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-extension-token',
};

const MAX_CONTENT_LENGTH = 5000;
const MAX_SOURCE_LENGTH = 100;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Require shared secret token
    const expectedToken = Deno.env.get('EXTENSION_SECRET');
    if (!expectedToken) {
      console.error('EXTENSION_SECRET is not configured');
      return new Response(
        JSON.stringify({ error: 'Server misconfigured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    const providedToken = req.headers.get('x-extension-token');
    if (!providedToken || providedToken !== expectedToken) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let body: { content?: unknown; source?: unknown };
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { content, source } = body;

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length > MAX_CONTENT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Content must be ${MAX_CONTENT_LENGTH} characters or fewer` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let safeSource = 'Browser Extension';
    if (typeof source === 'string' && source.trim()) {
      safeSource = source.trim().slice(0, MAX_SOURCE_LENGTH);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('feedback_items')
      .insert({
        content: trimmedContent,
        source: safeSource,
        theme: 'Other',
        importance: 'medium',
        business_alignment: 3,
        cost_estimate: 'medium',
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save feedback' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Feedback saved:', data.id);
    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
