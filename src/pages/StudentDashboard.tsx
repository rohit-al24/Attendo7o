import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, User, Megaphone, Vote, FileBarChart, MessageSquare, IdCard } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const StudentDashboard = () => {
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
  const [classInfo, setClassInfo] = useState<any>(null);

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
    const fetchClass = async () => {
      const { data } = await supabase
        .from('classes')
        .select('class_name, department')
        .eq('id', student.class_id)
        .single();
      setClassInfo(data);
    };
    fetchClass();
  }, [student, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Student Portal</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {student?.full_name}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/login-selection")}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-4">
        {/* Top: Info left, profile right */}
        <Card className="shadow-medium p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Hello,</p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight animate-in fade-in slide-in-from-left-2 duration-500">
                {student?.full_name}
              </h2>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm sm:text-base">
                <div>
                  <p className="text-muted-foreground">Roll No</p>
                  <p className="font-semibold">{student?.roll_number}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Department</p>
                  <p className="font-semibold">{classInfo?.department || '-'}</p>
                </div>
              </div>
            </div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary to-purple-500 shadow-lg flex items-center justify-center ring-2 ring-primary/20 animate-in fade-in slide-in-from-right-2 duration-500">
              <User className="w-8 h-8 text-white" />
            </div>
          </div>
        </Card>

        {/* 3x2 grid buttons */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <Button className="h-24 sm:h-28 rounded-xl bg-primary text-primary-foreground hover:opacity-90 shadow-md" onClick={() => navigate('/student/attendance', { state: { student } })}>
            Attendance
          </Button>
          <Button className="h-24 sm:h-28 rounded-xl bg-emerald-600 text-white hover:opacity-90 shadow-md" onClick={() => navigate('/student/announcements')}>
            Announcements
          </Button>
          <Button className="h-24 sm:h-28 rounded-xl bg-amber-500 text-black hover:opacity-90 shadow-md" onClick={() => navigate('/student/votings')}>
            Class Votings
          </Button>
          <Button className="h-24 sm:h-28 rounded-xl bg-indigo-600 text-white hover:opacity-90 shadow-md" onClick={() => navigate('/student/results', { state: { student } })}>
            Results
          </Button>
          <Button className="h-24 sm:h-28 rounded-xl bg-rose-500 text-white hover:opacity-90 shadow-md" onClick={() => navigate('/student/feedback')}>
            Feedback
          </Button>
          <Button className="h-24 sm:h-28 rounded-xl bg-slate-700 text-white hover:opacity-90 shadow-md" onClick={() => navigate('/student/profile')}>
            Profile
          </Button>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
