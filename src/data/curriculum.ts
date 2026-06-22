export type Note = {
  title: string;
  file: string;
  html_file?: string;
  _filed_in?: string;
  _also_used_by?: string[];
};

export type Course = {
  code: string | null;
  title: string;
  notes: Note[];
};

export type Semester = {
  semester: number;
  label: string;
  courses: Course[];
};

export type Year = {
  year: number;
  label: string;
  semesters: Semester[];
};

export type Curriculum = {
  _meta?: Record<string, unknown>;
  years: Year[];
};
