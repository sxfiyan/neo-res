import { SemesterResult, StudentDetail, StudentFullProfile, Subject } from "./types";

// Disable strict SSL verification for the COE portal which has missing intermediate CA chain (equivalent to curl -k)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const BASE_URL = "https://coe.pgi-intraconnect.in/qpportal/app.php";
const UNIV_CODE = "064";

/**
 * Parses summary cells from row1 HTML table returned by the COE API
 */
function parseRow1Metrics(row1Html?: string) {
  if (!row1Html) return { registered: "—", earned: "—", sgpa: "—", cgpa: "—" };

  const cellMatches = Array.from(row1Html.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)).map((m) =>
    m[1].replace(/<[^>]+>/g, "").trim()
  );

  return {
    registered: cellMatches[1] || "—",
    earned: cellMatches[3] || "—",
    sgpa: cellMatches[5] || "—",
    cgpa: cellMatches[11] || "—",
  };
}

/**
 * Generates an active student token
 */
export async function fetchStudentToken(regno: string): Promise<string> {
  const url = `${BASE_URL}?db=pub&a=generateStudentToken&regno=${encodeURIComponent(
    regno
  )}&univcode=${UNIV_CODE}`;

  const res = await fetch(url, {
    headers: {
      "X-Auth-Origin": "UNICLARE",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Token request failed with HTTP ${res.status}`);
  }

  const json = await res.json();
  const token = json?.data?.token;
  if (!token) {
    throw new Error(json?.data?.msg || json?.status || "Failed to generate student token");
  }

  return token;
}

/**
 * Fetches all available examination sessions for a student
 */
export async function fetchStudentExams(
  token: string,
  regno: string
): Promise<Array<{ yearmode: string; examname: string; examdate?: string; name?: string }>> {
  // Notice the two trailing spaces in the action name verified from backend routes
  const url = `${BASE_URL}?db=pub&a=showRVExam%20%20&regno=${encodeURIComponent(
    regno
  )}&univcode=${UNIV_CODE}`;

  const res = await fetch(url, {
    headers: {
      Authorization: token,
      "X-Auth-Origin": "UNICLARE",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return [];
  }

  try {
    const json = await res.json();
    if (json?.data && Array.isArray(json.data)) {
      return json.data.map((item: any) => ({
        yearmode: item.yearmode || item["2"] || "",
        examname: item.examname || item["4"] || "Semester Exam",
        examdate: item.examdate || item["3"] || "",
        name: item.name || item["9"] || "",
      }));
    }
  } catch {
    // If not JSON or failed
  }

  return [];
}

/**
 * Fetches detailed results for a specific yearmode
 */
export async function fetchSemesterDetails(
  token: string,
  regno: string,
  yearmode: string
): Promise<{ student: StudentDetail; result: SemesterResult } | null> {
  const url = `${BASE_URL}?db=pub&a=getDetailedResults&regno=${encodeURIComponent(
    regno
  )}&univcode=${UNIV_CODE}&yearmode=${encodeURIComponent(yearmode)}`;

  const res = await fetch(url, {
    headers: {
      Authorization: token,
      "X-Auth-Origin": "UNICLARE",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    },
    cache: "no-store",
  });

  if (!res.ok) return null;

  const json = await res.json();
  if (json?.error_code !== 0 || !json?.data) return null;

  const data = json.data;
  const stud = data.studdet || {};
  const metrics = parseRow1Metrics(data.row1);

  const student: StudentDetail = {
    regno: stud.regno || regno,
    name: stud.name || "",
    degree: stud.degree || "",
    descpn: stud.descpn || "",
    collname: stud.collname || "",
    FATNAME: stud.FATNAME || "",
    MOTNAME: stud.MOTNAME || "",
    photopath: stud.photopath || "",
    resdate: stud.resdate || "",
    examdate: data.examdate || stud.RESEXAMDATE || "",
  };

  const subjects: Subject[] = (data.resdata || []).map((s: any, idx: number) => ({
    slno: s.slno || idx + 1,
    subshort: s.subshort || "",
    subname: s.subname || "",
    no_of_credits: s.no_of_credits || 0,
    grade: s.grade || "—",
  }));

  const result: SemesterResult = {
    yearmode,
    examname: stud.examname || "Semester",
    examdate: data.examdate || stud.RESEXAMDATE || "",
    resdate: stud.resdate || "",
    credits_registered: metrics.registered,
    credits_earned: metrics.earned,
    sgpa: metrics.sgpa,
    cgpa: metrics.cgpa,
    subjects,
  };

  return { student, result };
}

/**
 * Fetches the entire student profile across all semesters
 */
export async function fetchAllStudentResults(regno: string): Promise<StudentFullProfile> {
  const normRegno = regno.trim().toUpperCase();
  const token = await fetchStudentToken(normRegno);

  const exams = await fetchStudentExams(token, normRegno);

  const semesters: SemesterResult[] = [];
  let studentDetail: StudentDetail = {
    regno: normRegno,
    name: "Student",
  };

  if (exams.length > 0) {
    // Query each exam cycle in parallel
    const details = await Promise.all(
      exams.map(async (exam) => {
        if (!exam.yearmode) return null;
        try {
          return await fetchSemesterDetails(token, normRegno, exam.yearmode);
        } catch {
          return null;
        }
      })
    );

    for (const d of details) {
      if (d) {
        if (d.student.name && (!studentDetail.name || studentDetail.name === "Student")) {
          studentDetail = d.student;
        }
        semesters.push(d.result);
      }
    }
  }

  // Fallback: If showRVExam returned no exams, try standard yearmodes
  if (semesters.length === 0) {
    const fallbackModes = ["D-2026-1", "B-2026-1", "C-2025-4", "B-2025-1", "A-2024-4"];
    for (const mode of fallbackModes) {
      try {
        const d = await fetchSemesterDetails(token, normRegno, mode);
        if (d) {
          studentDetail = d.student;
          semesters.push(d.result);
          break;
        }
      } catch {
        // Continue
      }
    }
  }

  if (semesters.length === 0) {
    throw new Error(`No semester results found for registration number: ${normRegno}`);
  }

  return {
    regno: normRegno,
    student: studentDetail,
    semesters,
    lastUpdated: new Date().toISOString(),
  };
}
