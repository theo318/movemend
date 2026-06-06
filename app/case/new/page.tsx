"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const DEMO = {
  doctorNotes:
    "Patient injured right little finger. Treatment completed. Still experiencing stiffness and difficulty bending the finger. Doctor recommends mobility exercises.",
  diagnosis: "Post-treatment stiffness of the right little finger.",
  treatmentPlan: "Daily mobility exercises — finger flexion and extension.",
  symptoms: "Stiffness and difficulty bending the little finger.",
};

const EMPTY = { doctorNotes: "", diagnosis: "", treatmentPlan: "", symptoms: "" };

const FIELDS: { key: keyof typeof EMPTY; label: string; placeholder: string; rows: number }[] = [
  { key: "doctorNotes", label: "Doctor notes", placeholder: "Paste the clinician's notes…", rows: 4 },
  { key: "diagnosis", label: "Diagnosis", placeholder: "e.g. Post-treatment stiffness", rows: 2 },
  { key: "treatmentPlan", label: "Treatment plan", placeholder: "e.g. Daily mobility exercises", rows: 2 },
  { key: "symptoms", label: "Symptoms", placeholder: "What is the patient experiencing?", rows: 2 },
];

export default function NewCasePage() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof EMPTY, value: string) => setForm((f) => ({ ...f, [key]: value }));

  async function analyze() {
    setError(null);
    if (!Object.values(form).some((v) => v.trim())) {
      setError("Add at least one note before analyzing.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Analysis failed");
      const { caseId } = await res.json();
      router.push(`/case/${caseId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New recovery plan</h1>
          <p className="mt-2 text-slate-500">Paste what the clinic gave you. The AI does the rest.</p>
        </div>
        <button
          type="button"
          onClick={() => setForm(DEMO)}
          className="shrink-0 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
        >
          Load demo
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card mt-8 space-y-5 p-6"
      >
        {FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="text-sm font-medium text-slate-700">{f.label}</span>
            <textarea
              value={form[f.key]}
              onChange={(e) => set(f.key, e.target.value)}
              placeholder={f.placeholder}
              rows={f.rows}
              className="mt-1.5 w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30"
            />
          </label>
        ))}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <button
          onClick={analyze}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-3 font-semibold text-white transition hover:bg-brand-deep disabled:opacity-60"
        >
          {loading ? "Analyzing…" : "Analyze"}
        </button>
      </motion.div>
    </div>
  );
}
