import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Analysis, CaseInput, CaseRecord, ProgressInput, ProgressLog } from "./types";

/**
 * Storage layer with a clean interface and two backends:
 *  - Supabase Postgres when SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set
 *  - an in-memory store otherwise, so the app runs end-to-end with zero setup
 *
 * Both implement the same `Store` contract; callers never branch on backend.
 */
export interface Store {
  createCase(input: CaseInput, analysis: Analysis): Promise<CaseRecord>;
  getCase(id: string): Promise<CaseRecord | null>;
  addProgress(input: ProgressInput): Promise<ProgressLog>;
  getProgress(caseId: string): Promise<ProgressLog[]>;
}

export function hasSupabase(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

// ---------------------------------------------------------------------------
// In-memory store (default). Kept on globalThis so it survives dev HMR.
// ---------------------------------------------------------------------------

interface MemoryState {
  cases: Map<string, CaseRecord>;
  progress: Map<string, ProgressLog[]>;
}

const g = globalThis as unknown as { __movemend?: MemoryState };
const memory: MemoryState = (g.__movemend ??= { cases: new Map(), progress: new Map() });

class MemoryStore implements Store {
  async createCase(input: CaseInput, analysis: Analysis): Promise<CaseRecord> {
    const record: CaseRecord = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...input,
      analysis,
    };
    memory.cases.set(record.id, record);
    memory.progress.set(record.id, []);
    return record;
  }

  async getCase(id: string): Promise<CaseRecord | null> {
    return memory.cases.get(id) ?? null;
  }

  async addProgress(input: ProgressInput): Promise<ProgressLog> {
    const log: ProgressLog = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...input,
    };
    const list = memory.progress.get(input.caseId) ?? [];
    list.push(log);
    memory.progress.set(input.caseId, list);
    return log;
  }

  async getProgress(caseId: string): Promise<ProgressLog[]> {
    const list = [...(memory.progress.get(caseId) ?? [])];
    // Newest first.
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

// ---------------------------------------------------------------------------
// Supabase store. Maps camelCase <-> snake_case columns.
// ---------------------------------------------------------------------------

class SupabaseStore implements Store {
  private db: SupabaseClient;
  constructor() {
    this.db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { persistSession: false },
    });
  }

  async createCase(input: CaseInput, analysis: Analysis): Promise<CaseRecord> {
    const { data, error } = await this.db
      .from("cases")
      .insert({
        doctor_notes: input.doctorNotes,
        diagnosis: input.diagnosis,
        treatment_plan: input.treatmentPlan,
        symptoms: input.symptoms,
        analysis_json: analysis,
      })
      .select()
      .single();
    if (error) throw error;
    return rowToCase(data);
  }

  async getCase(id: string): Promise<CaseRecord | null> {
    const { data, error } = await this.db.from("cases").select().eq("id", id).maybeSingle();
    if (error) throw error;
    return data ? rowToCase(data) : null;
  }

  async addProgress(input: ProgressInput): Promise<ProgressLog> {
    const { data, error } = await this.db
      .from("progress_logs")
      .insert({
        case_id: input.caseId,
        pain_score: input.painScore,
        exercise_completed: input.exerciseCompleted,
        notes: input.notes,
      })
      .select()
      .single();
    if (error) throw error;
    return rowToProgress(data);
  }

  async getProgress(caseId: string): Promise<ProgressLog[]> {
    const { data, error } = await this.db
      .from("progress_logs")
      .select()
      .eq("case_id", caseId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(rowToProgress);
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToCase(row: any): CaseRecord {
  return {
    id: row.id,
    createdAt: row.created_at,
    doctorNotes: row.doctor_notes ?? "",
    diagnosis: row.diagnosis ?? "",
    treatmentPlan: row.treatment_plan ?? "",
    symptoms: row.symptoms ?? "",
    analysis: row.analysis_json,
  };
}

function rowToProgress(row: any): ProgressLog {
  return {
    id: row.id,
    caseId: row.case_id,
    painScore: row.pain_score,
    exerciseCompleted: row.exercise_completed,
    notes: row.notes ?? "",
    createdAt: row.created_at,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

let store: Store | null = null;

/** Get the active store (singleton). */
export function getStore(): Store {
  if (!store) store = hasSupabase() ? new SupabaseStore() : new MemoryStore();
  return store;
}
