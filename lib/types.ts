import { z } from "zod";

/** A finger on the hand model. */
export type FingerId = "thumb" | "index" | "middle" | "ring" | "little";

/** Body parts the architecture is designed to grow into. MVP ships `hand`. */
export type BodyPart = "hand" | "shoulder" | "knee" | "ankle" | "other";

/**
 * Structured recovery information extracted by the AI from a clinician's notes.
 * This is the single contract the 3D viewer and the guide UI render from.
 */
export const analysisSchema = z.object({
  bodyPart: z.string(),
  affectedArea: z.string(),
  injurySummary: z.string(),
  recommendedExercises: z.array(z.string()),
  warnings: z.array(z.string()),
});
export type Analysis = z.infer<typeof analysisSchema>;

/** Raw clinical inputs a user pastes in on /case/new. */
export const caseInputSchema = z.object({
  doctorNotes: z.string().default(""),
  diagnosis: z.string().default(""),
  treatmentPlan: z.string().default(""),
  symptoms: z.string().default(""),
});
export type CaseInput = z.infer<typeof caseInputSchema>;

/** A persisted case: the inputs plus the AI analysis. */
export interface CaseRecord extends CaseInput {
  id: string;
  createdAt: string;
  analysis: Analysis;
}

export const progressInputSchema = z.object({
  caseId: z.string().min(1),
  painScore: z.number().int().min(0).max(10),
  exerciseCompleted: z.boolean(),
  notes: z.string().default(""),
});
export type ProgressInput = z.infer<typeof progressInputSchema>;

export interface ProgressLog {
  id: string;
  caseId: string;
  painScore: number;
  exerciseCompleted: boolean;
  notes: string;
  createdAt: string;
}
