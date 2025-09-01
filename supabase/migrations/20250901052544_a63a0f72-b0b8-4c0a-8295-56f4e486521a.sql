-- Fix security warnings by setting proper search paths for functions

-- Update the students public function with secure search path
CREATE OR REPLACE FUNCTION public.get_students_public()
RETURNS TABLE (
  id uuid,
  name text,
  degree_level text,
  program text,
  year_started integer,
  graduation_year integer,
  research_area text,
  thesis_title text,
  status text,
  bio text,
  image_url text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT 
    s.id,
    s.name,
    s.degree_level,
    s.program,
    s.year_started,
    s.graduation_year,
    s.research_area,
    s.thesis_title,
    s.status,
    s.bio,
    s.image_url,
    s.created_at,
    s.updated_at
  FROM public.students s
  WHERE s.status IN ('ongoing', 'completed');
$$;

-- Update the profiles public function with secure search path
CREATE OR REPLACE FUNCTION public.get_profiles_public()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  full_name text,
  title text,
  department text,
  bio text,
  profile_image_url text,
  email_available text,
  phone_available text,
  office_available text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.full_name,
    p.title,
    p.department,
    p.bio,
    p.profile_image_url,
    CASE WHEN p.email IS NOT NULL THEN 'Available upon request' ELSE NULL END as email_available,
    CASE WHEN p.phone IS NOT NULL THEN 'Available upon request' ELSE NULL END as phone_available,
    CASE WHEN p.office_location IS NOT NULL THEN 'Available upon request' ELSE NULL END as office_available,
    p.created_at,
    p.updated_at
  FROM public.profiles p;
$$;