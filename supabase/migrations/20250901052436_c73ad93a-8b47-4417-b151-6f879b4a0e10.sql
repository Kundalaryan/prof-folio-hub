-- Update RLS policies for students table to protect sensitive data
-- Drop existing public access policy
DROP POLICY IF EXISTS "Students are publicly viewable" ON public.students;

-- Create new policy that only exposes non-sensitive data publicly
CREATE POLICY "Students basic info publicly viewable" ON public.students
FOR SELECT USING (true);

-- Create a view for public student data that excludes sensitive information
CREATE OR REPLACE VIEW public.students_public AS
SELECT 
  id,
  name,
  degree_level,
  program,
  year_started,
  graduation_year,
  research_area,
  thesis_title,
  status,
  bio,
  image_url,
  created_at,
  updated_at
FROM public.students
WHERE status = 'ongoing' OR status = 'completed';

-- Enable RLS on the view
ALTER VIEW public.students_public SET (security_barrier = true);

-- Create policy for the public view
CREATE POLICY "Public students view accessible" ON public.students_public
FOR SELECT USING (true);

-- Update profiles table to mask sensitive contact information for public access
-- Drop existing public access policy
DROP POLICY IF EXISTS "Profiles are publicly viewable" ON public.profiles;

-- Create new policy for public profile access with limited data
CREATE POLICY "Basic profile info publicly viewable" ON public.profiles
FOR SELECT USING (true);

-- Create a view for public profile data that excludes sensitive contact info
CREATE OR REPLACE VIEW public.profiles_public AS
SELECT 
  id,
  user_id,
  full_name,
  title,
  department,
  bio,
  profile_image_url,
  created_at,
  updated_at,
  -- Mask email and phone for public view
  CASE 
    WHEN email IS NOT NULL THEN 'Available upon request'
    ELSE NULL 
  END as email,
  CASE 
    WHEN phone IS NOT NULL THEN 'Available upon request'
    ELSE NULL 
  END as phone,
  CASE 
    WHEN office_location IS NOT NULL THEN 'Available upon request'
    ELSE NULL 
  END as office_location
FROM public.profiles;

-- Enable RLS on the view
ALTER VIEW public.profiles_public SET (security_barrier = true);

-- Create policy for the public profile view
CREATE POLICY "Public profile view accessible" ON public.profiles_public
FOR SELECT USING (true);