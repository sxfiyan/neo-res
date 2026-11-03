"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Send,
  Database,
  Sparkles,
  User,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Plus,
  ArrowRight,
  Printer,
  Edit3,
  RefreshCw,
  TrendingUp,
  Sliders,
  Layers,
} from "lucide-react";
import { StudentFullProfile, CustomRecord, Subject, SemesterResult } from "@/lib/types";

const GRADE_POINTS: Record<string, number> = {
  O: 10,
  "A+": 9,
  A: 8,
  "B+": 7,
  B: 6,
  C: 5,
  D: 4,
  F: 0,
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<"get" | "post" | "db">("get");

  // =========================================================================
  // GET State
  // =========================================================================
  const [searchRegno, setSearchRegno] = useState("20241CCS0134");
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<StudentFullProfile | null>(null);
  const [getError, setGetError] = useState<string | null>(null);
  const [requestLog, setRequestLog] = useState<{ url: string; time: number; status: number } | null>(null);

  // =========================================================================
  // POST State (Auto-Fetch & Auto-Calculate)
  // =========================================================================
  const [postRegno, setPostRegno] = useState("20241CCS0134");
  const [isFetchingPostData, setIsFetchingPostData] = useState(false);
  const [postFetchedProfile, setPostFetchedProfile] = useState<StudentFullProfile | null>(null);
  const [selectedSemesterIndex, setSelectedSemesterIndex] = useState<number>(0);

  // Editable fields for POST
  const [postStudentName, setPostStudentName] = useState("");
  const [postYearmode, setPostYearmode] = useState("");
  const [postExamname, setPostExamname] = useState("");
  const [postStatus, setPostStatus] = useState("Updated via POST");
  const [postNotes, setPostNotes] = useState("");
  const [postSubjects, setPostSubjects] = useState<Subject[]>([]);

  // Submission state
  const [isPosting, setIsPosting] = useState(false);
  const [postSuccess, setPostSuccess] = useState<string | null>(null);
  const [postError, setPostError] = useState<string | null>(null);

  // =========================================================================
  // Stored Records State
  // =========================================================================
  const [storedRecords, setStoredRecords] = useState<CustomRecord[]>([]);

  useEffect(() => {
    fetchStoredRecords();
  }, []);

  const fetchStoredRecords = async () => {
    try {
      const res = await fetch("/api/records");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setStoredRecords(json.data);
      }
    } catch {
      // Ignored
    }
  };

  // Perform GET Results
  const handleGetResults = async (regnoToSearch?: string) => {
    const target = (regnoToSearch || searchRegno).trim().toUpperCase();
    if (!target) return;

    setIsLoading(true);
    setGetError(null);
    setProfile(null);
    const start = performance.now();

    try {
      const res = await fetch(`/api/results?regno=${encodeURIComponent(target)}`);
      const elapsed = Math.round(performance.now() - start);
      const json = await res.json();

      setRequestLog({
        url: `/api/results?regno=${target}`,
        time: elapsed,
        status: res.status,
      });

      if (!res.ok || !json.success) {
        throw new Error(json.error || `Failed to fetch results (HTTP ${res.status})`);
      }

      setProfile(json.data);
    } catch (err: any) {
      setGetError(err.message || "An unexpected error occurred while querying results.");
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================================
  // Auto-Fetch for POST by Roll Number
  // =========================================================================
  const fetchStudentForPost = async (regnoTarget?: string) => {
    const target = (regnoTarget || postRegno).trim().toUpperCase();
    if (!target) return;

    setIsFetchingPostData(true);
    setPostError(null);
    setPostSuccess(null);

    try {
      const res = await fetch(`/api/results?regno=${encodeURIComponent(target)}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Could not find student data to load.");
      }

      const p: StudentFullProfile = json.data;
      setPostFetchedProfile(p);
      setPostStudentName(p.student.name || "Student");

      if (p.semesters.length > 0) {
        setSelectedSemesterIndex(0);
        applySemesterToPost(p.semesters[0], p.student.name);
      }
    } catch (err: any) {
      setPostError(err.message || "Failed to load student details for auto-update.");
    } finally {
      setIsFetchingPostData(false);
    }
  };

  // Load a chosen semester's subjects and metadata into the POST form
  const applySemesterToPost = (sem: SemesterResult, studentName?: string) => {
    setPostYearmode(sem.yearmode);
    setPostExamname(sem.examname.replace(" (POST Updated)", ""));
    setPostStudentName(studentName || postStudentName);
    setPostNotes(`Auto-calculated grade review for ${sem.examname}`);
    setPostSubjects(
      sem.subjects.map((s, idx) => ({
        slno: s.slno || idx + 1,
        subshort: s.subshort,
        subname: s.subname,
        no_of_credits: s.no_of_credits,
        grade: s.grade,
      }))
    );
  };

  // Change selected semester from dropdown
  const handleSemesterDropdownChange = (index: number) => {
    setSelectedSemesterIndex(index);
    if (postFetchedProfile && postFetchedProfile.semesters[index]) {
      applySemesterToPost(postFetchedProfile.semesters[index], postFetchedProfile.student.name);
    }
  };

  // =========================================================================
  // Auto-Calculate SGPA and Credits in Real Time
  // =========================================================================
  const { calculatedSGPA, totalRegisteredCredits, totalEarnedCredits } = useMemo(() => {
    let creditPoints = 0;
    let regCredits = 0;
    let earnedCredits = 0;

    for (const sub of postSubjects) {
      const credits = parseFloat(String(sub.no_of_credits)) || 0;
      const g = (sub.grade || "").trim().toUpperCase();

      if (g === "S" || credits === 0) {
        continue;
      }

      regCredits += credits;

      if (g !== "F" && GRADE_POINTS[g] !== undefined) {
        earnedCredits += credits;
      }

      if (GRADE_POINTS[g] !== undefined) {
        creditPoints += credits * GRADE_POINTS[g];
      }
    }

    const sgpa = regCredits > 0 ? (creditPoints / regCredits).toFixed(2) : "0.00";

    return {
      calculatedSGPA: sgpa,
      totalRegisteredCredits: regCredits,
      totalEarnedCredits: earnedCredits,
    };
  }, [postSubjects]);

  // Submit POST update
  const handlePostRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postRegno.trim()) {
      setPostError("Roll number is required.");
      return;
    }
    if (!postYearmode.trim()) {
      setPostError("Please select a semester option first.");
      return;
    }

    setIsPosting(true);
    setPostSuccess(null);
    setPostError(null);

    const payload = {
      regno: postRegno.trim().toUpperCase(),
      name: postStudentName.trim() || "Student",
      yearmode: postYearmode.trim(),
      examname: postExamname.trim() || "Semester",
      sgpa: calculatedSGPA,
      cgpa: calculatedSGPA,
      credits_earned: String(totalEarnedCredits),
      status: postStatus,
      notes: postNotes,
      subjects: postSubjects,
    };

    try {
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to submit POST record");
      }

      setPostSuccess(
        `Success! Record for ${json.data.regno} (${json.data.examname}) updated via POST. Auto-calculated SGPA: ${calculatedSGPA}`
      );
      fetchStoredRecords();
    } catch (err: any) {
      setPostError(err.message || "Error submitting POST request.");
    } finally {
      setIsPosting(false);
    }
  };

  // Pre-fill POST tab from GET results card
  const prefillPostFromProfile = (sem: SemesterResult) => {
    if (!profile) return;
    setPostRegno(profile.regno);
    setPostFetchedProfile(profile);
    const idx = profile.semesters.findIndex((s) => s.yearmode === sem.yearmode);
    setSelectedSemesterIndex(idx >= 0 ? idx : 0);
    applySemesterToPost(sem, profile.student.name);
    setActiveTab("post");
  };

  // Delete stored record
  const handleDeleteRecord = async (id: string) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      const res = await fetch(`/api/records?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        fetchStoredRecords();
      }
    } catch {
      // Ignored
    }
  };

  // Subject table manipulations
  const addSubjectRow = () => {
    setPostSubjects([
      ...postSubjects,
      {
        slno: postSubjects.length + 1,
        subshort: "NEW" + (100 + postSubjects.length),
        subname: "Elective Course",
        no_of_credits: 3,
        grade: "A+",
      },
    ]);
  };

  const updateSubjectRow = (index: number, key: keyof Subject, val: any) => {
    const next = [...postSubjects];
    next[index] = { ...next[index], [key]: val };
    setPostSubjects(next);
  };

  const removeSubjectRow = (index: number) => {
    setPostSubjects(postSubjects.filter((_, i) => i !== index));
  };

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
              REST API & AUTO-CALCULATING ENGINE
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase">
              ⚡ NEO-RES DATABASE
            </h1>
            <p className="font-bold text-sm md:text-base text-neutral-800 mt-1">
              Query results with <span className="bg-black text-white px-1.5 py-0.5 font-mono">GET</span> & update records with auto-calculated <span className="bg-[#ff6b8b] text-black px-1.5 py-0.5 font-mono border border-black">POST</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="neo-border-sm bg-white font-mono text-xs font-bold px-3 py-1.5 neo-shadow-sm flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] inline-block border border-black"></span>
              PORTAL: 064
            </span>
            <span className="neo-border-sm bg-[#38bdf8] font-mono text-xs font-bold px-3 py-1.5 neo-shadow-sm flex items-center gap-1.5">
              AUTO-SGPA: ON
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t-4 border-black">
          <button
            onClick={() => setActiveTab("get")}
            className={`neo-btn px-5 py-2.5 text-sm md:text-base flex items-center gap-2 ${
              activeTab === "get"
                ? "bg-black text-[#ffe600] translate-x-1 translate-y-1 shadow-none"
                : "bg-white text-black"
            }`}
          >
            <Search className="w-4 h-4" />
            [GET] QUERY RESULTS
          </button>

          <button
            onClick={() => {
              setActiveTab("post");
              if (!postFetchedProfile && postRegno) {
                fetchStudentForPost();
              }
            }}
            className={`neo-btn px-5 py-2.5 text-sm md:text-base flex items-center gap-2 ${
              activeTab === "post"
                ? "bg-[#ff6b8b] text-black translate-x-1 translate-y-1 shadow-none"
                : "bg-white text-black"
            }`}
          >
            <Send className="w-4 h-4" />
            [POST] UPDATE RECORD (AUTO-CALCULATED)
          </button>

          <button
            onClick={() => {
              setActiveTab("db");
              fetchStoredRecords();
            }}
            className={`neo-btn px-5 py-2.5 text-sm md:text-base flex items-center gap-2 ${
              activeTab === "db"
                ? "bg-[#38bdf8] text-black translate-x-1 translate-y-1 shadow-none"
                : "bg-white text-black"
            }`}
          >
            <Database className="w-4 h-4" />
            [STORED DB] ({storedRecords.length})
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* TAB 1: GET - RESULTS QUERY */}
      {/* ========================================================================= */}
      {activeTab === "get" && (
        <section className="space-y-8">
          <div className="neo-border bg-white p-6 neo-shadow">
            <div className="flex items-center gap-2 mb-2 font-mono text-xs font-black uppercase text-neutral-600">
              <span className="bg-[#ffe600] text-black px-2 py-0.5 border border-black">HTTP GET</span>
              /api/results?regno=[ROLL_NUMBER]
            </div>

            <h2 className="text-2xl font-black uppercase mb-4">
              Enter Student Registration / Roll Number
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleGetResults();
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchRegno}
                  onChange={(e) => setSearchRegno(e.target.value)}
                  placeholder="e.g. 20241CCS0134, 20241CCS0167..."
                  className="w-full neo-border px-4 py-3.5 font-mono text-lg font-bold bg-[#fffdf0] focus:outline-none focus:bg-[#fde047]/20 uppercase"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="neo-btn bg-[#ffe600] text-black px-8 py-3.5 text-base flex items-center justify-center gap-2 font-black"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin text-xl">⚡</span>
                    FETCHING...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    GET RESULTS
                  </>
                )}
              </button>
            </form>

            {/* Quick Test Chips */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-mono font-bold">
              <span className="text-neutral-500 uppercase">Quick Test Roll Numbers:</span>
              <button
                type="button"
                onClick={() => {
                  setSearchRegno("20241CCS0134");
                  handleGetResults("20241CCS0134");
                }}
                className="neo-border-sm bg-[#fde047] px-2.5 py-1 hover:bg-black hover:text-white transition-colors"
              >
                👉 20241CCS0134 (Sufiyan)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchRegno("20241CCS0167");
                  handleGetResults("20241CCS0167");
                }}
                className="neo-border-sm bg-[#38bdf8] px-2.5 py-1 hover:bg-black hover:text-white transition-colors"
              >
                👉 20241CCS0167
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchRegno("20251CCS0103");
                  handleGetResults("20251CCS0103");
                }}
                className="neo-border-sm bg-[#4ade80] px-2.5 py-1 hover:bg-black hover:text-white transition-colors"
              >
                👉 20251CCS0103
              </button>
            </div>
          </div>

          {requestLog && (
            <div className="neo-border bg-black text-[#4ade80] font-mono text-xs p-3 neo-shadow-sm flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="bg-[#4ade80] text-black font-black px-1.5 py-0.5">GET 200 OK</span>
                <span>{requestLog.url}</span>
              </div>
              <div className="text-neutral-400">
                Response Time: <span className="text-white font-bold">{requestLog.time}ms</span>
              </div>
            </div>
          )}

          {getError && (
            <div className="neo-border bg-[#fee2e2] text-red-900 p-5 neo-shadow flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-black uppercase text-base">Results Query Failed</h3>
                <p className="font-mono text-sm mt-1">{getError}</p>
              </div>
            </div>
          )}

          {profile && (
            <div className="space-y-6">
              {/* Student Profile Card */}
              <div className="neo-border bg-[#38bdf8] p-6 neo-shadow-lg">
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
                        {profile.regno}
                      </span>
                      <span className="neo-border-sm bg-white font-mono text-xs font-bold px-2 py-0.5">
                        {profile.semesters.length} SEMESTER RECORD(S) FOUND
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

              {/* Semester Cards */}
              <div className="space-y-6">
                {profile.semesters.map((sem, sIdx) => (
                  <div key={sem.yearmode || sIdx} className="neo-border bg-white neo-shadow-lg p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-3 border-black gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="neo-border-sm bg-[#ffe600] text-black font-mono text-xs font-black px-2 py-0.5">
                            CYCLE: {sem.yearmode}
                          </span>
                          {sem.isCustomOverride && (
                            <span className="neo-border-sm bg-[#ff6b8b] text-black font-mono text-xs font-black px-2 py-0.5 animate-pulse">
                              ⚡ POST UPDATED
                            </span>
                          )}
                        </div>
                        <h3 className="text-2xl font-black uppercase">{sem.examname}</h3>
                        {sem.examdate && (
                          <p className="text-xs font-mono text-neutral-600 mt-0.5">
                            Exam Date: {sem.examdate} {sem.resdate ? `| Result: ${sem.resdate}` : ""}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => prefillPostFromProfile(sem)}
                        className="neo-btn bg-[#ff6b8b] text-black px-4 py-2 text-xs font-mono font-bold flex items-center gap-1.5 shrink-0"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        MODIFY VIA POST
                      </button>
                    </div>

                    {/* Metrics 4-Box Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-5">
                      <div className="neo-border bg-[#fefce8] p-3 text-center neo-shadow-sm">
                        <span className="block font-mono text-xs text-neutral-600 uppercase font-bold">
                          Credits Reg.
                        </span>
                        <span className="text-2xl font-black">{sem.credits_registered || "—"}</span>
                      </div>
                      <div className="neo-border bg-[#f0fdf4] p-3 text-center neo-shadow-sm">
                        <span className="block font-mono text-xs text-neutral-600 uppercase font-bold">
                          Credits Earned
                        </span>
                        <span className="text-2xl font-black">{sem.credits_earned || "—"}</span>
                      </div>
                      <div className="neo-border bg-[#eff6ff] p-3 text-center neo-shadow-sm">
                        <span className="block font-mono text-xs text-blue-800 uppercase font-bold">
                          SGPA
                        </span>
                        <span className="text-2xl font-black text-blue-900">{sem.sgpa || "—"}</span>
                      </div>
                      <div className="neo-border bg-[#fdf2f8] p-3 text-center neo-shadow-sm">
                        <span className="block font-mono text-xs text-pink-800 uppercase font-bold">
                          CGPA
                        </span>
                        <span className="text-2xl font-black text-pink-900">{sem.cgpa || "—"}</span>
                      </div>
                    </div>

                    {/* Subjects Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-sans border-collapse">
                        <thead>
                          <tr className="neo-border bg-black text-white font-mono text-xs uppercase">
                            <th className="p-3 w-12 text-center">#</th>
                            <th className="p-3">Course Code</th>
                            <th className="p-3">Course Title</th>
                            <th className="p-3 w-24 text-center">Credits</th>
                            <th className="p-3 w-28 text-center">Grade</th>
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
              </div>
            </div>
          )}
        </section>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: POST - UPDATE RECORDS (AUTO-FETCH & AUTO-CALCULATE) */}
      {/* ========================================================================= */}
      {activeTab === "post" && (
        <section className="space-y-8">
          <div className="neo-border bg-white p-6 neo-shadow-lg">
            <div className="flex items-center gap-2 mb-2 font-mono text-xs font-black uppercase text-neutral-600">
              <span className="bg-[#ff6b8b] text-black px-2 py-0.5 border border-black">HTTP POST</span>
              AUTO-CALCULATED RECORD UPDATER
            </div>

            <h2 className="text-2xl md:text-3xl font-black uppercase mb-1">
              Update Student Records
            </h2>
            <p className="text-sm font-medium text-neutral-600 mb-6">
              Just enter a <strong>Roll Number</strong> — the app automatically loads existing semesters, fetches all courses, and <strong>calculates SGPA & credits live</strong> as you tweak grades!
            </p>

            {/* Step 1: Just Enter Roll Number */}
            <div className="neo-border bg-[#fffdf0] p-5 neo-shadow-sm mb-6">
              <label className="block font-mono text-xs font-black uppercase mb-2">
                1. Enter Roll Number to Load Existing Data
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={postRegno}
                  onChange={(e) => setPostRegno(e.target.value)}
                  placeholder="e.g. 20241CCS0134"
                  className="flex-1 neo-border px-4 py-3 font-mono text-base font-bold uppercase bg-white focus:outline-none focus:bg-[#ff6b8b]/15"
                />

                <button
                  type="button"
                  onClick={() => fetchStudentForPost()}
                  disabled={isFetchingPostData}
                  className="neo-btn bg-[#ffe600] text-black px-6 py-3 font-mono text-xs font-black flex items-center justify-center gap-2 shrink-0"
                >
                  {isFetchingPostData ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      FETCHING DATA...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      LOAD STUDENT & SEMESTERS
                    </>
                  )}
                </button>
              </div>

              {postFetchedProfile && (
                <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-xs">
                  <span className="bg-black text-[#ffe600] px-2 py-0.5 font-bold">
                    FOUND: {postFetchedProfile.student.name}
                  </span>
                  <span className="bg-white border-2 border-black px-2 py-0.5 font-bold">
                    {postFetchedProfile.semesters.length} Semesters Available
                  </span>
                </div>
              )}
            </div>

            {/* Notifications */}
            {postSuccess && (
              <div className="neo-border bg-[#dcfce7] text-green-900 p-4 mb-6 neo-shadow-sm flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                <span className="font-mono text-sm font-bold">{postSuccess}</span>
              </div>
            )}

            {postError && (
              <div className="neo-border bg-[#fee2e2] text-red-900 p-4 mb-6 neo-shadow-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span className="font-mono text-sm font-bold">{postError}</span>
              </div>
            )}

            {/* Step 2: Pick Semester Options Dropdown */}
            {postFetchedProfile && postFetchedProfile.semesters.length > 0 && (
              <div className="neo-border bg-[#eff6ff] p-5 neo-shadow-sm mb-6">
                <label className="block font-mono text-xs font-black uppercase mb-2 flex items-center gap-1.5 text-blue-900">
                  <Layers className="w-4 h-4" />
                  2. Select Which Semester to Update (No Need to Remember Yearmode!)
                </label>

                <select
                  value={selectedSemesterIndex}
                  onChange={(e) => handleSemesterDropdownChange(Number(e.target.value))}
                  className="w-full neo-border px-4 py-3 font-mono text-sm font-bold bg-white focus:outline-none focus:bg-yellow-50 cursor-pointer"
                >
                  {postFetchedProfile.semesters.map((sem, idx) => (
                    <option key={idx} value={idx}>
                      {sem.examname} ({sem.yearmode}) — {sem.subjects.length} Subjects | Current SGPA: {sem.sgpa || "—"}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Step 3: Editable Form with Live Auto-Calculations */}
            {postSubjects.length > 0 && (
              <form onSubmit={handlePostRecord} className="space-y-6">
                {/* Real-time Calculated Metrics Dashboard */}
                <div className="neo-border bg-[#fefce8] p-5 neo-shadow">
                  <div className="flex items-center gap-2 mb-3 font-mono text-xs font-black uppercase text-neutral-800">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    LIVE AUTO-CALCULATED METRICS (Calculates automatically as you edit grades!)
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="neo-border bg-white p-3 text-center neo-shadow-sm">
                      <span className="block font-mono text-[11px] font-bold text-neutral-500 uppercase">
                        Auto-Calculated SGPA
                      </span>
                      <span className="text-3xl font-black text-emerald-700 font-mono">
                        {calculatedSGPA}
                      </span>
                    </div>

                    <div className="neo-border bg-white p-3 text-center neo-shadow-sm">
                      <span className="block font-mono text-[11px] font-bold text-neutral-500 uppercase">
                        Credits Earned
                      </span>
                      <span className="text-3xl font-black text-black font-mono">
                        {totalEarnedCredits} / {totalRegisteredCredits}
                      </span>
                    </div>

                    <div className="neo-border bg-white p-3 text-center neo-shadow-sm col-span-2 sm:col-span-1">
                      <span className="block font-mono text-[11px] font-bold text-neutral-500 uppercase">
                        Selected Cycle
                      </span>
                      <span className="text-lg font-black text-blue-900 font-mono mt-1 block">
                        {postYearmode}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Additional Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs font-black uppercase mb-1">
                      Status / Tag
                    </label>
                    <input
                      type="text"
                      value={postStatus}
                      onChange={(e) => setPostStatus(e.target.value)}
                      placeholder="e.g. Revaluation Updated"
                      className="w-full neo-border px-3.5 py-2 font-mono text-xs font-bold bg-[#fffdf0]"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs font-black uppercase mb-1">
                      Update Notes
                    </label>
                    <input
                      type="text"
                      value={postNotes}
                      onChange={(e) => setPostNotes(e.target.value)}
                      placeholder="e.g. Updated DSA Lab after recheck"
                      className="w-full neo-border px-3.5 py-2 font-mono text-xs font-bold bg-[#fffdf0]"
                    />
                  </div>
                </div>

                {/* Subject List with Instant Grade Adjuster */}
                <div className="pt-2 border-t-3 border-black">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-mono text-sm font-black uppercase flex items-center gap-2">
                      <Sliders className="w-4 h-4" />
                      3. Tweak Course Grades (SGPA will recalculate live!)
                    </h3>
                    <button
                      type="button"
                      onClick={addSubjectRow}
                      className="neo-btn bg-[#ffe600] px-3 py-1.5 text-xs font-mono font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      ADD SUBJECT
                    </button>
                  </div>

                  <div className="space-y-2">
                    {postSubjects.map((sub, idx) => (
                      <div
                        key={idx}
                        className="neo-border-sm bg-white p-3 flex flex-col sm:flex-row items-center gap-2 neo-shadow-sm"
                      >
                        <span className="font-mono text-xs font-black text-neutral-400 w-6 text-center shrink-0">
                          #{idx + 1}
                        </span>

                        <input
                          type="text"
                          value={sub.subshort}
                          onChange={(e) => updateSubjectRow(idx, "subshort", e.target.value)}
                          placeholder="Code"
                          className="neo-border-sm px-2 py-1.5 font-mono text-xs font-bold uppercase w-full sm:w-28 bg-[#fafafa]"
                        />

                        <input
                          type="text"
                          value={sub.subname}
                          onChange={(e) => updateSubjectRow(idx, "subname", e.target.value)}
                          placeholder="Course Title"
                          className="neo-border-sm px-2 py-1.5 font-sans text-xs font-bold flex-1 w-full bg-[#fafafa]"
                        />

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-mono text-[10px] uppercase font-bold text-neutral-500">
                            Credits:
                          </span>
                          <input
                            type="number"
                            value={sub.no_of_credits}
                            onChange={(e) => updateSubjectRow(idx, "no_of_credits", e.target.value)}
                            placeholder="Credits"
                            className="neo-border-sm px-2 py-1.5 font-mono text-xs font-bold w-16 text-center bg-white"
                          />
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-mono text-[10px] uppercase font-bold text-neutral-500">
                            Grade:
                          </span>
                          <select
                            value={sub.grade}
                            onChange={(e) => updateSubjectRow(idx, "grade", e.target.value)}
                            className={`neo-border-sm px-3 py-1.5 font-mono text-xs font-black w-24 cursor-pointer ${getGradeBadge(
                              sub.grade
                            )}`}
                          >
                            <option value="O">O (10)</option>
                            <option value="A+">A+ (9)</option>
                            <option value="A">A (8)</option>
                            <option value="B+">B+ (7)</option>
                            <option value="B">B (6)</option>
                            <option value="C">C (5)</option>
                            <option value="D">D (4)</option>
                            <option value="F">F (0)</option>
                            <option value="S">S (Pass)</option>
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeSubjectRow(idx)}
                          className="p-1.5 text-red-600 hover:bg-red-100 neo-border-sm border-transparent hover:border-black shrink-0"
                          title="Remove subject"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit POST Button */}
                <button
                  type="submit"
                  disabled={isPosting}
                  className="neo-btn bg-[#ff6b8b] text-black w-full py-4 text-lg font-black uppercase flex items-center justify-center gap-2 neo-shadow"
                >
                  {isPosting ? (
                    <>
                      <span className="animate-spin text-xl">⚡</span>
                      PERSISTING VIA HTTP POST...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      SAVE & PERSIST TO DATABASE (SGPA: {calculatedSGPA})
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DATABASE - STORED RECORDS */}
      {/* ========================================================================= */}
      {activeTab === "db" && (
        <section className="space-y-6">
          <div className="neo-border bg-white p-6 neo-shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-3 border-black gap-3 mb-6">
              <div>
                <span className="bg-[#38bdf8] text-black px-2 py-0.5 border border-black font-mono text-xs font-black uppercase">
                  PERSISTED DATABASE
                </span>
                <h2 className="text-2xl md:text-3xl font-black uppercase mt-1">
                  Stored Records ({storedRecords.length})
                </h2>
                <p className="text-xs font-mono text-neutral-600">
                  These records have been persisted to the server store via HTTP POST requests.
                </p>
              </div>

              <button
                onClick={fetchStoredRecords}
                className="neo-btn bg-white text-black px-4 py-2 text-xs font-mono font-bold flex items-center gap-1.5 self-start"
              >
                REFRESH DB
              </button>
            </div>

            {storedRecords.length === 0 ? (
              <div className="text-center py-12 border-3 border-dashed border-black bg-[#fffdf0]">
                <Database className="w-10 h-10 mx-auto text-neutral-400 mb-2" />
                <p className="font-mono text-sm font-bold text-neutral-600">
                  No custom records stored yet.
                </p>
                <button
                  onClick={() => setActiveTab("post")}
                  className="neo-btn bg-[#ff6b8b] text-black px-4 py-2 font-mono text-xs font-bold mt-4"
                >
                  Create one via POST
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {storedRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="neo-border bg-[#fffdf0] p-5 neo-shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="neo-border-sm bg-black text-[#ffe600] font-mono text-xs font-black px-2 py-0.5">
                          {rec.regno}
                        </span>
                        <span className="neo-border-sm bg-[#ff6b8b] text-black font-mono text-[10px] font-black px-2 py-0.5">
                          {rec.status}
                        </span>
                      </div>

                      <h3 className="text-xl font-black uppercase">{rec.name}</h3>
                      <p className="font-mono text-xs text-neutral-600 font-bold">
                        {rec.examname} ({rec.yearmode})
                      </p>

                      <div className="flex gap-4 my-3 font-mono text-xs bg-white p-2 neo-border-sm">
                        <span>
                          SGPA: <strong>{rec.sgpa}</strong>
                        </span>
                        <span>
                          CGPA: <strong>{rec.cgpa}</strong>
                        </span>
                        <span>
                          Credits: <strong>{rec.credits_earned}</strong>
                        </span>
                      </div>

                      {rec.notes && (
                        <p className="text-xs text-neutral-700 italic border-l-2 border-black pl-2 my-2 font-sans">
                          &quot;{rec.notes}&quot;
                        </p>
                      )}

                      <div className="text-[11px] font-mono text-neutral-500 mt-2">
                        Updated: {new Date(rec.updatedAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-4 border-t-2 border-black/20">
                      <button
                        onClick={() => {
                          setSearchRegno(rec.regno);
                          setActiveTab("get");
                          handleGetResults(rec.regno);
                        }}
                        className="neo-btn bg-[#ffe600] px-3 py-1 text-xs font-mono font-bold flex items-center gap-1"
                      >
                        VIEW IN GET <ArrowRight className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => handleDeleteRecord(rec.id)}
                        className="neo-btn bg-red-100 text-red-700 hover:bg-red-200 px-2 py-1 text-xs font-mono font-bold"
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-12 neo-border bg-black text-white p-6 neo-shadow font-mono text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[#ffe600] font-black">NEO-RES ENGINE</span> &bull; Neobrutalist Results & Record Management Platform
        </div>
        <div className="text-neutral-400">
          Built for pair programming with Antigravity
        </div>
      </footer>
    </div>
  );
}
