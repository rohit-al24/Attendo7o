-- Create a public storage bucket for student profile photos (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'student-avatars'
  ) THEN
    PERFORM storage.create_bucket('student-avatars', public => true);
  END IF;
END $$;

-- Relaxed policies to allow public read and anonymous upload/update
-- Drop if exists to be idempotent
DROP POLICY IF EXISTS "Public read student avatars" ON storage.objects;
CREATE POLICY "Public read student avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'student-avatars');

DROP POLICY IF EXISTS "Anon upload student avatars" ON storage.objects;
CREATE POLICY "Anon upload student avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'student-avatars');

DROP POLICY IF EXISTS "Anon update student avatars" ON storage.objects;
CREATE POLICY "Anon update student avatars"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'student-avatars')
  WITH CHECK (bucket_id = 'student-avatars');
