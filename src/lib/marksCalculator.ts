export interface CourseScoreBreakdown {
  slno: number;
  subshort: string;
  subname: string;
  grade: string;
  isPractical: boolean;
  // Practical course metrics:
  practicalScore?: number | string;
  // Theory course metrics:
  caScore?: number;          // out of 50 (Continuous Assessment / Assignment)
  midtermScore?: number;     // out of 50 (Mid-term examination)
  internalTotal?: number;    // CA + Midterm (out of 100)
  endtermScore?: number;     // out of 100 (Calculated End-Term exam)
  endtermMin?: number;       // Min possible End-Term marks for awarded grade
  endtermMax?: number;       // Max possible End-Term marks for awarded grade
  totalScore: number | string; // out of 200 for theory, out of 100 for practical
  maxTotal: number;          // 200 or 100
  percentage?: number;
}

/**
 * Standard University Grade-to-Marks Mapping (out of 200)
 */
export const GRADE_THRESHOLDS: Record<
  string,
  { minPct: number; maxPct: number; nominalPct: number; minTotal: number; maxTotal: number; nominalTotal: number }
> = {
  O: { minPct: 90, maxPct: 100, nominalPct: 92.5, minTotal: 180, maxTotal: 200, nominalTotal: 185 },
  "A+": { minPct: 80, maxPct: 89.9, nominalPct: 85, minTotal: 160, maxTotal: 179.8, nominalTotal: 170 },
  A: { minPct: 70, maxPct: 79.9, nominalPct: 75, minTotal: 140, maxTotal: 159.8, nominalTotal: 150 },
  "B+": { minPct: 60, maxPct: 69.9, nominalPct: 65, minTotal: 120, maxTotal: 139.8, nominalTotal: 130 },
  B: { minPct: 55, maxPct: 59.9, nominalPct: 57.5, minTotal: 110, maxTotal: 119.8, nominalTotal: 115 },
  C: { minPct: 50, maxPct: 54.9, nominalPct: 52.5, minTotal: 100, maxTotal: 109.8, nominalTotal: 105 },
  D: { minPct: 40, maxPct: 49.9, nominalPct: 45, minTotal: 80, maxTotal: 99.8, nominalTotal: 90 },
  F: { minPct: 0, maxPct: 39.9, nominalPct: 30, minTotal: 0, maxTotal: 79.8, nominalTotal: 60 },
};

/**
 * Parses raw components and computes CA, MIDTERM, and calculated ENDTERM out of 200.
 * Formula: CA (50) + MIDTERM (50) + ENDTERM (100) = 200 Marks Total.
 */
export function calculateCourseScores(
  slno: number,
  subname: string,
  subshort: string,
  grade: string,
  components: Array<{ component: string; score: string }>
): CourseScoreBreakdown {
  const normGrade = (grade || "—").trim().toUpperCase();

  // Practical courses check:
  const isLabOrPractical =
    components.length === 1 ||
    components.some((c) => c.component.toLowerCase().includes("practical")) ||
    subname.toLowerCase().includes("lab") ||
    subname.toLowerCase().includes("practical") ||
    subname.toLowerCase().includes("training");

  if (isLabOrPractical && components.length === 1) {
    const rawVal = components[0].score;
    const num = parseFloat(rawVal);
    const scoreVal = isNaN(num) ? rawVal : num;
    return {
      slno,
      subshort,
      subname,
      grade: normGrade,
      isPractical: true,
      practicalScore: scoreVal,
      totalScore: scoreVal,
      maxTotal: 100,
      percentage: typeof scoreVal === "number" ? Math.min(100, Math.max(0, scoreVal)) : undefined,
    };
  }

  // Theory course with components:
  // Component 1 is labeled "End Term" in university API, but is actually CA / Assignment (out of 50).
  // Component 2 is labeled "Mid Term" or "CA", which is the Midterm Exam (out of 50).
  let caScore: number | undefined;
  let midtermScore: number | undefined;

  if (components.length >= 2) {
    const endTermLabelIdx = components.findIndex((c) =>
      c.component.toLowerCase().includes("end")
    );

    if (endTermLabelIdx !== -1) {
      // Mislabeled "End Term" is CA / Assignment (out of 50)
      const caVal = parseFloat(components[endTermLabelIdx].score);
      if (!isNaN(caVal)) caScore = caVal;

      // The other component is Midterm (out of 50)
      const otherIdx = endTermLabelIdx === 0 ? 1 : 0;
      const midVal = parseFloat(components[otherIdx].score);
      if (!isNaN(midVal)) midtermScore = midVal;
    } else {
      // Fallback if neither says "End Term"
      for (const comp of components) {
        const name = comp.component.toLowerCase();
        const val = parseFloat(comp.score);
        if (name.includes("mid")) {
          if (!isNaN(val)) midtermScore = val;
        } else if (name.includes("ca") || name.includes("assign")) {
          if (!isNaN(val)) caScore = val;
        } else if (midtermScore === undefined && !isNaN(val)) {
          midtermScore = val;
        } else if (caScore === undefined && !isNaN(val)) {
          caScore = val;
        }
      }
    }
  } else if (components.length === 1) {
    const val = parseFloat(components[0].score);
    if (!isNaN(val)) {
      caScore = val;
    }
  }

  // Compute Internal Total (CA + Midterm out of 100)
  const safeCA = caScore ?? 0;
  const safeMid = midtermScore ?? 0;
  const internalTotal = safeCA + safeMid;

  // Derive ENDTERM from the awarded grade out of 200
  const threshold = GRADE_THRESHOLDS[normGrade];
  let endtermScore: number | undefined;
  let endtermMin: number | undefined;
  let endtermMax: number | undefined;
  let totalScore: number | string = "—";
  let percentage: number | undefined;

  if (threshold && (caScore !== undefined || midtermScore !== undefined)) {
    // Nominal End Term out of 100
    const rawNominal = threshold.nominalTotal - internalTotal;
    endtermScore = Math.round(Math.min(100, Math.max(0, rawNominal)) * 10) / 10;

    // Minimum and Maximum End Term marks consistent with grade
    const rawMin = Math.max(0, threshold.minTotal - internalTotal);
    const rawMax = Math.min(100, threshold.maxTotal - internalTotal);
    endtermMin = Math.round(rawMin * 10) / 10;
    endtermMax = Math.round(rawMax * 10) / 10;

    const calcTotal = Math.round((internalTotal + endtermScore) * 10) / 10;
    totalScore = calcTotal;
    percentage = Math.round((calcTotal / 200) * 1000) / 10;
  } else if (caScore !== undefined || midtermScore !== undefined) {
    totalScore = internalTotal;
  }

  return {
    slno,
    subshort,
    subname,
    grade: normGrade,
    isPractical: false,
    caScore,
    midtermScore,
    internalTotal,
    endtermScore,
    endtermMin,
    endtermMax,
    totalScore,
    maxTotal: 200,
    percentage,
  };
}
