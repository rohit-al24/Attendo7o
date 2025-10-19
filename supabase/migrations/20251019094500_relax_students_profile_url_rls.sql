-- Allow anonymous users to update their own profile_url in students (for profile photo upload)
DROP POLICY IF EXISTS "Anon can update profile_url" ON public.students;
CREATE POLICY "Anon can update profile_url"
  ON public.students FOR UPDATE
  USING (true)
  WITH CHECK (true);