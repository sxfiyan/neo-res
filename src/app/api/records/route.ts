import { NextRequest, NextResponse } from "next/server";
import { getRecords, saveRecord, deleteRecord } from "@/lib/db";
import { Subject } from "@/lib/types";

export async function GET() {
  const records = getRecords();
  return NextResponse.json({
    success: true,
    count: records.length,
    data: records,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { regno, name, yearmode, examname, sgpa, cgpa, credits_earned, subjects, status, notes, id } = body;

    if (!regno || typeof regno !== "string") {
      return NextResponse.json(
        { success: false, error: "Validation Error: 'regno' (Roll Number) is required." },
        { status: 400 }
      );
    }

    const sanitizedSubjects: Subject[] = Array.isArray(subjects)
      ? subjects.map((s: any, idx: number) => ({
          slno: s.slno || idx + 1,
          subshort: String(s.subshort || "SUB" + (idx + 1)).toUpperCase(),
          subname: String(s.subname || "Subject Name"),
          no_of_credits: s.no_of_credits ?? 3,
          grade: String(s.grade || "A").toUpperCase(),
        }))
      : [];

    const saved = saveRecord({
      id,
      regno: regno.trim().toUpperCase(),
      name: name ? String(name).trim() : "Student",
      yearmode: yearmode ? String(yearmode).trim() : "D-2026-1",
      examname: examname ? String(examname).trim() : "Fourth Semester",
      sgpa: String(sgpa ?? "8.00"),
      cgpa: String(cgpa ?? "8.00"),
      credits_earned: String(credits_earned ?? "24"),
      status: status ? String(status).trim() : "Updated via POST",
      notes: notes ? String(notes).trim() : "",
      subjects: sanitizedSubjects,
    });

    return NextResponse.json(
      {
        success: true,
        message: `HTTP POST 201: Successfully updated and persisted record for ${saved.regno}`,
        data: saved,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to process POST request.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { success: false, error: "Record ID (?id=...) is required to delete." },
      { status: 400 }
    );
  }

  const success = deleteRecord(id);

  if (success) {
    return NextResponse.json({
      success: true,
      message: `Record ${id} deleted successfully.`,
    });
  }

  return NextResponse.json(
    { success: false, error: `Record ${id} not found.` },
    { status: 404 }
  );
}
