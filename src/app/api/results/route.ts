import { NextRequest, NextResponse } from "next/server";
import { fetchAllStudentResults } from "@/lib/university";

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
    const profile = await fetchAllStudentResults(regno);

    return NextResponse.json({
      success: true,
      message: `Successfully loaded academic records for ${profile.student.name || regno}`,
      data: profile,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to fetch student results from the university portal.",
      },
      { status: 404 }
    );
  }
}
