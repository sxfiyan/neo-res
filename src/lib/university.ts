import {
  AnswerScriptItem,
  AnswerScriptSheet,
  SemesterHistoryItem,
  SemesterResult,
  StudentDetail,
  StudentFullProfile,
  Subject,
  SubjectComponentMarks,
} from "./types";

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
 * Fetches historical result summary timeline via getResultSummaryDetailsnew
 */
export async function fetchResultSummaryHistory(
  token: string,
  regno: string
): Promise<SemesterHistoryItem[]> {
  const url = `${BASE_URL}?db=pub&a=getResultSummaryDetailsnew&regno=${encodeURIComponent(
    regno
  )}&univcode=${UNIV_CODE}`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: token,
        "X-Auth-Origin": "UNICLARE",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      cache: "no-store",
    });

    if (!res.ok) return [];

    const json = await res.json();
    if (json?.error_code === 0 && Array.isArray(json?.data)) {
      return json.data.map((item: any, idx: number) => ({
        key: item.key ?? idx,
        yearmode: item.yearmode || item["2"] || "",
        examname: item.examname || item["5"] || "",
        examdate: item.examdate || item["4"] || "",
        resdate: item.resdate || item["6"] || "",
        classStatus: item.class || item["0"] || "Pass",
        degree: item.degree || item["8"] || "",
        college: item.college || item["9"] || "",
        color: item.color || "#ffe600",
      }));
    }
  } catch {
    // Graceful fallback
  }

  return [];
}

/**
 * Fetches raw component-wise marks (End Term, Mid Term, CA, Practicals) via getBriefResults
 */
export async function fetchBriefResults(
  token: string,
  regno: string,
  yearmode: string
): Promise<SubjectComponentMarks[]> {
  const url = `${BASE_URL}?db=pub&a=getBriefResults&regno=${encodeURIComponent(
    regno
  )}&univcode=${UNIV_CODE}&yearmode=${encodeURIComponent(yearmode)}`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: token,
        "X-Auth-Origin": "UNICLARE",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      cache: "no-store",
    });

    if (!res.ok) return [];

    const json = await res.json();
    const rawList =
      (Array.isArray(json?.data?.data) ? json.data.data : null) ||
      (Array.isArray(json?.data?.tables?.[0]?.data) ? json.data.tables[0].data : null) ||
      (Array.isArray(json?.data) ? json.data : []);

    if (rawList.length > 0) {
      return rawList.map((item: any, idx: number) => {
        const components: Array<{ component: string; score: string }> = [];
        const subnames = Array.isArray(item.ssubname) ? item.ssubname : [item.ssubname || "Total"];
        const marks = Array.isArray(item.marks) ? item.marks : [item.marks || "—"];

        for (let i = 0; i < subnames.length; i++) {
          components.push({
            component: String(subnames[i] || `Component ${i + 1}`),
            score: String(marks[i] !== undefined ? marks[i] : "—"),
          });
        }

        return {
          slno: item.slno || idx + 1,
          subname: item.subname || "Course",
          components,
        };
      });
    }
  } catch {
    // Graceful fallback
  }

  return [];
}

/**
 * Fetches all available examination sessions for a student
 */
export async function fetchStudentExams(
  token: string,
  regno: string
): Promise<Array<{ yearmode: string; examname: string; examdate?: string; name?: string }>> {
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

  if (!res.ok) return [];

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
    // Fallback
  }

  return [];
}

/**
 * Fetches detailed results and component-wise marks for a specific yearmode
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

  // Fetch component-wise raw marks concurrently
  const componentMarks = await fetchBriefResults(token, regno, yearmode);

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

  const enrichedComponentMarks = componentMarks.map((comp) => {
    const matchedSubject = subjects.find(
      (s) =>
        s.subname.trim().toLowerCase() === comp.subname.trim().toLowerCase() ||
        s.slno === comp.slno
    );
    return {
      ...comp,
      subshort: matchedSubject?.subshort || "",
      grade: matchedSubject?.grade || "—",
    };
  });

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
    componentMarks: enrichedComponentMarks,
  };

  return { student, result };
}

/**
 * Fetches published digital answer scripts and mid-term marks via scriptView.php
 */
