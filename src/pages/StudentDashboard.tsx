import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, User, Book } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import CircularProgress from "@/components/CircularProgress";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const student = location.state?.student;
  const [attendance, setAttendance] = useState<number>(0);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classInfo, setClassInfo] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate("/student-login");
      }
    });
  }, [navigate]);

  // Mock student data - In real app, this would come from backend
  useEffect(() => {
    if (!student) {
      navigate('/student-login');
      return;
    }
    // Fetch class info
    const fetchClass = async () => {
      const { data } = await supabase
        .from('classes')
        .select('class_name, department')
        .eq('id', student.class_id)
        .single();
      setClassInfo(data);
    };
    fetchClass();

    // Fetch attendance records for student
    const fetchAttendance = async () => {
      const { data } = await supabase
        .from('attendance_records')
        .select('subject, status, faculty_id')
        .eq('student_id', student.id);
      if (!data) return;
      // Calculate overall attendance
      const total = data.length;
      const present = data.filter((r: any) => r.status === 'present').length;
      setAttendance(total ? Math.round((present / total) * 1000) / 10 : 0);

      // Fetch faculty names for faculty_ids present
      const facultyIds = Array.from(new Set(data.map((r: any) => r.faculty_id).filter(Boolean)));
      let facultyMap: Record<string, string> = {};
      if (facultyIds.length > 0) {
        const { data: facultyData } = await supabase
          .from('faculty')
          .select('id, full_name')
          .in('id', facultyIds);
        if (facultyData) facultyData.forEach((f: any) => { facultyMap[f.id] = f.full_name; });
      }

      // Group attendance records by subject, period, and faculty
      const grouped: Record<string, any[]> = {};
      data.forEach((r: any) => {
        const key = `${r.subject}|${r.period_number}|${r.faculty_id}`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(r);
      });
      // Prepare rows for table
      const rows = Object.entries(grouped).map(([key, records]) => {
        const [subject, period, facultyId] = key.split('|');
        const present = records.filter((r: any) => r.status === 'present').length;
        const absent = records.filter((r: any) => r.status === 'absent').length;
        const onduty = records.filter((r: any) => r.status === 'onduty').length;
        const total = records.length;
        return {
          facultyName: facultyMap[facultyId] || 'Unknown',
          subject,
          period,
          present,
          absent,
          onduty,
          total,
          percentage: total ? ((present / total) * 100).toFixed(2) + '%' : '0%'
        };
      });
      setSubjects(rows);
    };
    fetchAttendance();
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

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Student Info Card */}
        <Card className="shadow-medium">
          <div className="p-6 space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <User className="w-6 h-6 text-primary" />
              Student Information
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="text-lg font-semibold">{student?.full_name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Roll Number</p>
                <p className="text-lg font-semibold">{student?.roll_number}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="text-lg font-semibold">{classInfo?.department || '-'}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Overall Attendance */}
        <Card className="shadow-medium">
          <div className="p-6 text-center space-y-4">
            <h2 className="text-2xl font-bold">Overall Attendance</h2>
            <div className="flex justify-center py-4">
              <CircularProgress 
                percentage={attendance} 
                size={160}
                strokeWidth={12}
              />
            </div>
          </div>
        </Card>

        {/* Detailed Attendance Records Table */}
        <Card className="shadow-medium">
          <div className="p-6 space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Book className="w-6 h-6 text-primary" />
              Detailed Attendance Records
            </h2>
            <table className="w-full text-center border">
              <thead>
                <tr>
                  <th>Faculty Name</th>
                  <th>Subject</th>
                  <th>Period</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>On Duty</th>
                  <th>Total</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.facultyName}</td>
                    <td>{row.subject}</td>
                    <td>{row.period}</td>
                    <td>{row.present}</td>
                    <td>{row.absent}</td>
                    <td>{row.onduty}</td>
                    <td>{row.total}</td>
                    <td>{row.percentage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default StudentDashboard;
