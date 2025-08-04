-- Update the check constraint for degree_level to include 'intern' instead of 'postdoc'
ALTER TABLE public.students 
DROP CONSTRAINT IF EXISTS students_degree_level_check;

ALTER TABLE public.students 
ADD CONSTRAINT students_degree_level_check 
CHECK (degree_level = ANY (ARRAY['undergraduate'::text, 'masters'::text, 'phd'::text, 'intern'::text]));

-- Update the check constraint for status to include new options
ALTER TABLE public.students 
DROP CONSTRAINT IF EXISTS students_status_check;

ALTER TABLE public.students 
ADD CONSTRAINT students_status_check 
CHECK (status = ANY (ARRAY['current'::text, 'graduated'::text, 'alumni'::text, 'completed'::text, 'ongoing'::text]));

-- Create publications table
CREATE TABLE public.publications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  authors TEXT NOT NULL,
  journal TEXT,
  year INTEGER,
  doi TEXT,
  url TEXT,
  abstract TEXT,
  citation_count INTEGER DEFAULT 0,
  publication_type TEXT DEFAULT 'journal',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Publications are publicly viewable" 
ON public.publications 
FOR SELECT 
USING (true);

CREATE POLICY "Only authenticated users can manage publications" 
ON public.publications 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Add trigger for timestamps
CREATE TRIGGER update_publications_updated_at
BEFORE UPDATE ON public.publications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();