import type { Analysis, FingerId } from "./types";

/** Resolve a free-text affected area (e.g. "right little finger") to a finger. */
export function resolveFinger(area: string): FingerId | null {
  const a = area.toLowerCase();
  if (/\bthumb\b/.test(a)) return "thumb";
  if (/\bindex\b|\bpointer\b|\bfore\s?finger\b/.test(a)) return "index";
  if (/\bmiddle\b/.test(a)) return "middle";
  if (/\bring\b/.test(a)) return "ring";
  if (/\blittle\b|\bpinky\b|\bpinkie\b|\bsmall\s?finger\b/.test(a)) return "little";
  return null;
}

/** Resolve handedness from text, defaulting to right. */
export function resolveSide(text: string): "left" | "right" {
  return /\bleft\b/.test(text.toLowerCase()) ? "left" : "right";
}

const FINGER_LABEL: Record<FingerId, string> = {
  thumb: "Thumb",
  index: "Index Finger",
  middle: "Middle Finger",
  ring: "Ring Finger",
  little: "Little Finger",
};

export function fingerLabel(id: FingerId): string {
  return FINGER_LABEL[id];
}

/**
 * Decide what the 3D viewer should do from an analysis. Keeps the rendering
 * layer dumb: it just consumes `{ finger, animate }`.
 */
export interface ViewerTarget {
  bodyPart: string;
  finger: FingerId | null;
  /** Whether the recommended exercises imply a flexion/extension animation. */
  animate: boolean;
}

export function viewerTargetFromAnalysis(analysis: Analysis): ViewerTarget {
  const finger = resolveFinger(analysis.affectedArea) ?? resolveFinger(analysis.injurySummary);
  const exercisesText = analysis.recommendedExercises.join(" ").toLowerCase();
  const animate = /flex|extens|bend|mobil|range of motion|rom|curl/.test(exercisesText) || finger != null;
  return { bodyPart: analysis.bodyPart || "hand", finger, animate };
}
