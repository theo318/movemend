import { NextResponse } from "next/server";
import { getStore } from "@/lib/db";

/**
 * GET /api/case/:id
 * Returns the case plus its progress history. `params` is a Promise in
 * Next.js 16 and must be awaited.
 */
export async function GET(_request: Request, ctx: RouteContext<"/api/case/[id]">) {
  const { id } = await ctx.params;
  const store = getStore();
  const record = await store.getCase(id);
  if (!record) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }
  const progress = await store.getProgress(id);
  return NextResponse.json({ case: record, progress });
}
