import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, FileBarChart, LogOut } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type StudentRow = { id: string; full_name: string; roll_number: string; marks?: string };

const PublishResults = () => {
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState<any>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Class Test");
  const [subject, setSubject] = useState("");
  const [max, setMax] = useState<number>(100);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate("/faculty-login");
      }
    });
  }, [navigate]);

  useEffect(() => {
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (!userId) return;
      const { data: fac } = await supabase
        .from('faculty')
        .select('id, full_name, advisor_class_id')
        .eq('user_id', userId)
        .single();
      setFaculty(fac);
      if (fac?.advisor_class_id) {
        const { data: studs } = await supabase
          .from('students')
          .select('id, full_name, roll_number')
          .eq('class_id', fac.advisor_class_id)
          .order('roll_number');
        setStudents((studs || []).map((s: any) => ({ id: s.id, full_name: s.full_name, roll_number: s.roll_number })));
      }
    };
    load();
  }, []);

  const handlePublish = async () => {
    if (!faculty?.advisor_class_id || !title) return;
    setSaving(true);
    // Create assessment
    const sb: any = supabase;
    const { data: assess, error: aerr } = await sb
      .from('results_assessments')
      .insert({
        class_id: faculty.advisor_class_id,
        title,
        assessment_type: type,
        subject: subject || null,
        max_marks: max,
        assessed_on: date,
        created_by_faculty_id: faculty.id
      })
      .select('*')
      .single();
    if (!assess) {
      setSaving(false);
      return;
    }
    // Insert marks
    const rows = students
      .filter((s) => s.marks !== undefined && s.marks !== "")
      .map((s) => ({ assessment_id: assess.id, student_id: s.id, marks_obtained: Number(s.marks) }));
    if (rows.length > 0) {
      await sb.from('results_marks').upsert(rows, { onConflict: 'assessment_id,student_id' });
    }
    setSaving(false);
    navigate('/faculty-dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-secondary rounded-lg flex items-center justify-center">
              <FileBarChart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Publish Results</h1>
              <p className="text-sm text-muted-foreground">Enter marks for your class</p>
            </div>
          </div>
          <Button variant="ghost" onClick={() => navigate('/login-selection')}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <Card className="p-4 sm:p-6 shadow-medium space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Unit Test 1" />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="Class Test / Internal" />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., DBMS" />
            </div>
            <div className="space-y-2">
              <Label>Max Marks</Label>
              <Input type="number" value={max} onChange={(e) => setMax(Number(e.target.value || 0))} />
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 shadow-medium overflow-x-auto">
          <table className="w-full min-w-[680px]">
            <thead>
              <tr className="text-left text-sm text-muted-foreground">
                <th className="py-2">Roll No</th>
                <th>Name</th>
                <th>Marks</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="py-2 font-medium">{s.roll_number}</td>
                  <td>{s.full_name}</td>
                  <td>
                    <Input
                      type="number"
                      className="w-24"
                      value={s.marks ?? ""}
                      onChange={(e) => setStudents((prev) => prev.map((p) => p.id === s.id ? { ...p, marks: e.target.value } : p))}
                    />
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-muted-foreground">No students found for your class.</td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        <div className="flex justify-end">
          <Button className="h-11 px-6" onClick={handlePublish} disabled={saving || !title}>
            {saving ? 'Publishing...' : 'Publish Results'}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default PublishResults;
