-- Add RLS policies for contact_rate_limits table
CREATE POLICY "System can manage rate limits" 
ON public.contact_rate_limits 
FOR ALL 
USING (true);