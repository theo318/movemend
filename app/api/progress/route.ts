import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";
import { progressInputSchema } from "@/lib/types";

/**
 * POST /api/progress
 * Records a progress log (pain score, completion, notes) for a case.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = progressInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const store = getStore();
  const existing = await store.getCase(parsed.data.caseId);
  if (!existing) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }

  try {
    const log = await store.addProgress(parsed.data);
    return NextResponse.json(log, { status: 201 });
  } catch (err) {
    console.error("save progress failed:", err);
    return NextResponse.json({ error: "Could not save progress" }, { status: 500 });
  }
}
