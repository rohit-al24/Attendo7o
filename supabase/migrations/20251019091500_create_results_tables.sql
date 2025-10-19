-- Results tables for assessments and student marks
-- Creates: results_assessments, results_marks
-- Note: RLS is left disabled initially for ease of development.

CREATE TABLE IF NOT EXISTS public.results_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
  title text NOT NULL,
  assessment_type text NOT NULL, -- e.g., "Internal Test", "Unit Test", "Semester", "Class Test"
  subject text, -- optional subject name
  max_marks int NOT NULL DEFAULT 100,
  assessed_on date NOT NULL DEFAULT CURRENT_DATE,
  created_by_faculty_id uuid REFERENCES public.faculty(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.results_marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.results_assessments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  marks_obtained numeric(6,2) NOT NULL,
  grade text,
  remarks text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assessment_id, student_id)
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_results_assessments_class ON public.results_assessments(class_id);
CREATE INDEX IF NOT EXISTS idx_results_marks_assessment ON public.results_marks(assessment_id);
CREATE INDEX IF NOT EXISTS idx_results_marks_student ON public.results_marks(student_id);
