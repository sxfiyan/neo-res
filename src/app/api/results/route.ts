import { NextRequest, NextResponse } from "next/server";
import { fetchAllStudentResults } from "@/lib/university";
import { getRecordByRegno } from "@/lib/db";
import { SemesterResult } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const regno = searchParams.get("regno")?.trim().toUpperCase();

  if (!regno) {
    return NextResponse.json(
      { success: false, error: "Please provide a student registration number (?regno=...)" },
      { status: 400 }
    );
  }

  try {
    // 1. Fetch live profile from university database
    const profile = await fetchAllStudentResults(regno);

    // 2. Check if this student has custom records stored via POST
    const customRecords = getRecordByRegno(regno);

    if (customRecords.length > 0) {
      // Merge or flag custom records
      const customSemesters: SemesterResult[] = customRecords.map((cr) => ({
        yearmode: cr.yearmode,
        examname: `${cr.examname} (POST Updated)`,
        sgpa: cr.sgpa,
        cgpa: cr.cgpa,
        credits_earned: cr.credits_earned,
        credits_registered: cr.credits_earned,
        subjects: cr.subjects,
        isCustomOverride: true,
      }));

      // Prepend custom records if not already in profile
      profile.semesters = [...customSemesters, ...profile.semesters];
    }

    return NextResponse.json({
      success: true,
      message: `Retrieved ${profile.semesters.length} semester records for ${profile.student.name || regno}`,
      data: profile,
    });
  } catch (err: any) {
    // Fallback: If university server is unreachable or student not found on portal,
    // check if we have any custom records saved via POST for this student!
    const customRecords = getRecordByRegno(regno);

    if (customRecords.length > 0) {
      const first = customRecords[0];
      return NextResponse.json({
        success: true,
        message: "Loaded from custom local record store (POST database)",
        data: {
          regno,
          student: {
            regno,
            name: first.name,
            degree: "B.Tech Computer Science & Engineering",
            collname: "1003 - Presidency School of Computer Science and Engineering",
          },
          semesters: customRecords.map((cr) => ({
            yearmode: cr.yearmode,
            examname: cr.examname,
            sgpa: cr.sgpa,
            cgpa: cr.cgpa,
            credits_earned: cr.credits_earned,
            credits_registered: cr.credits_earned,
            subjects: cr.subjects,
            isCustomOverride: true,
          })),
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to fetch student results from the database.",
      },
      { status: 404 }
    );
  }
}
