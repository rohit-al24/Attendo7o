import { supabase } from "@/integrations/supabase/client";
// F1 car style name animation with lightning effect
const F1NameLightning = ({ name }: { name?: string }) => {
  const [animating, setAnimating] = useState(true);
  const [style, setStyle] = useState<React.CSSProperties>({ transform: 'translateX(100vw)', filter: 'brightness(2) drop-shadow(0 0 8px #fff)' });
  useEffect(() => {
    let start = Date.now();
    let raf: number;
    const duration = 3000;
    const animate = () => {
      const elapsed = Date.now() - start;
      if (elapsed < duration) {
        // F1 car: fast to slow slide-in
        const progress = elapsed / duration;
        const ease = 1 - Math.pow(1 - progress, 2);
        const x = 100 - 100 * ease; // from 100vw to 0
        const glow = 2 - ease; // glow fades out
        setStyle({
          transform: `translateX(${x}vw)`,
          transition: 'transform 0.05s linear',
          filter: `brightness(${glow}) drop-shadow(0 0 ${8 * glow}px #fff)`,
        });
        raf = window.requestAnimationFrame(animate);
      } else {
        setStyle({
          transform: 'translateX(0)',
          transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
          filter: 'brightness(1.2) drop-shadow(0 0 12px #00f8) drop-shadow(0 0 24px #fff)',
        });
        setAnimating(false);
      }
    };
    animate();
    return () => { if (raf) window.cancelAnimationFrame(raf); };
  }, []);
  return (
    <h2
      className="text-2xl sm:text-3xl font-bold tracking-tight relative"
      style={style}
    >
      {name}
      {animating && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-2 bg-gradient-to-r from-yellow-400 via-white to-blue-400 animate-pulse" style={{ zIndex: 1, filter: 'blur(2px)' }} />
      )}
    </h2>
  );
};
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, User, Megaphone, Vote, FileBarChart, MessageSquare, IdCard } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import React, { useEffect, useState, useRef } from "react";
// Coin spinning animation for profile photo
const ProfilePhotoSpin = ({ profileUrl, fullName }: { profileUrl?: string; fullName?: string }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [spinning, setSpinning] = useState(true);
  const [spinStyle, setSpinStyle] = useState<React.CSSProperties>({});

    useEffect(() => {
      let start = Date.now();
      let raf: number;
      const duration = 3000; // 3 seconds
      const animate = () => {
        const elapsed = Date.now() - start;
        if (elapsed < duration) {
          // Fast to slow: ease out
          const progress = elapsed / duration;
          const ease = 1 - Math.pow(1 - progress, 2);
          const deg = 1080 * (1 - ease) + 360 * ease; // 3 spins to 1 spin
          setSpinStyle({ transform: `rotateY(${deg}deg)`, transition: 'transform 0.05s linear' });
          raf = window.requestAnimationFrame(animate);
        } else {
          setSpinStyle({ transform: 'rotateY(0deg)', transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)' });
          setSpinning(false);
        }
      };
      animate();
      return () => { if (raf) window.cancelAnimationFrame(raf); };
    }, []);

    return (
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary to-purple-500 shadow-lg flex items-center justify-center ring-2 ring-primary/20 overflow-hidden border-2 border-white" style={spinStyle}>
        {profileUrl ? (
          <img
            ref={imgRef}
            src={profileUrl}
            alt="profile"
            className="w-full h-full object-cover"
            onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(fullName || 'Student'); }}
            style={{ aspectRatio: '1/1', background: 'white', backfaceVisibility: 'hidden' }}
          />
        ) : (
          <User className="w-8 h-8 text-white" />
        )}
      </div>
    );
  };

const StudentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [student, setStudent] = useState<any>(() => {
    try {
      const str = sessionStorage.getItem("student");
      return str ? JSON.parse(str) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    // Always refresh student from sessionStorage on mount
    try {
      const str = sessionStorage.getItem("student");
      setStudent(str ? JSON.parse(str) : null);
    } catch {
      setStudent(null);
    }
  }, []);
  const [classInfo, setClassInfo] = useState<any>(null);

  // No auth gating for students; rely on in-app login and sessionStorage

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
              <F1NameLightning name={student?.full_name} />
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
            <ProfilePhotoSpin profileUrl={student?.profile_url} fullName={student?.full_name} />

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
