export interface Subject {
  slno?: number;
  subshort: string;
  subname: string;
  no_of_credits: string | number;
  grade: string;
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
  isCustomOverride?: boolean;
}

export interface StudentFullProfile {
  regno: string;
  student: StudentDetail;
  semesters: SemesterResult[];
  lastUpdated?: string;
}

export interface CustomRecord {
  id: string;
  regno: string;
  name: string;
  yearmode: string;
  examname: string;
  sgpa: string;
  cgpa: string;
  credits_earned: string;
  status: string;
  notes?: string;
  subjects: Subject[];
  updatedAt: string;
}