export async function fetchAnswerScripts(
  token: string,
  regno: string
): Promise<AnswerScriptSheet> {
  const url = `https://coe.pgi-intraconnect.in/pubapi/scriptView.php?regno=${encodeURIComponent(
    regno
  )}&token=${encodeURIComponent(token)}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      cache: "no-store",
    });

    if (!res.ok) return { available: false, scripts: [] };

    const html = await res.text();
    if (!html || html.includes("Invalid Register No") || html.includes("No Record")) {
      return { available: false, scripts: [] };
    }

    // Extract student name if present
    const nameMatch = html.match(/Student Name:\s*<span><b>\s*([^<]+)\s*<\/b><\/span>/i);
    const studentName = nameMatch ? nameMatch[1].trim() : undefined;

    // Extract table rows
    const tableMatch = html.match(/<table class=['"]table table-bordered['"][\s\S]*?<\/table>/i);
    if (!tableMatch) {
      return { available: false, studentName, regno, scripts: [] };
    }

    const rowMatches = Array.from(tableMatch[0].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi));
    const scripts: AnswerScriptItem[] = [];

    for (let i = 1; i < rowMatches.length; i++) {
      const rowHtml = rowMatches[i][1];
      const cells = Array.from(rowHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)).map((m) =>
        m[1].trim()
      );

      if (cells.length >= 4) {
        const slno = parseInt(cells[0].replace(/<[^>]+>/g, "").trim(), 10) || i;
        const subshort = cells[1].replace(/<[^>]+>/g, "").trim();
        const subname = cells[2].replace(/<[^>]+>/g, "").trim();
        const secMarks = cells[3].replace(/<[^>]+>/g, "").trim();

        let qpcode: string | undefined;
        let dummyno: string | undefined;
        let valno: string | undefined;
        let scriptUrl: string | undefined;

        // Extract showDetailedScript("qpcode", "dummyno", "valno")
        const scriptMatch = (cells[4] || rowHtml).match(
          /showDetailedScript\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]\s*\)/i
        );

        if (scriptMatch) {
          qpcode = scriptMatch[1];
          dummyno = scriptMatch[2];
          valno = scriptMatch[3];
          scriptUrl = `https://dvs1.pgi-intraconnect.in/#/ans-book/${qpcode}/${dummyno}/${valno}`;
        }

        scripts.push({
          slno,
          subshort,
          subname,
          secMarks,
          qpcode,
          dummyno,
          valno,
          scriptUrl,
        });
      }
    }

    return {
      available: scripts.length > 0,
      studentName,
      regno,
      scripts,
    };
  } catch {
    return { available: false, scripts: [] };
  }
}

/**
 * Fetches the entire student profile across all semesters + historical timeline + answer scripts
 */
export async function fetchAllStudentResults(regno: string): Promise<StudentFullProfile> {
  const normRegno = regno.trim().toUpperCase();
  const token = await fetchStudentToken(normRegno);

  // Run history, exam listings & scriptView in parallel
  const [history, exams, answerScripts] = await Promise.all([
    fetchResultSummaryHistory(token, normRegno),
    fetchStudentExams(token, normRegno),
    fetchAnswerScripts(token, normRegno),
  ]);

  const semesters: SemesterResult[] = [];
  let studentDetail: StudentDetail = {
    regno: normRegno,
    name: "Student",
  };

  const cyclesToFetch =
    exams.length > 0
      ? exams
      : history.length > 0
      ? history.map((h) => ({ yearmode: h.yearmode, examname: h.examname }))
      : [{ yearmode: "D-2026-1", examname: "Fourth Semester" }];

  const details = await Promise.all(
    cyclesToFetch.map(async (exam) => {
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

  if (semesters.length === 0) {
    throw new Error(`No semester results found for registration number: ${normRegno}`);
  }

  return {
    regno: normRegno,
    student: studentDetail,
    semesters,
    history,
    answerScripts,
    lastUpdated: new Date().toISOString(),
  };
}
