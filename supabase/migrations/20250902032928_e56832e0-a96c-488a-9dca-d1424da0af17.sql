-- Create rate limiting table for contact form
CREATE TABLE public.contact_rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address inet NOT NULL,
  submission_count integer NOT NULL DEFAULT 1,
  window_start timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_rate_limits ENABLE ROW LEVEL SECURITY;

-- Create index for efficient lookups
CREATE INDEX idx_contact_rate_limits_ip_window ON public.contact_rate_limits(ip_address, window_start);

-- Create trigger for updated_at
CREATE TRIGGER update_contact_rate_limits_updated_at
  BEFORE UPDATE ON public.contact_rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to clean up old rate limit records (older than 1 hour)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.contact_rate_limits 
  WHERE window_start < now() - interval '1 hour';
$$;