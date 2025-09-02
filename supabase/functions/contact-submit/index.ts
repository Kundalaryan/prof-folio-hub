import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { name, email, subject, message } = await req.json();

    // Get client IP address
    const clientIP = req.headers.get('cf-connecting-ip') || 
                    req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    'unknown';

    console.log('Rate limiting check for IP:', clientIP);

    // Check rate limit (5 submissions per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: rateLimitData, error: rateLimitError } = await supabase
      .from('contact_rate_limits')
      .select('submission_count')
      .eq('ip_address', clientIP)
      .gte('window_start', oneHourAgo)
      .single();

    if (rateLimitError && rateLimitError.code !== 'PGRST116') {
      console.error('Rate limit check error:', rateLimitError);
      throw new Error('Rate limit check failed');
    }

    // If user has exceeded rate limit
    if (rateLimitData && rateLimitData.submission_count >= 5) {
      console.log('Rate limit exceeded for IP:', clientIP);
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please wait before submitting again.',
          rateLimited: true 
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Update or insert rate limit record
    if (rateLimitData) {
      // Update existing record
      const { error: updateError } = await supabase
        .from('contact_rate_limits')
        .update({ submission_count: rateLimitData.submission_count + 1 })
        .eq('ip_address', clientIP)
        .gte('window_start', oneHourAgo);

      if (updateError) {
        console.error('Rate limit update error:', updateError);
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('contact_rate_limits')
        .insert({
          ip_address: clientIP,
          submission_count: 1,
          window_start: new Date().toISOString()
        });

      if (insertError) {
        console.error('Rate limit insert error:', insertError);
      }
    }

    // Insert the message
    const { error: messageError } = await supabase
      .from('messages')
      .insert({
        name,
        email,
        subject,
        message
      });

    if (messageError) {
      console.error('Message insert error:', messageError);
      throw new Error('Failed to submit message');
    }

    // Clean up old rate limit records periodically
    await supabase.rpc('cleanup_old_rate_limits');

    console.log('Message submitted successfully for IP:', clientIP);

    return new Response(
      JSON.stringify({ success: true, message: 'Message sent successfully!' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in contact-submit function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send message. Please try again.' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});