// src/lib/subjects.ts
// Central subject management for dropdowns (timetable, results, etc.)

export type Subject = {
  id: string;
  name: string;
  courseCode: string;
};

// Initial subjects (edit as needed)
let subjects: Subject[] = [
  { id: 'math', name: 'Mathematics', courseCode: 'MATH101' },
  { id: 'phy', name: 'Physics', courseCode: 'PHY101' },
  { id: 'chem', name: 'Chemistry', courseCode: 'CHEM101' },
  // Add more subjects here
];

export function getSubjects(): Subject[] {
  return subjects;
}

export function addSubject(subject: Subject) {
  subjects.push(subject);
}

export function editSubject(id: string, newName: string, newCourseCode: string) {
  const subj = subjects.find(s => s.id === id);
  if (subj) {
    subj.name = newName;
    subj.courseCode = newCourseCode;
  }
}

// You can import { getSubjects, addSubject, editSubject } from './subjects';
