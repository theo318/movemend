import { NextResponse } from "next/server";
import { analyzeCase } from "@/lib/ai";
import { getStore } from "@/lib/db";
import { caseInputSchema } from "@/lib/types";

/**
 * POST /api/analyze
 * Runs the AI analysis on clinical inputs, persists a case, and returns the
 * case id alongside the structured analysis so the client can route to the
 * recovery guide.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = caseInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const { analysis, source } = await analyzeCase(parsed.data);
    const record = await getStore().createCase(parsed.data, analysis);
    return NextResponse.json({ caseId: record.id, analysis, source }, { status: 201 });
  } catch (err) {
    console.error("analyze failed:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
