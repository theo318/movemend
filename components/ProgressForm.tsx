"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ProgressForm({ caseId }: { caseId: string }) {
  const router = useRouter();
  const [painScore, setPainScore] = useState(4);
  const [exerciseCompleted, setExerciseCompleted] = useState(false);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save() {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId, painScore, exerciseCompleted, notes }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Could not save");
      setNotes("");
      setExerciseCompleted(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold">Log today</h2>

      {/* Pain score */}
      <div className="mt-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700">Pain score</span>
          <span className="text-sm font-semibold text-brand-deep">{painScore} / 10</span>
        </div>
        <input
          type="range"
          min={0}
          max={10}
          value={painScore}
          onChange={(e) => setPainScore(Number(e.target.value))}
          className="mt-2 w-full accent-teal-500"
        />
        <div className="mt-1 flex justify-between text-xs text-slate-400">
          <span>No pain</span>
          <span>Worst</span>
        </div>
      </div>

      {/* Exercise completion */}
      <button
        type="button"
        onClick={() => setExerciseCompleted((v) => !v)}
        className={`mt-5 flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition ${
          exerciseCompleted
            ? "border-brand bg-brand/10 text-brand-deep"
            : "border-slate-300 text-slate-600"
        }`}
      >
        Exercise completed
        <span
          className={`relative h-6 w-11 rounded-full transition ${
            exerciseCompleted ? "bg-brand" : "bg-slate-300"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
              exerciseCompleted ? "left-[22px]" : "left-0.5"
            }`}
          />
        </span>
      </button>

      {/* Notes */}
      <label className="mt-5 block">
        <span className="text-sm font-medium text-slate-700">Notes</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="e.g. movement feels easier"
          className="mt-1.5 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30"
        />
      </label>

      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <button
        onClick={save}
        disabled={saving}
        className="mt-5 w-full rounded-lg bg-brand px-4 py-3 font-semibold text-white transition hover:bg-brand-deep disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save progress"}
      </button>

      {saved && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-center text-sm font-medium text-brand-deep"
        >
          Saved ✓
        </motion.p>
      )}
    </div>
  );
}
