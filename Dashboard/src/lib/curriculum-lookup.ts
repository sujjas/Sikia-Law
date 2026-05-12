import curriculumJson from "@/data/curriculum.json";
import type { Curriculum, Course, Note, Year, Semester } from "@/data/curriculum";

const curriculum = curriculumJson as Curriculum;

export type NoteLocation = {
  year: Year;
  semester: Semester;
  course: Course;
  note: Note;
  indexInCourse: number;
};

export function findNoteByFile(htmlFile: string): NoteLocation | null {
  for (const year of curriculum.years) {
    for (const semester of year.semesters) {
      for (const course of semester.courses) {
        const idx = course.notes.findIndex(
          (n) => n.html_file === htmlFile || n.file === htmlFile
        );
        if (idx !== -1) {
          return { year, semester, course, note: course.notes[idx], indexInCourse: idx };
        }
      }
    }
  }
  return null;
}

export function getPrevNext(loc: NoteLocation): { prev: Note | null; next: Note | null } {
  const { course, indexInCourse } = loc;
  return {
    prev: indexInCourse > 0 ? course.notes[indexInCourse - 1] : null,
    next: indexInCourse < course.notes.length - 1 ? course.notes[indexInCourse + 1] : null,
  };
}

export function getRelatedNotes(loc: NoteLocation): Note[] {
  return loc.course.notes.filter((_, i) => i !== loc.indexInCourse);
}
