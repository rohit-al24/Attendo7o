import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, School } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Exam { id: string; name: string; }
interface Assessment { id: string; title: string; subject: string | null; max_marks: number; }

const StudentResults = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const stateStudent = (location.state as any)?.student;
	const student = useMemo(() => {
		if (stateStudent) return stateStudent;
		try { const s = sessionStorage.getItem('student'); return s ? JSON.parse(s) : null; } catch { return null; }
	}, [stateStudent]);

	const [exams, setExams] = useState<Exam[]>([]);
	const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
	const [assessments, setAssessments] = useState<(Assessment & { marks?: number })[]>([]);

	useEffect(() => { if (!student) navigate('/student-login'); }, [student, navigate]);

		useEffect(() => {
			if (!student?.class_id) return;
			(async () => {
				const sb: any = supabase;
				// list exams available for this student's class
				const { data: ec } = await sb
					.from('results_exam_classes')
					.select('exam_id')
					.eq('class_id', student.class_id);
				const examIds = (ec || []).map((r: any) => r.exam_id);
				if (examIds.length === 0) { setExams([]); return; }
				const { data: exs } = await sb
					.from('results_exams')
					.select('id, name')
					.in('id', examIds);
				setExams((exs || []) as Exam[]);
			})();
		}, [student?.class_id]);

	const openExam = async (exam: Exam) => {
		setSelectedExam(exam);
		// fetch assessments and marks
			const sb: any = supabase;
			const { data: asmt } = await sb
				.from('results_assessments')
				.select('id, title, subject, max_marks')
				.eq('exam_id', exam.id)
				.eq('class_id', student.class_id);
			const assessments = (asmt || []) as any as Assessment[];
		if (assessments.length === 0) { setAssessments([]); return; }
		const ids = assessments.map(a => a.id);
			const { data: marks } = await sb
				.from('results_marks')
				.select('assessment_id, marks_obtained')
				.in('assessment_id', ids)
				.eq('student_id', student.id);
		const markMap: Record<string, number> = Object.fromEntries((marks || []).map((m: any) => [m.assessment_id, Number(m.marks_obtained)]));
		setAssessments(assessments.map(a => ({ ...a, marks: markMap[a.id] })));
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
			<header className="border-b bg-card shadow-soft">
				<div className="container mx-auto px-4 py-4 flex items-center justify-between">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
							<School className="w-5 h-5 text-white" />
						</div>
						<div>
							<h1 className="text-xl font-bold">Results</h1>
							<p className="text-sm text-muted-foreground">{student?.full_name}</p>
						</div>
					</div>
					<Button variant="ghost" onClick={() => navigate('/login-selection')}>
						<LogOut className="w-4 h-4 mr-2" /> Logout
					</Button>
				</div>
			</header>

			<main className="container mx-auto px-4 py-6 space-y-6">
				<Card className="p-4 shadow-medium">
					<h2 className="text-lg font-semibold mb-3">Available Exams</h2>
					<div className="flex gap-2 flex-wrap">
						{exams.map(ex => (
							<Button key={ex.id} variant={selectedExam?.id === ex.id ? 'default' : 'secondary'} onClick={() => openExam(ex)}>
								{ex.name}
							</Button>
						))}
						{exams.length === 0 && <div className="text-sm text-muted-foreground">No exams yet.</div>}
					</div>
				</Card>

				{selectedExam && (
					<Card className="p-4 shadow-medium">
						<h3 className="text-base font-semibold mb-3">{selectedExam.name} - Your Marks</h3>
						<div className="space-y-2">
							{assessments.length === 0 && <div className="text-sm text-muted-foreground">No results published for this exam.</div>}
							{assessments.map(a => (
								<div key={a.id} className="flex items-center justify-between border rounded p-2">
									<div>
										<div className="font-medium">{a.title}{a.subject ? ` - ${a.subject}` : ''}</div>
										<div className="text-xs text-muted-foreground">Max: {a.max_marks}</div>
									</div>
									<div className="text-right">
										<div className="text-lg font-bold">{a.marks ?? '-'}</div>
									</div>
								</div>
							))}
						</div>
					</Card>
				)}
			</main>
		</div>
	);
};

export default StudentResults;
