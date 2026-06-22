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

export type FlatNote = {
  title: string;
  courseCode: string | null;
  courseTitle: string;
  yearLabel: string;
  yearNum: number;
  semesterLabel: string;
  hasContent: boolean;
  href: string;
};

/** Every note in the curriculum, flattened with its course/year/semester
 *  context, for search. Notes with extracted HTML route to the reader; the
 *  rest open the original PDF in a new tab. */
export function getAllNotes(): FlatNote[] {
  const out: FlatNote[] = [];
  for (const year of curriculum.years) {
    for (const semester of year.semesters) {
      for (const course of semester.courses) {
        for (const note of course.notes) {
          out.push({
            title: note.title,
            courseCode: course.code,
            courseTitle: course.title,
            yearLabel: year.label,
            yearNum: year.year,
            semesterLabel: semester.label,
            hasContent: !!note.html_file,
            href: note.html_file
              ? `/document?file=${encodeURIComponent(note.html_file)}`
              : `/Notes/${note.file}`,
          });
        }
      }
    }
  }
  return out;
}
