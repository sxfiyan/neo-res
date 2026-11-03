"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Sparkles,
  User,
  AlertCircle,
  Printer,
  Award,
  FileText,
  Clock,
  ShieldCheck,
  BarChart3,
  Sun,
  Moon,
  HelpCircle,
  Calculator,
  Sliders,
  RotateCcw,
  Info,
} from "lucide-react";
import { StudentFullProfile, SemesterResult } from "@/lib/types";
import { calculateCourseScores, CourseScoreBreakdown } from "@/lib/marksCalculator";

function getGradeFromTotal(total: number): string {
  if (total >= 180) return "O";
  if (total >= 160) return "A+";
  if (total >= 140) return "A";
  if (total >= 120) return "B+";
  if (total >= 110) return "B";
  if (total >= 100) return "C";
  if (total >= 80) return "D";
  return "F";
}

export default function Home() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeTab, setActiveTab] = useState<"results" | "marks" | "timeline" | "reval">("results");
  const [searchRegno, setSearchRegno] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<StudentFullProfile | null>(null);
  const [getError, setGetError] = useState<string | null>(null);
  const [requestLog, setRequestLog] = useState<{ time: number; status: number } | null>(null);
  const [selectedSemesterIdx, setSelectedSemesterIdx] = useState<number>(0);
  const [simulationValues, setSimulationValues] = useState<Record<string, number>>({});
  const [showSimulator, setShowSimulator] = useState<Record<string, boolean>>({});

  // Sync theme with HTML data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleFetchResults = async (regnoTarget?: string) => {
    const target = (regnoTarget || searchRegno).trim().toUpperCase();
    if (!target) return;

    setIsLoading(true);
    setGetError(null);
    const start = performance.now();

    try {
      const res = await fetch(`/api/results?regno=${encodeURIComponent(target)}`);
      const elapsed = Math.round(performance.now() - start);
      const json = await res.json();

      setRequestLog({ time: elapsed, status: res.status });

      if (!res.ok || !json.success) {
        throw new Error(json.error || `Failed to fetch records (HTTP ${res.status})`);
      }

      setProfile(json.data);
      setSelectedSemesterIdx(0);
    } catch (err: any) {
      setGetError(err.message || "An error occurred while querying the university portal.");
    } finally {
      setIsLoading(false);
    }
  };

  const currentSemester: SemesterResult | null =
    profile && profile.semesters[selectedSemesterIdx]
      ? profile.semesters[selectedSemesterIdx]
      : null;

  // Adaptive High-Contrast Monochromatic Grade Badges
  const getGradeBadge = (grade: string) => {
    const g = grade.trim().toUpperCase();
    if (g === "O") {
      return "neu-badge-o font-black px-3 py-1";
    }
    if (g === "A+" || g === "A") {
      return "neu-badge-a font-bold px-3 py-1";
    }
    if (g === "B+" || g === "B") {
      return "neu-flat font-bold px-3 py-1 neu-text-primary";
    }
    if (g === "C" || g === "D") {
      return "neu-inset-sm px-3 py-1 neu-text-secondary font-medium";
    }
    if (g === "F") {
      return "neu-inset-sm font-black px-3 py-1 neu-text-primary border border-current";
    }
    return "neu-flat px-3 py-1 neu-text-secondary font-medium";
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 w-full">
      {/* =========================================================================
          TOP HEADER: NEOMORPHIC CARD
          ========================================================================= */}
      <header className="neu-card p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 neu-pill-inset px-3.5 py-1 text-xs font-mono tracking-wider mb-3 neu-text-secondary font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              NEOMORPHIC ACADEMIC ENGINE
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight neu-text-primary uppercase">
              NEO-RES
            </h1>
            <p className="text-sm md:text-base neu-text-secondary mt-1 font-medium">
              Tactile university examination gateway & academic performance inspector
            </p>
          </div>

          {/* Theme Switcher & Status Badges */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="neu-btn p-3 rounded-full flex items-center justify-center neu-text-primary"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Neomorphism`}
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <span className="neu-pill px-3.5 py-1.5 text-xs font-mono font-bold flex items-center gap-2 neu-text-primary">
              <span className="w-2 h-2 rounded-full bg-current inline-block"></span>
              PORTAL: 064
            </span>
          </div>
        </div>

        {/* Search Bar Input (Sunken Inset Surface) */}
        <div className="mt-8 pt-6 neu-divider-t">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleFetchResults();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={searchRegno}
                onChange={(e) => setSearchRegno(e.target.value)}
                placeholder="Enter Student Registration / Roll Number..."
                className="w-full neu-inset px-5 py-4 font-mono text-base font-bold tracking-wide uppercase focus:outline-none transition-all neu-text-primary placeholder:neu-text-muted"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="neu-btn px-8 py-4 font-black text-sm tracking-wide uppercase flex items-center justify-center gap-2 shrink-0 active:scale-95 neu-text-primary"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin text-lg">○</span>
                  LOADING...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  QUERY RECORDS
                </>
              )}
            </button>
          </form>

          {/* Format Guideline */}
          <div className="mt-3 flex items-center gap-2 text-xs font-mono neu-text-muted">
            <span className="neu-pill-inset px-2.5 py-0.5 font-bold neu-text-secondary">INPUT</span>
            <span>Enter any valid university roll number (e.g. 20241XXXXXXX) to retrieve records.</span>
          </div>
        </div>

        {/* Tactile Navigation Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mt-8 pt-6 neu-divider-t">
          <button
            onClick={() => setActiveTab("results")}
            className={`neu-btn py-3 px-3 text-xs md:text-sm font-bold flex items-center justify-center gap-2 ${
              activeTab === "results" ? "neu-btn-active font-black" : "neu-text-secondary"
            }`}
          >
            <Award className="w-4 h-4" />
            1. GRADE CARDS ({profile ? profile.semesters.length : 0})
          </button>

          <button
            onClick={() => setActiveTab("marks")}
            className={`neu-btn py-3 px-3 text-xs md:text-sm font-bold flex items-center justify-center gap-2 ${
              activeTab === "marks" ? "neu-btn-active font-black" : "neu-text-secondary"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            2. RAW MARKS
          </button>

          <button
            onClick={() => setActiveTab("timeline")}
            className={`neu-btn py-3 px-3 text-xs md:text-sm font-bold flex items-center justify-center gap-2 ${
              activeTab === "timeline" ? "neu-btn-active font-black" : "neu-text-secondary"
            }`}
          >
            <Clock className="w-4 h-4" />
            3. TIMELINE ({profile ? profile.history.length : 0})
          </button>

          <button
            onClick={() => setActiveTab("reval")}
            className={`neu-btn py-3 px-3 text-xs md:text-sm font-bold flex items-center justify-center gap-2 ${
              activeTab === "reval" ? "neu-btn-active font-black" : "neu-text-secondary"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            4. REVALUATION
          </button>
        </div>
      </header>

      {/* Telemetry / Execution Log */}
      {requestLog && (
        <div className="neu-inset-sm p-3 mb-6 flex flex-wrap items-center justify-between gap-2 text-xs font-mono neu-text-secondary">
          <div className="flex items-center gap-2">
            <span className="neu-pill px-2 py-0.5 neu-text-primary font-bold">200 OK</span>
            <span>Gateway session resolved successfully</span>
          </div>
          <div>
            Latency: <span className="neu-text-primary font-bold">{requestLog.time}ms</span>
          </div>
        </div>
      )}

      {/* Error Card */}
      {getError && (
        <div className="neu-card p-6 mb-8 border border-current flex items-start gap-4">
          <AlertCircle className="w-6 h-6 neu-text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-base uppercase neu-text-primary">Query Execution Error</h3>
            <p className="font-mono text-sm neu-text-secondary mt-1">{getError}</p>
          </div>
        </div>
      )}

      {/* =========================================================================
          EMPTY STATE / WELCOME WELL
          ========================================================================= */}
      {!profile && !isLoading && !getError && (
        <div className="neu-card p-10 md:p-14 text-center mb-8">
          <div className="w-20 h-20 neu-inset rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-8 h-8 neu-text-secondary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2 neu-text-primary">
            No Student Record Loaded
          </h2>
          <p className="neu-text-secondary max-w-md mx-auto text-sm font-medium mb-8">
            Enter a student registration number in the field above to inspect provisional grade cards, internal component scores, and degree timeline.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left font-mono text-xs max-w-3xl mx-auto">
            <div className="neu-flat p-4">
              <span className="font-black neu-text-primary block mb-1">1. GRADE CARDS</span>
              <span className="neu-text-secondary">SGPA & CGPA with credits registered & earned.</span>
            </div>
            <div className="neu-flat p-4">
              <span className="font-black neu-text-primary block mb-1">2. RAW MARKS</span>
              <span className="neu-text-secondary">End-Term, Mid-Term, CA, & Practical lab scores.</span>
            </div>
            <div className="neu-flat p-4">
              <span className="font-black neu-text-primary block mb-1">3. TIMELINE</span>
              <span className="neu-text-secondary">Chronological history with declaration dates.</span>
            </div>
            <div className="neu-flat p-4">
              <span className="font-black neu-text-primary block mb-1">4. REVALUATION</span>
              <span className="neu-text-secondary">Challenge valuation eligibility & review clauses.</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          STUDENT PROFILE CARD (NEOMORPHIC EMBOSSED)
          ========================================================================= */}
      {profile && (
        <div className="neu-card p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {profile.student.photopath ? (
              <div className="neu-flat p-1 rounded-2xl shrink-0">
                <img
                  src={profile.student.photopath}
                  alt={profile.student.name}
                  className="w-28 h-32 object-cover rounded-xl"
                />
              </div>
            ) : (
              <div className="w-28 h-32 neu-inset rounded-2xl flex items-center justify-center shrink-0">
                <User className="w-12 h-12 neu-text-muted" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="neu-pill-inset font-mono text-xs font-bold px-3 py-1 neu-text-primary">
                  {profile.regno}
                </span>
                <span className="neu-pill font-mono text-xs font-bold px-3 py-1 neu-text-primary">
                  {profile.semesters.length} EXAMINATION SESSIONS
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight neu-text-primary">
                {profile.student.name || "Student"}
              </h2>

              <p className="font-bold text-sm neu-text-secondary mt-1">
                {profile.student.degree || "Bachelor of Technology"}
              </p>
              <p className="text-xs neu-text-muted font-mono mt-0.5 font-medium">
                {profile.student.collname || "Presidency University, Bengaluru"}
              </p>

              {(profile.student.FATNAME || profile.student.MOTNAME) && (
                <div className="mt-4 pt-3 neu-divider-t text-xs font-mono neu-text-secondary flex flex-wrap gap-4 font-medium">
                  {profile.student.FATNAME && <span>Father: {profile.student.FATNAME}</span>}
                  {profile.student.MOTNAME && <span>Mother: {profile.student.MOTNAME}</span>}
                </div>
              )}
            </div>

            <button
              onClick={() => window.print()}
              className="neu-btn px-4 py-2.5 text-xs font-mono font-bold flex items-center gap-1.5 self-start shrink-0 neu-text-primary"
            >
              <Printer className="w-4 h-4" />
              PRINT / PDF
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          FEATURE 1: DETAILED GRADE CARDS
          ========================================================================= */}
      {activeTab === "results" && profile && (
        <section className="space-y-6">
          {profile.semesters.map((sem, sIdx) => (
            <div key={sem.yearmode || sIdx} className="neu-card p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 neu-divider-b gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="neu-pill-inset font-mono text-xs font-bold px-3 py-0.5 neu-text-primary">
                      SESSION: {sem.yearmode}
                    </span>
                    <span className="neu-pill font-mono text-xs px-2.5 py-0.5 neu-text-secondary font-bold">
                      {sem.subjects.length} COURSES
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black uppercase neu-text-primary">
                    {sem.examname}
                  </h3>
                  {sem.examdate && (
                    <p className="text-xs font-mono neu-text-muted mt-1 font-medium">
                      Session: {sem.examdate} {sem.resdate ? `| Result: ${sem.resdate}` : ""}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedSemesterIdx(sIdx);
                    setActiveTab("marks");
                  }}
                  className="neu-btn px-4 py-2 text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 neu-text-primary"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  RAW COMPONENT SCORES
                </button>
              </div>

              {/* 4 Soft Metric Displays */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 my-6">
                <div className="neu-flat p-4 text-center">
                  <span className="block font-mono text-xs neu-text-muted uppercase font-bold">
                    Credits Registered
                  </span>
                  <span className="text-2xl font-black font-mono mt-1 block neu-text-primary">
                    {sem.credits_registered || "—"}
                  </span>
                </div>
                <div className="neu-flat p-4 text-center">
                  <span className="block font-mono text-xs neu-text-muted uppercase font-bold">
                    Credits Earned
                  </span>
                  <span className="text-2xl font-black font-mono mt-1 block neu-text-primary">
                    {sem.credits_earned || "—"}
                  </span>
                </div>
                <div className="neu-inset p-4 text-center">
                  <span className="block font-mono text-xs neu-text-muted uppercase font-bold">
                    SGPA
                  </span>
                  <span className="text-3xl font-black font-mono mt-1 block neu-text-primary">
                    {sem.sgpa || "—"}
                  </span>
                </div>
                <div className="neu-inset p-4 text-center">
                  <span className="block font-mono text-xs neu-text-muted uppercase font-bold">
                    CGPA
                  </span>
                  <span className="text-3xl font-black font-mono mt-1 block neu-text-primary">
                    {sem.cgpa || "—"}
                  </span>
                </div>
              </div>

              {/* Subjects Table (Clean High-Contrast Surface) */}
              <div className="neu-inset p-2 rounded-2xl overflow-x-auto">
                <table className="w-full text-left font-sans border-collapse">
                  <thead>
                    <tr className="font-mono text-xs uppercase neu-text-secondary neu-divider-b font-bold">
                      <th className="p-3 w-12 text-center">#</th>
                      <th className="p-3">Course Code</th>
                      <th className="p-3">Course Title</th>
                      <th className="p-3 w-24 text-center">Credits</th>
                      <th className="p-3 w-32 text-center">Letter Grade</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-xs">
                    {sem.subjects.map((sub, idx) => (
                      <tr
                        key={idx}
                        className="neu-divider-b last:border-none transition-colors hover:bg-black/5"
                      >
                        <td className="p-3 text-center neu-text-muted font-bold">
                          {sub.slno || idx + 1}
                        </td>
                        <td className="p-3 font-bold neu-text-primary">{sub.subshort}</td>
                        <td className="p-3 font-sans font-bold neu-text-secondary">
                          {sub.subname}
                        </td>
                        <td className="p-3 text-center font-bold neu-text-primary">{sub.no_of_credits}</td>
                        <td className="p-3 text-center">
                          <span className={`inline-block ${getGradeBadge(sub.grade)}`}>
                            {sub.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* =========================================================================
          FEATURE 2: RAW COMPONENT MARKS (getBriefResults)
          ========================================================================= */}
      {activeTab === "marks" && profile && (
        <section className="space-y-6">
          <div className="neu-card p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 neu-divider-b gap-3 mb-6">
              <div>
                <span className="neu-pill-inset font-mono text-xs font-bold px-3 py-0.5 neu-text-primary">
                  RAW ASSESSMENT SCORES
                </span>
                <h2 className="text-xl md:text-2xl font-black uppercase mt-1.5 neu-text-primary">
                  Course Component Marks Breakdown
                </h2>
                <p className="text-xs font-mono neu-text-muted mt-1 font-medium">
                  200-Mark Unified Evaluation: Continuous Assessment (CA) + Midterm + Calculated Endterm.
                </p>
              </div>

              {/* Semester Switcher Dropdown */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold neu-text-secondary">Session:</span>
                <select
                  value={selectedSemesterIdx}
                  onChange={(e) => setSelectedSemesterIdx(Number(e.target.value))}
                  className="neu-inset px-4 py-2 font-mono text-xs font-bold focus:outline-none cursor-pointer neu-text-primary"
                >
                  {profile.semesters.map((s, idx) => (
                    <option key={idx} value={idx}>
                      {s.examname} ({s.yearmode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 200-Mark Formula Architecture Banner */}
            <div className="neu-inset p-4 md:p-5 rounded-2xl mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 neu-divider-b">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 neu-text-primary" />
                  <span className="font-mono text-xs font-black uppercase neu-text-primary">
                    200-Mark Evaluation Architecture
                  </span>
                </div>
                <span className="neu-pill font-mono text-xs font-bold px-3 py-0.5 neu-text-primary">
                  CA (50) + MIDTERM (50) + ENDTERM (100) = 200 MARKS
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-xs font-mono">
                <div className="neu-flat p-3">
                  <span className="block font-bold neu-text-primary">1. CA / Assignment (50)</span>
                  <span className="text-[11px] neu-text-muted mt-0.5 block">
                    Continuous internal assignments, quizzes & coursework.
                  </span>
                </div>
                <div className="neu-flat p-3">
                  <span className="block font-bold neu-text-primary">2. Midterm Exam (50)</span>
                  <span className="text-[11px] neu-text-muted mt-0.5 block">
                    Mid-semester written test evaluating course knowledge.
                  </span>
                </div>
                <div className="neu-flat p-3">
                  <span className="block font-bold neu-text-primary">3. Endterm Exam (100)</span>
                  <span className="text-[11px] neu-text-muted mt-0.5 block">
                    Derived from official awarded grade & percentage threshold.
                  </span>
                </div>
              </div>
            </div>

            {currentSemester && currentSemester.componentMarks && currentSemester.componentMarks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentSemester.componentMarks.map((item, idx) => {
                  const matchedSubject = currentSemester.subjects.find(
                    (s) =>
                      s.subname.trim().toLowerCase() === item.subname.trim().toLowerCase() ||
                      s.slno === item.slno
                  );

                  const courseKey = `${currentSemester.yearmode}-${item.slno}`;
                  const breakdown = calculateCourseScores(
                    item.slno,
                    item.subname,
                    item.subshort || matchedSubject?.subshort || "",
                    item.grade || matchedSubject?.grade || "—",
                    item.components
                  );

                  // Simulated Endterm value if active
                  const isSimulating = showSimulator[courseKey] || false;
                  const simEndterm =
                    simulationValues[courseKey] !== undefined
                      ? simulationValues[courseKey]
                      : breakdown.endtermScore ?? 50;

                  const effectiveEndterm = isSimulating ? simEndterm : breakdown.endtermScore;
                  const effectiveTotal =
                    !breakdown.isPractical && effectiveEndterm !== undefined
                      ? Math.round(((breakdown.internalTotal ?? 0) + effectiveEndterm) * 10) / 10
                      : breakdown.totalScore;
                  const effectiveGrade =
                    isSimulating && typeof effectiveTotal === "number"
                      ? getGradeFromTotal(effectiveTotal)
                      : breakdown.grade;

                  return (
                    <div key={idx} className="neu-flat p-5 flex flex-col justify-between">
                      <div>
                        {/* Course Header */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold neu-text-muted">
                              #{item.slno}
                            </span>
                            {breakdown.subshort && (
                              <span className="neu-pill-inset font-mono text-[10px] font-bold px-2 py-0.5 neu-text-primary">
                                {breakdown.subshort}
                              </span>
                            )}
                            <span className="neu-pill font-mono text-[10px] px-2 py-0.5 neu-text-secondary font-bold">
                              {breakdown.isPractical ? "100M PRACTICAL" : "200M EVALUATION"}
                            </span>
                          </div>

                          <span className={`inline-block text-xs ${getGradeBadge(effectiveGrade)}`}>
                            {effectiveGrade}
                          </span>
                        </div>

                        <h4 className="font-black text-sm neu-text-primary uppercase mb-4 leading-snug">
                          {item.subname}
                        </h4>
                      </div>

                      {/* Marks Breakdown */}
                      <div className="space-y-3 pt-3 neu-divider-t">
                        {breakdown.isPractical ? (
                          /* Practical / Lab Single 100M Evaluation */
                          <div className="neu-inset-sm p-3 font-mono text-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="neu-text-secondary font-bold">
                                Practical & Continuous Lab Evaluation
                              </span>
                              <span className="neu-pill font-black px-2.5 py-0.5 neu-text-primary">
                                {breakdown.practicalScore} / 100 MARKS
                              </span>
                            </div>
                            <div className="w-full bg-black/10 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-current h-full rounded-full transition-all"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.max(0, Number(breakdown.practicalScore) || 0)
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          /* Theory Course 200M Three Components */
                          <>
                            {/* Component 1: CA (Continuous Assessment / Assignment) */}
                            <div className="neu-inset-sm p-3 font-mono text-xs space-y-1.5">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="neu-text-primary font-bold block">
                                    1. CA (Continuous Assessment)
                                  </span>
                                  <span className="neu-text-muted text-[10px] font-medium">
                                    Assignments, quizzes & coursework
                                  </span>
                                </div>
                                <span className="neu-pill font-black px-2.5 py-0.5 neu-text-primary">
                                  {breakdown.caScore !== undefined ? `${breakdown.caScore} / 50` : "—"}
                                </span>
                              </div>
                              {breakdown.caScore !== undefined && (
                                <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-current h-full rounded-full"
                                    style={{
                                      width: `${Math.min(100, (breakdown.caScore / 50) * 100)}%`,
                                    }}
                                  />
                                </div>
                              )}
                            </div>

                            {/* Component 2: Midterm Exam */}
                            <div className="neu-inset-sm p-3 font-mono text-xs space-y-1.5">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="neu-text-primary font-bold block">
                                    2. Midterm Examination
                                  </span>
                                  <span className="neu-text-muted text-[10px] font-medium">
                                    Mid-semester formal evaluation
                                  </span>
                                </div>
                                <span className="neu-pill font-black px-2.5 py-0.5 neu-text-primary">
                                  {breakdown.midtermScore !== undefined
                                    ? `${breakdown.midtermScore} / 50`
                                    : "—"}
                                </span>
                              </div>
                              {breakdown.midtermScore !== undefined && (
                                <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-current h-full rounded-full"
                                    style={{
                                      width: `${Math.min(100, (breakdown.midtermScore / 50) * 100)}%`,
                                    }}
                                  />
                                </div>
                              )}
                            </div>

                            {/* Component 3: Endterm Exam (Calculated) */}
                            <div className="neu-inset-sm p-3 font-mono text-xs space-y-1.5">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="neu-text-primary font-bold">
                                      3. Endterm Examination
                                    </span>
                                    <span className="neu-pill-inset text-[9px] px-1.5 py-0.2 font-bold neu-text-secondary">
                                      {isSimulating ? "SIMULATED" : "CALCULATED"}
                                    </span>
                                  </div>
                                  <span className="neu-text-muted text-[10px] font-medium block">
                                    {isSimulating
                                      ? "Adjust slider below to simulate outcome"
                                      : `Est. range: ${breakdown.endtermMin ?? 0}–${breakdown.endtermMax ?? 100} based on ${breakdown.grade}`}
                                  </span>
                                </div>
                                <span className="neu-pill font-black px-2.5 py-0.5 neu-text-primary">
                                  {effectiveEndterm !== undefined ? `~${effectiveEndterm} / 100` : "—"}
                                </span>
                              </div>
                              {effectiveEndterm !== undefined && (
                                <div className="w-full bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-current h-full rounded-full"
                                    style={{
                                      width: `${Math.min(100, (effectiveEndterm / 100) * 100)}%`,
                                    }}
                                  />
                                </div>
                              )}
                            </div>

                            {/* Interactive Simulation Slider (if toggled) */}
                            {isSimulating && (
                              <div className="neu-inset p-3 rounded-xl font-mono text-xs space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="neu-text-secondary font-bold flex items-center gap-1">
                                    <Sliders className="w-3.5 h-3.5" />
                                    Simulate Endterm Mark:
                                  </span>
                                  <span className="neu-pill font-black px-2 py-0.5 neu-text-primary">
                                    {effectiveEndterm} / 100
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  step="0.5"
                                  value={effectiveEndterm ?? 50}
                                  onChange={(e) =>
                                    setSimulationValues((prev) => ({
                                      ...prev,
                                      [courseKey]: parseFloat(e.target.value),
                                    }))
                                  }
                                  className="w-full cursor-pointer accent-current"
                                />
                                <div className="flex justify-between text-[10px] neu-text-muted font-bold">
                                  <span>0</span>
                                  <span>50</span>
                                  <span>100</span>
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {/* Combined Total Surface */}
                        <div className="neu-inset p-3.5 rounded-xl font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="neu-text-muted uppercase text-[10px] font-bold">
                                {breakdown.isPractical
                                  ? "Course Total (out of 100)"
                                  : "Unified Total (out of 200)"}
                              </span>
                              {isSimulating && (
                                <span className="neu-pill-inset text-[9px] px-1.5 py-0.2 font-bold neu-text-secondary">
                                  SIMULATED
                                </span>
                              )}
                            </div>
                            <span className="text-lg font-black neu-text-primary block mt-0.5">
                              {effectiveTotal} / {breakdown.maxTotal} MARKS
                            </span>
                            {!breakdown.isPractical && (
                              <span className="text-[10px] neu-text-muted font-medium">
                                {breakdown.caScore ?? 0} (CA) + {breakdown.midtermScore ?? 0} (Mid) +{" "}
                                {effectiveEndterm ?? 0} (End)
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {!breakdown.isPractical && (
                              <button
                                onClick={() => {
                                  setShowSimulator((prev) => ({
                                    ...prev,
                                    [courseKey]: !prev[courseKey],
                                  }));
                                  if (isSimulating) {
                                    setSimulationValues((prev) => {
                                      const next = { ...prev };
                                      delete next[courseKey];
                                      return next;
                                    });
                                  }
                                }}
                                className="neu-btn px-2.5 py-1 text-[10px] font-mono font-bold flex items-center gap-1 neu-text-primary"
                                title="Toggle What-If Endterm simulator"
                              >
                                {isSimulating ? (
                                  <>
                                    <RotateCcw className="w-3 h-3" />
                                    RESET
                                  </>
                                ) : (
                                  <>
                                    <Sliders className="w-3 h-3" />
                                    WHAT-IF
                                  </>
                                )}
                              </button>
                            )}
                            <span
                              className={`inline-block font-black px-2.5 py-1 ${getGradeBadge(
                                effectiveGrade
                              )}`}
                            >
                              {effectiveGrade}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="neu-inset p-10 text-center">
                <FileText className="w-10 h-10 mx-auto neu-text-muted mb-2" />
                <p className="font-mono text-sm neu-text-secondary font-bold">
                  No component breakdown returned for this session.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* =========================================================================
          FEATURE 3: DEGREE TIMELINE (getResultSummaryDetailsnew)
          ========================================================================= */}
      {activeTab === "timeline" && profile && (
        <section className="space-y-6">
          <div className="neu-card p-6 md:p-8">
            <div className="pb-5 neu-divider-b mb-6">
              <span className="neu-pill-inset font-mono text-xs font-bold px-3 py-0.5 neu-text-primary">
                EXAMINATION TRANSCRIPT
              </span>
              <h2 className="text-xl md:text-2xl font-black uppercase mt-1.5 neu-text-primary">
                Degree Milestones & Historical Record
              </h2>
              <p className="text-xs font-mono neu-text-muted mt-1 font-medium">
                Official declaration records, result dates, and degree progress.
              </p>
            </div>

            {profile.history && profile.history.length > 0 ? (
              <div className="space-y-4">
                {profile.history.map((hist, idx) => (
                  <div
                    key={idx}
                    className="neu-flat p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="neu-pill-inset font-mono text-xs font-bold px-2.5 py-0.5 neu-text-primary">
                          {hist.yearmode}
                        </span>
                        <span className="neu-pill font-mono text-xs font-bold px-2.5 py-0.5 neu-text-primary">
                          {hist.classStatus}
                        </span>
                      </div>

                      <h3 className="text-xl font-black uppercase neu-text-primary">{hist.examname}</h3>
                      <p className="text-xs neu-text-secondary mt-0.5 font-bold">{hist.degree}</p>
                      <p className="font-mono text-xs neu-text-muted mt-0.5 font-medium">{hist.college}</p>
                    </div>

                    <div className="neu-inset p-4 font-mono text-xs shrink-0 md:text-right">
                      <div className="neu-text-muted uppercase font-bold">Session:</div>
                      <div className="font-bold neu-text-primary">{hist.examdate}</div>
                      <div className="neu-text-muted uppercase font-bold mt-1.5">Result Date:</div>
                      <div className="font-black neu-text-primary">{hist.resdate || "—"}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="neu-inset p-10 text-center">
                <Clock className="w-10 h-10 mx-auto neu-text-muted mb-2" />
                <p className="font-mono text-sm neu-text-secondary font-bold">
                  No historical transcript found.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* =========================================================================
          FEATURE 4: REVALUATION PORTAL (showRVExam)
          ========================================================================= */}
      {activeTab === "reval" && profile && (
        <section className="space-y-6">
          <div className="neu-card p-6 md:p-8">
            <div className="pb-5 neu-divider-b mb-6">
              <span className="neu-pill-inset font-mono text-xs font-bold px-3 py-0.5 neu-text-primary">
                REGULATIONS & REVIEW
              </span>
              <h2 className="text-xl md:text-2xl font-black uppercase mt-1.5 neu-text-primary">
                Re-Evaluation & Challenge Valuation
              </h2>
              <p className="text-xs font-mono neu-text-muted mt-1 font-medium">
                Review eligibility, official academic clauses, and digital script guidelines.
              </p>
            </div>

            <h3 className="font-mono text-xs font-bold uppercase neu-text-secondary mb-3">
              Examination Sessions Mapped for Student Review:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {profile.semesters.map((sem, idx) => (
                <div key={idx} className="neu-flat p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="neu-pill-inset font-mono text-xs font-bold px-2.5 py-0.5 neu-text-primary">
                      CYCLE: {sem.yearmode}
                    </span>
                    <span className="neu-pill font-mono text-[10px] font-bold px-2 py-0.5 neu-text-primary">
                      ELIGIBLE
                    </span>
                  </div>
                  <h4 className="font-bold text-base uppercase neu-text-primary">{sem.examname}</h4>
                  <p className="font-mono text-xs neu-text-muted mt-1 font-medium">
                    Declaration: {sem.resdate || "Official Publication"}
                  </p>
                </div>
              ))}
            </div>

            {/* Academic Regulations Extract */}
            <div className="neu-inset p-6 rounded-2xl">
              <h3 className="text-base font-bold uppercase mb-4 flex items-center gap-2 neu-text-primary">
                <HelpCircle className="w-4 h-4" />
                Extracts of Academic Regulations (Clause 13.2)
              </h3>

              <div className="space-y-3 font-sans text-xs md:text-sm neu-text-secondary leading-relaxed">
                <div className="p-3 neu-flat">
                  <strong className="neu-text-primary">1. 5-Day Window:</strong> No request for review of grade(s) or challenge valuation shall be admissible after <strong>five (5) University working days</strong> from the date of declaration of results.
                </div>
                <div className="p-3 neu-flat">
                  <strong className="neu-text-primary">2. Digital Script View:</strong> Evaluated answer booklets can be accessed when active. Outside this period, the valuation system returns <em>&quot;Date are not Enabled&quot;</em>.
                </div>
                <div className="p-3 neu-flat">
                  <strong className="neu-text-primary">3. Integrity:</strong> Altering or tampering with provisional result grade cards is strictly prohibited.
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
