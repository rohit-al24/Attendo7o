import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export default function StudentResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialStudent = (location.state as any)?.student;
  const [student, setStudent] = useState<any>(initialStudent || null);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (!student) {
      try {
        const stored = localStorage.getItem('studentSession');
        if (stored) setStudent(JSON.parse(stored));
        else navigate('/student-login');
      } catch {
        navigate('/student-login');
      }
    }
  }, [student, navigate]);

  useEffect(() => {
    if (!student) return;
    (async () => {
      const { data, error } = await (supabase as any)
        .from('results')
        .select('id, exam_type, subject, marks, max_marks, term, created_at')
        .eq('student_id', student.id)
        .order('created_at', { ascending: false });
      if (!error) setResults(data || []);
    })();
  }, [student]);

  const grouped = useMemo(() => {
    const g: Record<string, any[]> = {};
    for (const r of results) {
      const key = `${r.term || ''}-${r.exam_type}`;
      g[key] = g[key] || [];
      g[key].push(r);
    }
    return g;
  }, [results]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Results</h1>
          <button className="text-sm underline" onClick={() => navigate('/student-dashboard')}>Back</button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 space-y-6">
        {!results.length ? (
          <Card className="p-6 text-center">No results published yet.</Card>
        ) : (
          Object.entries(grouped).map(([group, items]) => (
            <Card key={group} className="p-6 space-y-2">
              <div className="font-bold text-lg">{items[0].term || 'Term'} — {items[0].exam_type}</div>
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-muted-foreground">
                    <th className="py-2">Subject</th>
                    <th className="py-2">Marks</th>
                    <th className="py-2">Max</th>
                    <th className="py-2">Published</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="py-2">{r.subject}</td>
                      <td className="py-2 font-semibold">{r.marks}</td>
                      <td className="py-2">{r.max_marks}</td>
                      <td className="py-2 text-sm">{new Date(r.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          ))
        )}
      </main>
    </div>
  );
}
