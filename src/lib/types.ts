export interface Subject {
  slno?: number;
  subshort: string;
  subname: string;
  no_of_credits: string | number;
  grade: string;
}

export interface ComponentMark {
  component: string;
  score: string;
}

export interface SubjectComponentMarks {
  slno: number;
  subname: string;
  subshort?: string;
  grade?: string;
  components: ComponentMark[];
}

export interface StudentDetail {
  regno: string;
  name: string;
  degree?: string;
  descpn?: string;
  collname?: string;
  FATNAME?: string;
  MOTNAME?: string;
  photopath?: string;
  resdate?: string;
  examdate?: string;
}

export interface SemesterResult {
  yearmode: string;
  examname: string;
  examdate?: string;
  resdate?: string;
  credits_registered?: string | number;
  credits_earned?: string | number;
  sgpa?: string | number;
  cgpa?: string | number;
  subjects: Subject[];
  componentMarks?: SubjectComponentMarks[];
}

export interface SemesterHistoryItem {
  key?: number;
  yearmode: string;
  examname: string;
  examdate: string;
  resdate: string;
  classStatus: string;
  degree: string;
  college: string;
  color?: string;
}

export interface AnswerScriptItem {
  slno: number;
  subshort: string;
  subname: string;
  secMarks: string;
  qpcode?: string;
  dummyno?: string;
  valno?: string;
  scriptUrl?: string;
}

export interface AnswerScriptSheet {
  available: boolean;
  studentName?: string;
  regno?: string;
  scripts: AnswerScriptItem[];
}

export interface StudentFullProfile {
  regno: string;
  student: StudentDetail;
  semesters: SemesterResult[];
  history: SemesterHistoryItem[];
  answerScripts?: AnswerScriptSheet;
  lastUpdated?: string;
}
