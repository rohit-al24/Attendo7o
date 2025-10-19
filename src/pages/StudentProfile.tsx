import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IdCard, LogOut, UploadCloud, ImagePlus, User } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const BUCKET = 'student-avatars'; // Ensure this bucket exists and is public in Supabase Storage

const StudentProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const stateStudent = (location.state as any)?.student;
  const [student, setStudent] = useState<any>(() => {
    if (stateStudent) return stateStudent;
    try {
      const s = sessionStorage.getItem('student');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(student?.profile_url || null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!student) navigate('/student-login');
  }, [student, navigate]);

  const handleChoose = () => fileRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !student?.id) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    setUploading(true);
    try {
      // Optional: preview
      const url = URL.createObjectURL(file);
      setPreview(url);

      const path = `${student.id}/${Date.now()}-${file.name}`;
      const sb: any = supabase;
      const { error: upErr } = await sb.storage.from(BUCKET).upload(path, file, { upsert: true, cacheControl: '3600' });
      if (upErr) {
        toast.error(upErr.message || 'Upload failed');
        setUploading(false);
        return;
      }
      const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(path);
      const publicUrl = pub?.publicUrl as string;
      if (!publicUrl) {
        toast.error('Could not get public URL. Make sure the bucket is public.');
        setUploading(false);
        return;
      }
      // Update DB
      const { error: updErr } = await sb
        .from('students')
        .update({ profile_url: publicUrl })
        .eq('id', student.id);
      if (updErr) {
        toast.error('Saved to storage but failed to save profile. Check RLS policies.');
        setUploading(false);
        return;
      }
      // Update local session
      const updated = { ...student, profile_url: publicUrl };
      setStudent(updated);
      try { sessionStorage.setItem('student', JSON.stringify(updated)); } catch {}
      setPreview(publicUrl);
      toast.success('Profile photo updated');
    } catch (err: any) {
      toast.error(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
              <IdCard className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">Profile</h1>
          </div>
          <Button variant="ghost" onClick={() => navigate('/login-selection')}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <Card className="p-6 shadow-medium">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-muted ring-2 ring-primary/20 overflow-hidden flex items-center justify-center">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">{student?.roll_number}</p>
              <p className="text-xl font-semibold">{student?.full_name}</p>
              <div className="mt-3 flex items-center gap-3">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                <Button onClick={handleChoose} disabled={uploading}>
                  <ImagePlus className="w-4 h-4 mr-2" /> Choose Photo
                </Button>
                <Button variant="secondary" onClick={handleChoose} disabled={uploading}>
                  <UploadCloud className="w-4 h-4 mr-2" /> Upload
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Tip: Ensure a public storage bucket named "{BUCKET}" exists.</p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default StudentProfile;
