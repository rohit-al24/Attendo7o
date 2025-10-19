-- Align students table with optional columns used by the app.
-- This migration is defensive: it will not fail if the columns already exist.

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS password text;

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS profile_url text;
