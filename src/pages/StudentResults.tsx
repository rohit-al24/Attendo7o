import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, FileBarChart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const StudentResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stateStudent = (location.state as any)?.student;
  const student = useMemo(() => {
    if (stateStudent) return stateStudent;
    try {
      const str = sessionStorage.getItem("student");
      return str ? JSON.parse(str) : null;
    } catch {
      return null;
    }
  }, [stateStudent]);

  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate("/student-login");
      }
    });
  }, [navigate]);

  useEffect(() => {
    if (!student) {
      navigate('/student-login');
      return;
    }
    const load = async () => {
      const sb: any = supabase;
      const { data } = await sb
        .from('results_marks')
        .select('marks_obtained, grade, remarks, assessment:assessment_id(title, assessment_type, subject, max_marks, assessed_on)')
        .eq('student_id', student.id)
        .order('created_at', { ascending: false });
      setRows((data || []).map((r: any) => ({
        title: r.assessment?.title,
        type: r.assessment?.assessment_type,
        subject: r.assessment?.subject,
        date: r.assessment?.assessed_on,
        max: r.assessment?.max_marks,
        marks: r.marks_obtained,
        grade: r.grade,
        remarks: r.remarks,
      })));
    };
    load();
  }, [student, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-secondary rounded-lg flex items-center justify-center">
              <FileBarChart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Results</h1>
            </div>
          </div>
          <Button variant="ghost" onClick={() => navigate('/login-selection')}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-4">
        <Card className="p-4 shadow-medium overflow-x-auto">
          <table className="w-full text-left min-w-[720px]">
            <thead>
              <tr className="text-sm text-muted-foreground">
                <th className="py-2">Title</th>
                <th>Type</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Marks</th>
                <th>Grade</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="py-2 font-medium">{r.title}</td>
                  <td>{r.type}</td>
                  <td>{r.subject}</td>
                  <td>{r.date}</td>
                  <td>{r.marks} / {r.max}</td>
                  <td>{r.grade || '-'}</td>
                  <td>{r.remarks || '-'}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-muted-foreground">No results published yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </main>
    </div>
  );
};

export default StudentResults;
