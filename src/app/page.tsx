"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Sparkles,
  User,
  AlertCircle,
  Printer,
  Calendar,
  Layers,
  Award,
  FileText,
  Clock,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  BarChart3,
  ExternalLink,
} from "lucide-react";
import { StudentFullProfile, SemesterResult } from "@/lib/types";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"results" | "marks" | "timeline" | "reval">("results");
  const [searchRegno, setSearchRegno] = useState("20241CCS0134");
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<StudentFullProfile | null>(null);
  const [getError, setGetError] = useState<string | null>(null);
  const [requestLog, setRequestLog] = useState<{ time: number; status: number } | null>(null);
  const [selectedSemesterIdx, setSelectedSemesterIdx] = useState<number>(0);

  // Auto-fetch initial student on load
  useEffect(() => {
    handleFetchResults("20241CCS0134");
  }, []);

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

  const getGradeBadge = (grade: string) => {
    const g = grade.trim().toUpperCase();
    if (g === "O") return "bg-[#4ade80] text-black border-2 border-black";
    if (g === "A+") return "bg-[#38bdf8] text-black border-2 border-black";
    if (g === "A") return "bg-[#22d3ee] text-black border-2 border-black";
    if (g === "B+") return "bg-[#fde047] text-black border-2 border-black";
    if (g === "B") return "bg-[#fb923c] text-black border-2 border-black";
    if (g === "C") return "bg-[#e2e8f0] text-black border-2 border-black";
    if (g === "D") return "bg-[#cbd5e1] text-black border-2 border-black";
    if (g === "F") return "bg-[#f87171] text-black border-2 border-black";
    return "bg-neutral-100 text-black border-2 border-black";
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 w-full">
      {/* Top Header / Branding Banner */}
      <header className="neo-border bg-[#ffe600] p-6 neo-shadow-lg mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-black text-[#ffe600] px-3 py-1 font-mono text-xs font-black uppercase tracking-wider mb-2 neo-border-sm">
              <Sparkles className="w-3.5 h-3.5" />
              COE UNICLARE STUDENT SUITE
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase">
              ⚡ NEO-RES PORTAL
            </h1>
            <p className="font-bold text-sm md:text-base text-neutral-800 mt-1">
              Explore semester grade cards, internal component marks, and historical degree timelines
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="neo-border-sm bg-white font-mono text-xs font-bold px-3 py-1.5 neo-shadow-sm flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] inline-block border border-black"></span>
              PORTAL: 064
            </span>
            <span className="neo-border-sm bg-[#38bdf8] font-mono text-xs font-bold px-3 py-1.5 neo-shadow-sm flex items-center gap-1.5">
              LIVE GATEWAY
            </span>
          </div>
        </div>

        {/* Search Bar inside Header */}
        <div className="mt-6 pt-6 border-t-4 border-black">
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
                className="w-full neo-border px-4 py-3.5 font-mono text-base md:text-lg font-bold bg-[#fffdf0] uppercase focus:outline-none focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="neo-btn bg-black text-[#ffe600] px-8 py-3.5 text-base flex items-center justify-center gap-2 font-black shrink-0"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin text-xl">⚡</span>
                  LOADING...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  FETCH PROFILE
                </>
              )}
            </button>
          </form>

          {/* Quick Roll Number Chips */}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-mono font-bold">
            <span className="text-neutral-600 uppercase">Quick Lookup:</span>
            <button
              type="button"
              onClick={() => {
                setSearchRegno("20241CCS0134");
                handleFetchResults("20241CCS0134");
              }}
              className="neo-border-sm bg-white px-2.5 py-1 hover:bg-black hover:text-white transition-colors"
            >
              👉 20241CCS0134 (Sufiyan)
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchRegno("20241CCS0167");
                handleFetchResults("20241CCS0167");
              }}
              className="neo-border-sm bg-[#38bdf8] px-2.5 py-1 hover:bg-black hover:text-white transition-colors"
            >
              👉 20241CCS0167
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchRegno("20251CCS0103");
                handleFetchResults("20251CCS0103");
              }}
              className="neo-border-sm bg-[#4ade80] px-2.5 py-1 hover:bg-black hover:text-white transition-colors"
            >
              👉 20251CCS0103
            </button>
          </div>
        </div>

        {/* Feature Tabs */}
        <div className="flex flex-wrap gap-2 md:gap-3 mt-6 pt-6 border-t-3 border-black">
          <button
            onClick={() => setActiveTab("results")}
            className={`neo-btn px-4 py-2.5 text-xs md:text-sm flex items-center gap-2 ${
              activeTab === "results"
                ? "bg-black text-[#ffe600] translate-x-1 translate-y-1 shadow-none"
                : "bg-white text-black"
            }`}
          >
            <Award className="w-4 h-4" />
            1. GRADE CARDS ({profile ? profile.semesters.length : 0})
          </button>

          <button
            onClick={() => setActiveTab("marks")}
            className={`neo-btn px-4 py-2.5 text-xs md:text-sm flex items-center gap-2 ${
              activeTab === "marks"
                ? "bg-[#ff6b8b] text-black translate-x-1 translate-y-1 shadow-none"
                : "bg-white text-black"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            2. COMPONENT MARKS (RAW)
          </button>

          <button
            onClick={() => setActiveTab("timeline")}
            className={`neo-btn px-4 py-2.5 text-xs md:text-sm flex items-center gap-2 ${
              activeTab === "timeline"
                ? "bg-[#38bdf8] text-black translate-x-1 translate-y-1 shadow-none"
                : "bg-white text-black"
            }`}
          >
            <Clock className="w-4 h-4" />
            3. DEGREE TIMELINE ({profile ? profile.history.length : 0})
          </button>

          <button
            onClick={() => setActiveTab("reval")}
            className={`neo-btn px-4 py-2.5 text-xs md:text-sm flex items-center gap-2 ${
              activeTab === "reval"
                ? "bg-[#4ade80] text-black translate-x-1 translate-y-1 shadow-none"
                : "bg-white text-black"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            4. REVALUATION & REVIEW
          </button>
        </div>
      </header>

      {/* Telemetry / Request Log */}
      {requestLog && (
        <div className="neo-border bg-black text-[#4ade80] font-mono text-xs p-3 neo-shadow-sm mb-6 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-[#4ade80] text-black font-black px-1.5 py-0.5">GATEWAY 200 OK</span>
            <span>Queried University Multi-Endpoint API</span>
          </div>
          <div className="text-neutral-400">
            Response Time: <span className="text-white font-bold">{requestLog.time}ms</span>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {getError && (
        <div className="neo-border bg-[#fee2e2] text-red-900 p-5 neo-shadow mb-6 flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-black uppercase text-base">Query Failed</h3>
            <p className="font-mono text-sm mt-1">{getError}</p>
          </div>
        </div>
      )}

      {/* Profile Header (if profile loaded) */}
      {profile && (
        <div className="neo-border bg-[#38bdf8] p-6 neo-shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {profile.student.photopath ? (
              <img
                src={profile.student.photopath}
                alt={profile.student.name}
                className="w-28 h-32 object-cover neo-border bg-white neo-shadow-sm shrink-0"
              />
            ) : (
              <div className="w-28 h-32 neo-border bg-white flex items-center justify-center shrink-0 neo-shadow-sm">
                <User className="w-12 h-12 text-black" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="neo-border-sm bg-black text-[#ffe600] font-mono text-xs font-black px-2.5 py-0.5">
                  ROLL: {profile.regno}
                </span>
                <span className="neo-border-sm bg-white font-mono text-xs font-bold px-2 py-0.5">
                  {profile.semesters.length} EXAMINATION SESSIONS
                </span>
                <span className="neo-border-sm bg-[#4ade80] font-mono text-xs font-bold px-2 py-0.5">
                  VERIFIED PROFILE
                </span>
              </div>

              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-black">
                {profile.student.name || "Student"}
              </h2>

              <p className="font-bold text-sm text-neutral-900 mt-1">
                {profile.student.degree || "Bachelor of Technology"}
              </p>
              <p className="text-xs text-neutral-800 font-medium mt-0.5">
                {profile.student.collname || "Presidency University, Bengaluru"}
              </p>

              {(profile.student.FATNAME || profile.student.MOTNAME) && (
                <div className="mt-3 text-xs font-mono font-bold text-neutral-800 flex flex-wrap gap-4 pt-2 border-t-2 border-black/30">
                  {profile.student.FATNAME && <span>Father: {profile.student.FATNAME}</span>}
                  {profile.student.MOTNAME && <span>Mother: {profile.student.MOTNAME}</span>}
                </div>
              )}
            </div>

            <button
              onClick={() => window.print()}
              className="neo-btn bg-white text-black px-4 py-2 text-xs font-mono font-bold flex items-center gap-1.5 self-start shrink-0"
            >
              <Printer className="w-4 h-4" />
              PRINT / PDF
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 1: DETAILED GRADE CARDS (getDetailedResults) */}
      {/* ========================================================================= */}
      {activeTab === "results" && profile && (
        <section className="space-y-6">
          {profile.semesters.map((sem, sIdx) => (
            <div key={sem.yearmode || sIdx} className="neo-border bg-white neo-shadow-lg p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-3 border-black gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="neo-border-sm bg-[#ffe600] text-black font-mono text-xs font-black px-2 py-0.5">
                      SESSION: {sem.yearmode}
                    </span>
                    <span className="neo-border-sm bg-black text-white font-mono text-xs font-black px-2 py-0.5">
                      {sem.subjects.length} COURSES
                    </span>
                  </div>
                  <h3 className="text-2xl font-black uppercase">{sem.examname}</h3>
                  {sem.examdate && (
                    <p className="text-xs font-mono text-neutral-600 mt-0.5">
                      Exam Session: {sem.examdate} {sem.resdate ? `| Result Date: ${sem.resdate}` : ""}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedSemesterIdx(sIdx);
                    setActiveTab("marks");
                  }}
                  className="neo-btn bg-[#ff6b8b] text-black px-4 py-2 text-xs font-mono font-bold flex items-center gap-1.5 shrink-0"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  VIEW RAW COMPONENT MARKS
                </button>
              </div>

              {/* 4-Box Metric Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-5">
                <div className="neo-border bg-[#fefce8] p-3 text-center neo-shadow-sm">
                  <span className="block font-mono text-xs text-neutral-600 uppercase font-bold">
                    Credits Registered
                  </span>
                  <span className="text-2xl font-black font-mono">{sem.credits_registered || "—"}</span>
                </div>
                <div className="neo-border bg-[#f0fdf4] p-3 text-center neo-shadow-sm">
                  <span className="block font-mono text-xs text-neutral-600 uppercase font-bold">
                    Credits Earned
                  </span>
                  <span className="text-2xl font-black font-mono">{sem.credits_earned || "—"}</span>
                </div>
                <div className="neo-border bg-[#eff6ff] p-3 text-center neo-shadow-sm">
                  <span className="block font-mono text-xs text-blue-800 uppercase font-bold">
                    SGPA
                  </span>
                  <span className="text-3xl font-black text-blue-900 font-mono">{sem.sgpa || "—"}</span>
                </div>
                <div className="neo-border bg-[#fdf2f8] p-3 text-center neo-shadow-sm">
                  <span className="block font-mono text-xs text-pink-800 uppercase font-bold">
                    CGPA
                  </span>
                  <span className="text-3xl font-black text-pink-900 font-mono">{sem.cgpa || "—"}</span>
                </div>
              </div>

              {/* Subject Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans border-collapse">
                  <thead>
                    <tr className="neo-border bg-black text-white font-mono text-xs uppercase">
                      <th className="p-3 w-12 text-center">#</th>
                      <th className="p-3">Course Code</th>
                      <th className="p-3">Course Title</th>
                      <th className="p-3 w-24 text-center">Credits</th>
                      <th className="p-3 w-28 text-center">Letter Grade</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-xs">
                    {sem.subjects.map((sub, idx) => (
                      <tr
                        key={idx}
                        className={`border-b-2 border-black ${
                          idx % 2 === 0 ? "bg-white" : "bg-[#f8fafc]"
                        }`}
                      >
                        <td className="p-3 text-center font-bold">{sub.slno || idx + 1}</td>
                        <td className="p-3 font-bold text-black">{sub.subshort}</td>
                        <td className="p-3 font-sans font-bold text-neutral-800">{sub.subname}</td>
                        <td className="p-3 text-center font-bold">{sub.no_of_credits}</td>
                        <td className="p-3 text-center">
                          <span className={`inline-block px-3 py-1 font-black ${getGradeBadge(sub.grade)}`}>
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

      {/* ========================================================================= */}
      {/* FEATURE 2: RAW COMPONENT MARKS INSPECTOR (getBriefResults) */}
      {/* ========================================================================= */}
      {activeTab === "marks" && profile && (
        <section className="space-y-6">
          <div className="neo-border bg-white p-6 neo-shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-3 border-black gap-3 mb-6">
              <div>
                <span className="bg-[#ff6b8b] text-black px-2 py-0.5 border border-black font-mono text-xs font-black uppercase">
                  API: getBriefResults
                </span>
                <h2 className="text-2xl md:text-3xl font-black uppercase mt-1">
                  Internal & External Component Marks
                </h2>
                <p className="text-xs font-mono text-neutral-600">
                  Unveils raw marks for End-Term, Mid-Term, Continuous Assessment (CA), and Practicals.
                </p>
              </div>

              {/* Semester Switcher Dropdown */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold uppercase">Semester:</span>
                <select
                  value={selectedSemesterIdx}
                  onChange={(e) => setSelectedSemesterIdx(Number(e.target.value))}
                  className="neo-border px-3 py-2 font-mono text-xs font-bold bg-[#fffdf0] cursor-pointer"
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
                  <div
                    key={idx}
                    className="neo-border bg-[#fffdf0] p-4 neo-shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs font-black text-neutral-500">
                          COURSE #{item.slno}
                        </span>
                        <span className="neo-border-sm bg-black text-[#ffe600] font-mono text-[10px] font-bold px-2 py-0.5">
                          {item.components.length} ASSESSMENTS
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-black uppercase mb-3">
                        {item.subname}
                      </h4>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t-2 border-black/20">
                      {item.components.map((comp, cIdx) => (
                        <div
                          key={cIdx}
                          className="flex items-center justify-between bg-white neo-border-sm px-2.5 py-1.5 font-mono text-xs"
                        >
                          <span className="font-bold text-neutral-700">{comp.component}</span>
                          <span className="font-black text-black bg-[#ffe600] px-2 py-0.5 border border-black">
                            {comp.score} MARKS
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-3 border-dashed border-black bg-[#fffdf0]">
                <FileText className="w-10 h-10 mx-auto text-neutral-400 mb-2" />
                <p className="font-mono text-sm font-bold text-neutral-600">
                  No component breakdown returned for this session.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 3: HISTORICAL DEGREE TIMELINE (getResultSummaryDetailsnew) */}
      {/* ========================================================================= */}
      {activeTab === "timeline" && profile && (
        <section className="space-y-6">
          <div className="neo-border bg-white p-6 neo-shadow-lg">
            <div className="pb-4 border-b-3 border-black mb-6">
              <span className="bg-[#38bdf8] text-black px-2 py-0.5 border border-black font-mono text-xs font-black uppercase">
                API: getResultSummaryDetailsnew
              </span>
              <h2 className="text-2xl md:text-3xl font-black uppercase mt-1">
                Academic Examination Milestones & Timeline
              </h2>
              <p className="text-xs font-mono text-neutral-600">
                Official declaration record, result dates, and semester progression.
              </p>
            </div>

            {profile.history && profile.history.length > 0 ? (
              <div className="space-y-4">
                {profile.history.map((hist, idx) => (
                  <div
                    key={idx}
                    className="neo-border p-5 neo-shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                    style={{ backgroundColor: hist.color || "#fffdf0" }}
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="neo-border-sm bg-black text-[#ffe600] font-mono text-xs font-black px-2.5 py-0.5">
                          {hist.yearmode}
                        </span>
                        <span className="neo-border-sm bg-[#4ade80] text-black font-mono text-xs font-black px-2.5 py-0.5">
                          STATUS: {hist.classStatus}
                        </span>
                      </div>

                      <h3 className="text-2xl font-black uppercase text-black">{hist.examname}</h3>
                      <p className="font-bold text-xs text-neutral-800 mt-0.5">{hist.degree}</p>
                      <p className="font-mono text-xs text-neutral-700 mt-0.5">{hist.college}</p>
                    </div>

                    <div className="neo-border bg-white p-3 font-mono text-xs shrink-0 md:text-right neo-shadow-sm">
                      <div className="text-neutral-500 font-bold uppercase">Examination:</div>
                      <div className="font-black text-black">{hist.examdate}</div>
                      <div className="text-neutral-500 font-bold uppercase mt-1">Result Declared:</div>
                      <div className="font-black text-emerald-700">{hist.resdate || "—"}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-3 border-dashed border-black bg-[#fffdf0]">
                <Clock className="w-10 h-10 mx-auto text-neutral-400 mb-2" />
                <p className="font-mono text-sm font-bold text-neutral-600">
                  No timeline history found.
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* FEATURE 4: REVALUATION PORTAL & ACADEMIC REGULATIONS (showRVExam) */}
      {/* ========================================================================= */}
      {activeTab === "reval" && profile && (
        <section className="space-y-6">
          <div className="neo-border bg-white p-6 neo-shadow-lg">
            <div className="pb-4 border-b-3 border-black mb-6">
              <span className="bg-[#4ade80] text-black px-2 py-0.5 border border-black font-mono text-xs font-black uppercase">
                API: showRVExam
              </span>
              <h2 className="text-2xl md:text-3xl font-black uppercase mt-1">
                Re-Evaluation (RV) & Challenge Valuation Portal
              </h2>
              <p className="text-xs font-mono text-neutral-600">
                Official review guidelines, eligible examination cycles, and academic clauses.
              </p>
            </div>

            {/* Cycles Eligible for Review */}
            <h3 className="font-mono text-sm font-black uppercase mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Examination Sessions Mapped to Student:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {profile.semesters.map((sem, idx) => (
                <div key={idx} className="neo-border bg-[#fffdf0] p-4 neo-shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="neo-border-sm bg-black text-[#ffe600] font-mono text-xs font-black px-2 py-0.5">
                      CYCLE: {sem.yearmode}
                    </span>
                    <span className="neo-border-sm bg-[#4ade80] text-black font-mono text-[10px] font-black px-2 py-0.5">
                      ELIGIBLE
                    </span>
                  </div>
                  <h4 className="font-black text-lg uppercase">{sem.examname}</h4>
                  <p className="font-mono text-xs text-neutral-600">
                    Result Declared: {sem.resdate || "Official Publication"}
                  </p>
                </div>
              ))}
            </div>

            {/* University Academic Regulations Card */}
            <div className="neo-border bg-[#fefce8] p-6 neo-shadow">
              <h3 className="text-lg font-black uppercase mb-3 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-700" />
                Extracts of Academic Regulations (Clause 13.2)
              </h3>

              <div className="space-y-3 font-sans text-xs md:text-sm text-neutral-800 leading-relaxed">
                <div className="p-3 bg-white neo-border-sm">
                  <strong>1. Deadline for Grade Review:</strong> No request for review of grade(s) or challenge valuation shall be admissible after <strong>five (5) University working days</strong> from the date of declaration of results.
                </div>
                <div className="p-3 bg-white neo-border-sm">
                  <strong>2. Script View / Photocopy:</strong> When active, evaluated answer script booklets can be inspected via digital photocopy access. If outside the viewing window, the portal returns <em>&quot;Date are not Enabled&quot;</em>.
                </div>
                <div className="p-3 bg-white neo-border-sm">
                  <strong>3. Tampering Notice:</strong> Tampering with computer-generated grade cards or submitted examination marks is strictly prohibited and liable to disciplinary action.
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-12 neo-border bg-black text-white p-6 neo-shadow font-mono text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[#ffe600] font-black">NEO-RES SUITE</span> &bull; Full-featured University Examination Gateway
        </div>
        <div className="text-neutral-400">
          Built for pair programming with Antigravity
        </div>
      </footer>
    </div>
  );
}
