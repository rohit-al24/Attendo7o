import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, User, Book, ImagePlus } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [student, setStudent] = useState<any>(() => location.state?.student || null);
  const [classInfo, setClassInfo] = useState<any>(null);
  const [profileUrl, setProfileUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Student portal uses custom auth (students table). Fallback to localStorage if navigation state missing.
  useEffect(() => {
    if (!student) {
      try {
        const stored = localStorage.getItem('studentSession');
        if (stored) {
          const parsed = JSON.parse(stored);
          setStudent(parsed);
        } else {
          navigate('/student-login');
        }
      } catch {
        navigate('/student-login');
      }
    }
  }, [student, navigate]);

  useEffect(() => {
    if (!student) return;
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
    // Fetch profile photo URL from student record
    if (student.profile_url) {
      setProfileUrl(student.profile_url);
    } else {
      // Optionally, fetch from DB if not in state
      (supabase as any).from('students').select('profile_url').eq('id', student.id).single().then(({ data }: any) => {
        if (data?.profile_url) setProfileUrl(data.profile_url as string);
      });
    }
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
            onClick={() => { try { localStorage.removeItem('studentSession'); } catch {}; navigate("/login-selection"); }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-center mt-6">
          {/* Student Info & Profile - stacked for mobile, side-by-side for desktop */}
          <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
            {/* Profile with entry effect, no upload */}
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg animate-fade-in animate-coin-spin overflow-hidden">
              {profileUrl ? (
                <img
                  src={profileUrl}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full animate-bounce-in"
                />
              ) : (
                <User className="w-16 h-16 md:w-20 md:h-20 text-white drop-shadow-lg animate-bounce-in" />
              )}
            </div>
            {/* Info with entry effect */}
            <Card className="shadow-medium w-full md:w-80 animate-slide-in">
              <div className="p-6 space-y-2">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <User className="w-6 h-6 text-primary" />
                  <span className="animate-fade-in">Student Information</span>
                </h2>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="text-lg font-extrabold animate-name-glow bg-gradient-to-r from-primary via-pink-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg">
                  {student?.full_name}
                </p>
                <p className="text-sm text-muted-foreground">Roll Number</p>
                <p className="text-lg font-semibold">{student?.roll_number}</p>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="text-lg font-semibold">{classInfo?.department || '-'}</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Six Buttons in 3x2 Grid, vibrant colors, responsive */}
        <div className="mt-10 grid grid-cols-2 grid-rows-3 gap-4 w-full max-w-md mx-auto">
          <Button size="lg" className="h-20 text-lg font-bold bg-gradient-to-br from-blue-500 to-blue-400 text-white shadow-lg hover:scale-105 transition-transform" onClick={() => navigate('/student-attendance', { state: { student } })}>
            Attendance
          </Button>
          <Button size="lg" className="h-20 text-lg font-bold bg-gradient-to-br from-pink-500 to-pink-400 text-white shadow-lg hover:scale-105 transition-transform" disabled>
            Announcements
          </Button>
          <Button size="lg" className="h-20 text-lg font-bold bg-gradient-to-br from-green-500 to-green-400 text-white shadow-lg hover:scale-105 transition-transform" disabled>
            Class Votings
          </Button>
          <Button size="lg" className="h-20 text-lg font-bold bg-gradient-to-br from-yellow-500 to-yellow-400 text-white shadow-lg hover:scale-105 transition-transform" onClick={() => navigate('/student/results', { state: { student } })}>
            Results
          </Button>
          <Button size="lg" className="h-20 text-lg font-bold bg-gradient-to-br from-purple-500 to-purple-400 text-white shadow-lg hover:scale-105 transition-transform" disabled>
            Feedback
          </Button>
          <Dialog open={openProfile} onOpenChange={setOpenProfile}>
            <DialogTrigger asChild>
              <Button size="lg" className="h-20 text-lg font-bold bg-gradient-to-br from-gray-700 to-gray-500 text-white shadow-lg hover:scale-105 transition-transform">
                Profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile Photo</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg overflow-hidden">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-full" />
                  ) : profileUrl ? (
                    <img src={profileUrl} alt="Profile" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <User className="w-20 h-20 text-white" />
                  )}
                </div>
                <label className="mt-2 flex flex-col items-center gap-2 cursor-pointer">
                  <span className="text-sm font-medium text-primary flex items-center gap-1"><ImagePlus className="w-5 h-5" /> Choose Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setSelectedFile(file);
                      setPreviewUrl(URL.createObjectURL(file));
                    }}
                  />
                </label>
                {uploading && <div className="text-xs text-muted-foreground">Uploading...</div>}
              </div>
              <DialogFooter>
                <Button
                  disabled={!selectedFile || uploading}
                  onClick={async () => {
                    if (!selectedFile || !student) return;
                    setUploading(true);
                    // Upload to Supabase Storage (bucket: profile-photos)
                    const fileExt = selectedFile.name.split('.').pop();
                    const fileName = `${student.id}.${fileExt}`;
                    const { data, error } = await supabase.storage.from('profile-photos').upload(fileName, selectedFile, { upsert: true });
                    if (error) {
                      alert('Upload failed');
                      setUploading(false);
                      return;
                    }
                    // Get public URL
                    const { data: urlData } = supabase.storage.from('profile-photos').getPublicUrl(fileName);
                    if (urlData?.publicUrl) {
                      setProfileUrl(urlData.publicUrl);
                      setPreviewUrl(null);
                      setSelectedFile(null);
                      // Update student record
                      await (supabase as any).from('students').update({ profile_url: urlData.publicUrl }).eq('id', student.id);
                    }
                    setUploading(false);
                    setOpenProfile(false);
                  }}
                >
                  Save Photo
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Animations CSS */}
        <style>{`
          @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slide-in { from { transform: translateY(30px); opacity: 0; } to { transform: none; opacity: 1; } }
          @keyframes bounce-in { 0% { transform: scale(0.7); } 60% { transform: scale(1.1); } 100% { transform: scale(1); } }
          @keyframes coin-spin { from { transform: rotateY(0deg); } to { transform: rotateY(360deg); } }
          @keyframes name-glow {
            0% { text-shadow: 0 0 0px #fff, 0 0 0px #f472b6, 0 0 0px #facc15; opacity: 0; }
            40% { opacity: 1; }
            60% { text-shadow: 0 0 12px #fff, 0 0 24px #f472b6, 0 0 32px #facc15; }
            100% { text-shadow: 0 0 6px #fff, 0 0 12px #f472b6, 0 0 16px #facc15; }
          }
          .animate-fade-in { animation: fade-in 0.8s ease; }
          .animate-fade-in-delay { animation: fade-in 1.2s ease; }
          .animate-slide-in { animation: slide-in 0.7s cubic-bezier(.42,0,.58,1); }
          .animate-bounce-in { animation: bounce-in 0.7s cubic-bezier(.42,0,.58,1); }
          .animate-coin-spin { animation: coin-spin 3s cubic-bezier(.42,0,.58,1); }
          .animate-name-glow { animation: name-glow 1.5s cubic-bezier(.42,0,.58,1); }
        `}</style>
      </main>
    </div>
  );
};

export default StudentDashboard;
