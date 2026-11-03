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
  ChevronRight,
  Layers,
  HelpCircle,
} from "lucide-react";
import { StudentFullProfile, SemesterResult } from "@/lib/types";

export default function Home() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeTab, setActiveTab] = useState<"results" | "marks" | "timeline" | "reval">("results");
  const [searchRegno, setSearchRegno] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<StudentFullProfile | null>(null);
  const [getError, setGetError] = useState<string | null>(null);
  const [requestLog, setRequestLog] = useState<{ time: number; status: number } | null>(null);
  const [selectedSemesterIdx, setSelectedSemesterIdx] = useState<number>(0);

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

  // Pure Monochrome Neomorphic Grade Badge Styling
  const getGradeBadge = (grade: string) => {
    const g = grade.trim().toUpperCase();
    if (g === "O") {
      return "bg-white text-black font-black neu-flat border border-white/20";
    }
    if (g === "A+" || g === "A") {
      return "bg-neutral-200 text-black font-bold neu-flat";
    }
    if (g === "B+" || g === "B") {
      return "bg-neutral-800 text-white font-bold neu-flat border border-white/10";
    }
    if (g === "C" || g === "D") {
      return "bg-neutral-900 text-neutral-300 neu-inset-sm";
    }
    if (g === "F") {
      return "bg-black text-neutral-400 border border-white/40 neu-inset-sm font-black";
    }
    return "bg-neutral-800 text-neutral-200 neu-flat";
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 w-full">
      {/* =========================================================================
          TOP HEADER: NEOMORPHIC CARD
          ========================================================================= */}
      <header className="neu-card p-6 md:p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 neu-pill-inset px-3.5 py-1 text-xs font-mono tracking-wider mb-3 text-neutral-400">
              <Sparkles className="w-3.5 h-3.5 text-neutral-200" />
              NEOMORPHIC ACADEMIC ENGINE
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-current uppercase">
              NEO-RES
            </h1>
            <p className="text-sm md:text-base text-neutral-400 mt-1 font-medium">
              Tactile university examination gateway & academic performance inspector
            </p>
          </div>

          {/* Theme Switcher & Status Badges */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="neu-btn p-3 rounded-full flex items-center justify-center text-current"
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Neomorphism`}
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <span className="neu-pill px-3.5 py-1.5 text-xs font-mono font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white inline-block"></span>
              PORTAL: 064
            </span>
          </div>
        </div>

        {/* Search Bar Input (Sunken Inset Surface) */}
        <div className="mt-8 pt-6 border-t border-white/5">
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
                className="w-full neu-inset px-5 py-4 font-mono text-base font-medium tracking-wide uppercase focus:outline-none transition-all placeholder:text-neutral-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="neu-btn px-8 py-4 font-bold text-sm tracking-wide uppercase flex items-center justify-center gap-2 shrink-0 active:scale-95"
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
          <div className="mt-3 flex items-center gap-2 text-xs font-mono text-neutral-500">
            <span className="neu-pill-inset px-2.5 py-0.5 font-bold">INPUT</span>
            <span>Enter any valid university roll number (e.g. 20241XXXXXXX) to retrieve records.</span>
          </div>
        </div>

        {/* Tactile Navigation Tabs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mt-8 pt-6 border-t border-white/5">
          <button
            onClick={() => setActiveTab("results")}
            className={`neu-btn py-3 px-3 text-xs md:text-sm font-bold flex items-center justify-center gap-2 ${
              activeTab === "results" ? "neu-btn-active font-black" : ""
            }`}
          >
            <Award className="w-4 h-4" />
            1. GRADE CARDS ({profile ? profile.semesters.length : 0})
          </button>

          <button
            onClick={() => setActiveTab("marks")}
            className={`neu-btn py-3 px-3 text-xs md:text-sm font-bold flex items-center justify-center gap-2 ${
              activeTab === "marks" ? "neu-btn-active font-black" : ""
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            2. RAW MARKS
          </button>

          <button
            onClick={() => setActiveTab("timeline")}
            className={`neu-btn py-3 px-3 text-xs md:text-sm font-bold flex items-center justify-center gap-2 ${
              activeTab === "timeline" ? "neu-btn-active font-black" : ""
            }`}
          >
            <Clock className="w-4 h-4" />
            3. TIMELINE ({profile ? profile.history.length : 0})
          </button>

          <button
            onClick={() => setActiveTab("reval")}
            className={`neu-btn py-3 px-3 text-xs md:text-sm font-bold flex items-center justify-center gap-2 ${
              activeTab === "reval" ? "neu-btn-active font-black" : ""
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            4. REVALUATION
          </button>
        </div>
      </header>

      {/* Telemetry / Execution Log */}
      {requestLog && (
        <div className="neu-inset-sm p-3 mb-6 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="neu-pill px-2 py-0.5 text-white font-bold">200 OK</span>
            <span>Gateway session resolved</span>
          </div>
          <div>
            Latency: <span className="text-white font-bold">{requestLog.time}ms</span>
          </div>
        </div>
      )}

      {/* Error Card */}
      {getError && (
        <div className="neu-card p-6 mb-8 border border-white/20 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-white shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-base uppercase">Query Execution Error</h3>
            <p className="font-mono text-sm text-neutral-400 mt-1">{getError}</p>
          </div>
        </div>
      )}

      {/* =========================================================================
          EMPTY STATE / WELCOME WELL
          ========================================================================= */}
      {!profile && !isLoading && !getError && (
        <div className="neu-card p-10 md:p-14 text-center mb-8">
          <div className="w-20 h-20 neu-inset rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-8 h-8 text-neutral-400" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
            No Student Record Loaded
          </h2>
          <p className="text-neutral-400 max-w-md mx-auto text-sm mb-8">
            Enter a student registration number in the field above to inspect provisional grade cards, internal component scores, and degree timeline.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left font-mono text-xs max-w-3xl mx-auto">
            <div className="neu-flat p-4">
              <span className="font-bold text-white block mb-1">1. GRADE CARDS</span>
              <span className="text-neutral-400">SGPA & CGPA with credits registered & earned.</span>
            </div>
            <div className="neu-flat p-4">
              <span className="font-bold text-white block mb-1">2. RAW MARKS</span>
              <span className="text-neutral-400">End-Term, Mid-Term, CA, & Practical lab scores.</span>
            </div>
            <div className="neu-flat p-4">
              <span className="font-bold text-white block mb-1">3. TIMELINE</span>
              <span className="text-neutral-400">Chronological history with declaration dates.</span>
            </div>
            <div className="neu-flat p-4">
              <span className="font-bold text-white block mb-1">4. REVALUATION</span>
              <span className="text-neutral-400">Challenge valuation eligibility & review clauses.</span>
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
                <User className="w-12 h-12 text-neutral-500" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="neu-pill-inset font-mono text-xs font-bold px-3 py-1">
                  {profile.regno}
                </span>
                <span className="neu-pill font-mono text-xs font-medium px-3 py-1">
                  {profile.semesters.length} EXAMINATION SESSIONS
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-current">
                {profile.student.name || "Student"}
              </h2>

              <p className="font-medium text-sm text-neutral-300 mt-1">
                {profile.student.degree || "Bachelor of Technology"}
              </p>
              <p className="text-xs text-neutral-500 font-mono mt-0.5">
                {profile.student.collname || "Presidency University, Bengaluru"}
              </p>

              {(profile.student.FATNAME || profile.student.MOTNAME) && (
                <div className="mt-4 pt-3 border-t border-white/5 text-xs font-mono text-neutral-400 flex flex-wrap gap-4">
                  {profile.student.FATNAME && <span>Father: {profile.student.FATNAME}</span>}
                  {profile.student.MOTNAME && <span>Mother: {profile.student.MOTNAME}</span>}
                </div>
              )}
            </div>

            <button
              onClick={() => window.print()}
              className="neu-btn px-4 py-2.5 text-xs font-mono font-bold flex items-center gap-1.5 self-start shrink-0"
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/5 gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="neu-pill-inset font-mono text-xs font-bold px-3 py-0.5">
                      SESSION: {sem.yearmode}
                    </span>
                    <span className="neu-pill font-mono text-xs px-2.5 py-0.5 text-neutral-400">
                      {sem.subjects.length} COURSES
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold uppercase">{sem.examname}</h3>
                  {sem.examdate && (
                    <p className="text-xs font-mono text-neutral-500 mt-1">
                      Session: {sem.examdate} {sem.resdate ? `| Result: ${sem.resdate}` : ""}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedSemesterIdx(sIdx);
                    setActiveTab("marks");
                  }}
                  className="neu-btn px-4 py-2 text-xs font-mono font-bold flex items-center gap-1.5 shrink-0"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  RAW COMPONENT SCORES
                </button>
              </div>

              {/* 4 Soft Metric Displays */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 my-6">
                <div className="neu-flat p-4 text-center">
                  <span className="block font-mono text-xs text-neutral-400 uppercase font-medium">
                    Credits Registered
                  </span>
                  <span className="text-2xl font-bold font-mono mt-1 block">
                    {sem.credits_registered || "—"}
                  </span>
                </div>
                <div className="neu-flat p-4 text-center">
                  <span className="block font-mono text-xs text-neutral-400 uppercase font-medium">
                    Credits Earned
                  </span>
                  <span className="text-2xl font-bold font-mono mt-1 block">
                    {sem.credits_earned || "—"}
                  </span>
                </div>
                <div className="neu-inset p-4 text-center">
                  <span className="block font-mono text-xs text-neutral-400 uppercase font-medium">
                    SGPA
                  </span>
                  <span className="text-3xl font-black font-mono mt-1 block text-current">
                    {sem.sgpa || "—"}
                  </span>
                </div>
                <div className="neu-inset p-4 text-center">
                  <span className="block font-mono text-xs text-neutral-400 uppercase font-medium">
                    CGPA
                  </span>
                  <span className="text-3xl font-black font-mono mt-1 block text-current">
                    {sem.cgpa || "—"}
                  </span>
                </div>
              </div>

              {/* Subjects Table (Clean Monochrome Surface) */}
              <div className="neu-inset p-2 rounded-2xl overflow-x-auto">
                <table className="w-full text-left font-sans border-collapse">
                  <thead>
                    <tr className="font-mono text-xs uppercase text-neutral-400 border-b border-white/5">
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
                        className="border-b border-white/5 last:border-none transition-colors hover:bg-white/[0.02]"
                      >
                        <td className="p-3 text-center text-neutral-500 font-medium">
                          {sub.slno || idx + 1}
                        </td>
                        <td className="p-3 font-bold text-current">{sub.subshort}</td>
                        <td className="p-3 font-sans font-medium text-neutral-300">
                          {sub.subname}
                        </td>
                        <td className="p-3 text-center font-bold">{sub.no_of_credits}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-block px-3 py-1 text-xs rounded-full ${getGradeBadge(
                              sub.grade
                            )}`}
                          >
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/5 gap-3 mb-6">
              <div>
                <span className="neu-pill-inset font-mono text-xs font-bold px-3 py-0.5">
                  RAW ASSESSMENT SCORES
                </span>
                <h2 className="text-xl md:text-2xl font-bold uppercase mt-1.5">
                  Internal & External Component Scores
                </h2>
                <p className="text-xs font-mono text-neutral-500">
                  Direct breakdown for End-Term, Mid-Term, Continuous Assessment (CA), and Practicals.
                </p>
              </div>

              {/* Semester Switcher Dropdown */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-medium text-neutral-400">Session:</span>
                <select
                  value={selectedSemesterIdx}
                  onChange={(e) => setSelectedSemesterIdx(Number(e.target.value))}
                  className="neu-inset px-4 py-2 font-mono text-xs font-bold focus:outline-none cursor-pointer"
                >
                  {profile.semesters.map((s, idx) => (
                    <option key={idx} value={idx}>
                      {s.examname} ({s.yearmode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {currentSemester && currentSemester.componentMarks && currentSemester.componentMarks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentSemester.componentMarks.map((item, idx) => (
                  <div key={idx} className="neu-flat p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[11px] font-bold text-neutral-500">
                          COURSE #{item.slno}
                        </span>
                        <span className="neu-pill-inset font-mono text-[10px] px-2.5 py-0.5 text-neutral-400">
                          {item.components.length} ASSESSMENTS
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-current uppercase mb-4">
                        {item.subname}
                      </h4>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-white/5">
                      {item.components.map((comp, cIdx) => (
                        <div
                          key={cIdx}
                          className="neu-inset-sm px-3 py-2 flex items-center justify-between font-mono text-xs"
                        >
                          <span className="text-neutral-400 font-medium">{comp.component}</span>
                          <span className="neu-pill font-bold px-2.5 py-0.5 text-current">
                            {comp.score} MARKS
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="neu-inset p-10 text-center">
                <FileText className="w-10 h-10 mx-auto text-neutral-500 mb-2" />
                <p className="font-mono text-sm text-neutral-400">
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
            <div className="pb-5 border-b border-white/5 mb-6">
              <span className="neu-pill-inset font-mono text-xs font-bold px-3 py-0.5">
                EXAMINATION TRANSCRIPT
              </span>
              <h2 className="text-xl md:text-2xl font-bold uppercase mt-1.5">
                Degree Milestones & Historical Record
              </h2>
              <p className="text-xs font-mono text-neutral-500">
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
                        <span className="neu-pill-inset font-mono text-xs font-bold px-2.5 py-0.5">
                          {hist.yearmode}
                        </span>
                        <span className="neu-pill font-mono text-xs font-bold px-2.5 py-0.5 text-current">
                          {hist.classStatus}
                        </span>
                      </div>

                      <h3 className="text-xl font-bold uppercase text-current">{hist.examname}</h3>
                      <p className="text-xs text-neutral-400 mt-0.5 font-medium">{hist.degree}</p>
                      <p className="font-mono text-xs text-neutral-500 mt-0.5">{hist.college}</p>
                    </div>

                    <div className="neu-inset p-4 font-mono text-xs shrink-0 md:text-right">
                      <div className="text-neutral-500 uppercase font-medium">Session:</div>
                      <div className="font-bold text-current">{hist.examdate}</div>
                      <div className="text-neutral-500 uppercase font-medium mt-1.5">Result Date:</div>
                      <div className="font-black text-current">{hist.resdate || "—"}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="neu-inset p-10 text-center">
                <Clock className="w-10 h-10 mx-auto text-neutral-500 mb-2" />
                <p className="font-mono text-sm text-neutral-400">
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
            <div className="pb-5 border-b border-white/5 mb-6">
              <span className="neu-pill-inset font-mono text-xs font-bold px-3 py-0.5">
                REGULATIONS & REVIEW
              </span>
              <h2 className="text-xl md:text-2xl font-bold uppercase mt-1.5">
                Re-Evaluation & Challenge Valuation
              </h2>
              <p className="text-xs font-mono text-neutral-500">
                Review eligibility, official academic clauses, and digital script guidelines.
              </p>
            </div>

            <h3 className="font-mono text-xs font-bold uppercase text-neutral-400 mb-3">
              Examination Sessions Mapped for Student Review:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {profile.semesters.map((sem, idx) => (
                <div key={idx} className="neu-flat p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="neu-pill-inset font-mono text-xs font-bold px-2.5 py-0.5">
                      CYCLE: {sem.yearmode}
                    </span>
                    <span className="neu-pill font-mono text-[10px] font-bold px-2 py-0.5">
                      ELIGIBLE
                    </span>
                  </div>
                  <h4 className="font-bold text-base uppercase text-current">{sem.examname}</h4>
                  <p className="font-mono text-xs text-neutral-500 mt-1">
                    Declaration: {sem.resdate || "Official Publication"}
                  </p>
                </div>
              ))}
            </div>

            {/* Academic Regulations Extract */}
            <div className="neu-inset p-6 rounded-2xl">
              <h3 className="text-base font-bold uppercase mb-4 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-neutral-300" />
                Extracts of Academic Regulations (Clause 13.2)
              </h3>

              <div className="space-y-3 font-sans text-xs md:text-sm text-neutral-400 leading-relaxed">
                <div className="p-3 neu-flat">
                  <strong className="text-current">1. 5-Day Window:</strong> No request for review of grade(s) or challenge valuation shall be admissible after <strong>five (5) University working days</strong> from the date of declaration of results.
                </div>
                <div className="p-3 neu-flat">
                  <strong className="text-current">2. Digital Script View:</strong> Evaluated answer booklets can be accessed when active. Outside this period, the valuation system returns <em>&quot;Date are not Enabled&quot;</em>.
                </div>
                <div className="p-3 neu-flat">
                  <strong className="text-current">3. Integrity:</strong> Altering or tampering with provisional result grade cards is strictly prohibited.
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          FOOTER
          ========================================================================= */}
      <footer className="mt-12 neu-card p-6 font-mono text-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-500">
        <div>
          <span className="text-current font-bold">NEO-RES SUITE</span> &bull; Pure Monochrome Neomorphism
        </div>
        <div>
          Built for pair programming with Antigravity
        </div>
      </footer>
    </div>
  );
}
