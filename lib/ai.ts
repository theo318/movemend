import Anthropic from "@anthropic-ai/sdk";
import { analysisSchema, type Analysis, type CaseInput } from "./types";
import { fingerLabel, resolveFinger, resolveSide } from "./anatomy";

/**
 * The MoveMend system prompt. The model must SUMMARIZE, never diagnose or
 * invent, and must return JSON only.
 */
export const SYSTEM_PROMPT = `You are MoveMend AI.

Your job is to convert doctor notes, diagnosis, treatment plans, and patient symptoms into structured recovery information.

Rules:
- Do not diagnose.
- Do not invent exercises.
- Only summarize provided information.
- Return JSON only.

Output a JSON object with exactly these keys:
{
  "bodyPart": "",
  "affectedArea": "",
  "injurySummary": "",
  "recommendedExercises": [],
  "warnings": []
}

bodyPart is the high-level region (e.g. "hand", "shoulder", "knee", "ankle").
affectedArea is the specific structure (e.g. "right little finger").
recommendedExercises and warnings are arrays of short strings drawn only from the provided text.`;

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

function inputToUserMessage(input: CaseInput): string {
  return [
    `Doctor notes: ${input.doctorNotes || "(none)"}`,
    `Diagnosis: ${input.diagnosis || "(none)"}`,
    `Treatment plan: ${input.treatmentPlan || "(none)"}`,
    `Patient symptoms: ${input.symptoms || "(none)"}`,
  ].join("\n");
}

/** True when a real Claude key is configured. */
export function hasClaude(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

async function analyzeWithClaude(input: CaseInput): Promise<Analysis> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: inputToUserMessage(input) }],
  });

  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  // Models occasionally wrap JSON in prose or fences; extract the object.
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON object in model response");
  const parsed = analysisSchema.parse(JSON.parse(match[0]));
  return parsed;
}

/**
 * Deterministic, keyword-driven analyzer used when no Claude key is set.
 * Good enough to demo the full flow offline — and it nails the spec's
 * "right little finger" scenario.
 */
export function mockAnalyze(input: CaseInput): Analysis {
  const blob = [input.doctorNotes, input.diagnosis, input.treatmentPlan, input.symptoms]
    .join(" ")
    .trim();
  const lower = blob.toLowerCase();

  const finger = resolveFinger(blob);
  const side = resolveSide(blob);

  // Body part detection (architecture is future-ready; MVP centres on hand).
  let bodyPart = "hand";
  if (/\bknee\b/.test(lower)) bodyPart = "knee";
  else if (/\bshoulder\b|\brotator\b/.test(lower)) bodyPart = "shoulder";
  else if (/\bankle\b/.test(lower)) bodyPart = "ankle";
  else if (finger || /\bhand\b|\bfinger\b|\bwrist\b/.test(lower)) bodyPart = "hand";

  const affectedArea = finger
    ? `${cap(side)} ${fingerLabel(finger)}`
    : bodyPart === "hand"
      ? `${cap(side)} Hand`
      : `${cap(side)} ${cap(bodyPart)}`;

  // Summary: prefer a recognised theme, else fall back to the symptoms text.
  let injurySummary = "Recovery in progress.";
  if (/stiff/.test(lower)) injurySummary = "Post-treatment stiffness.";
  else if (/sprain/.test(lower)) injurySummary = "Sprain recovery.";
  else if (/fracture|broke|broken/.test(lower)) injurySummary = "Post-fracture rehabilitation.";
  else if (/strain|pull/.test(lower)) injurySummary = "Muscle strain recovery.";
  else if (input.symptoms.trim()) injurySummary = trimSentence(input.symptoms.trim());

  // Exercises: only surfaced when the text supports mobility work.
  const recommendedExercises: string[] = [];
  const mentionsMobility = /mobil|range of motion|rom|exercise|flex|extens|bend|stretch/.test(lower);
  if (bodyPart === "hand" && (finger || mentionsMobility)) {
    recommendedExercises.push("Finger Flexion", "Finger Extension");
  } else if (bodyPart === "knee" && mentionsMobility) {
    recommendedExercises.push("Knee Flexion", "Knee Extension");
  } else if (bodyPart === "shoulder" && mentionsMobility) {
    recommendedExercises.push("Pendulum Swing", "Shoulder Flexion");
  } else if (bodyPart === "ankle" && mentionsMobility) {
    recommendedExercises.push("Ankle Circles", "Dorsiflexion");
  } else if (mentionsMobility) {
    recommendedExercises.push("Gentle Range of Motion");
  }

  return {
    bodyPart,
    affectedArea,
    injurySummary,
    recommendedExercises,
    warnings: ["Stop if severe pain occurs."],
  };
}

/**
 * Analyze a case. Uses Claude when configured, otherwise the mock. If the
 * Claude call fails for any reason, we degrade gracefully to the mock so a
 * live demo never hard-fails.
 */
export async function analyzeCase(input: CaseInput): Promise<{ analysis: Analysis; source: "claude" | "mock" }> {
  if (hasClaude()) {
    try {
      const analysis = await analyzeWithClaude(input);
      return { analysis, source: "claude" };
    } catch (err) {
      console.error("Claude analysis failed, falling back to mock:", err);
    }
  }
  return { analysis: mockAnalyze(input), source: "mock" };
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function trimSentence(s: string): string {
  const first = s.split(/[.!?]/)[0].trim();
  const out = first.length > 0 ? first : s.trim();
  return out.endsWith(".") ? out : out + ".";
}
