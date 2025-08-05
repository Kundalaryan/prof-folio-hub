-- Update profiles table RLS policies to allow public viewing
DROP POLICY IF EXISTS "Admins can view their own profile" ON public.profiles;

-- Create policy to allow public viewing of profiles (for the hero section)
CREATE POLICY "Profiles are publicly viewable" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Keep the admin policies for managing profiles
CREATE POLICY "Admins can view and manage profiles" 
ON public.profiles 
FOR ALL 
USING (auth.uid() = user_id);