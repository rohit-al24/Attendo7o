import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Schema (Supabase table suggestion):
// Table: results
// Columns:
// - id: uuid (pk)
// - student_id: uuid (ref students.id)
// - exam_type: text (e.g., "Semester Exam", "Class Test")
// - subject: text
// - marks: numeric
// - max_marks: numeric
// - term: text (e.g., "Nov 2025", "CT-1")
// - published_by: uuid (faculty.id)
// - created_at: timestamptz default now()

export default function PublishResults() {
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    student_id: "",
    exam_type: "",
    subject: "",
    marks: "",
    max_marks: "100",
    term: "",
  });

  const canSubmit = useMemo(() => {
    return !!(form.student_id && form.exam_type && form.subject && form.marks && form.max_marks);
  }, [form]);

  useEffect(() => {
    // Check faculty session and load advisor class students
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        navigate("/faculty-login");
        return;
      }
      const { data: fac } = await supabase
        .from("faculty")
        .select("id, is_class_advisor, advisor_class_id")
        .eq("user_id", data.session.user.id)
        .single();
      if (!fac?.is_class_advisor || !fac?.advisor_class_id) {
        toast.error("You must be a class advisor to publish results");
        navigate("/faculty-dashboard");
        return;
      }
      setFaculty(fac);
      // Fetch students in advisor class
      const { data: studs, error } = await supabase
        .from("students")
        .select("id, full_name, roll_number")
        .eq("class_id", fac.advisor_class_id)
        .order("roll_number", { ascending: true });
      if (error) {
        toast.error("Failed to load students");
      }
      setStudents(studs || []);
    });
  }, [navigate]);

  const handlePublish = async () => {
    if (!canSubmit) return;
    setLoading(true);
    const payload = {
      student_id: form.student_id,
      exam_type: form.exam_type,
      subject: form.subject,
      marks: Number(form.marks),
      max_marks: Number(form.max_marks || 100),
      term: form.term || null,
      published_by: faculty?.id || null,
    };
    const { error } = await (supabase as any)
      .from("results")
      .insert(payload);
    setLoading(false);
    if (error) {
      toast.error("Failed to publish result");
      return;
    }
    toast.success("Result published");
    setForm({ student_id: "", exam_type: "", subject: "", marks: "", max_marks: "100", term: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Publish Results</h1>
          <Button variant="ghost" onClick={() => navigate("/faculty-dashboard")}>Back</Button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Card className="p-6 max-w-2xl mx-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Student</Label>
              <Select value={form.student_id} onValueChange={(v) => setForm(f => ({ ...f, student_id: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.roll_number} - {s.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Exam Type</Label>
              <Select value={form.exam_type} onValueChange={(v) => setForm(f => ({ ...f, exam_type: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semester Exam">Semester Exam</SelectItem>
                  <SelectItem value="Class Test">Class Test</SelectItem>
                  <SelectItem value="Internal Assessment">Internal Assessment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject</Label>
              <Input value={form.subject} onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="e.g., Mathematics" />
            </div>
            <div>
              <Label>Term/Label</Label>
              <Input value={form.term} onChange={(e) => setForm(f => ({ ...f, term: e.target.value }))} placeholder="e.g., Nov 2025 / CT-1" />
            </div>
            <div>
              <Label>Marks</Label>
              <Input type="number" value={form.marks} onChange={(e) => setForm(f => ({ ...f, marks: e.target.value }))} placeholder="e.g., 78" />
            </div>
            <div>
              <Label>Max Marks</Label>
              <Input type="number" value={form.max_marks} onChange={(e) => setForm(f => ({ ...f, max_marks: e.target.value }))} placeholder="e.g., 100" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button disabled={!canSubmit || loading} onClick={handlePublish}>
              {loading ? "Publishing..." : "Publish Result"}
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
}
