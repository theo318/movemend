import Link from "next/link";
import { notFound } from "next/navigation";
import { getStore } from "@/lib/db";
import { viewerTargetFromAnalysis } from "@/lib/anatomy";
import Hand3D from "@/components/Hand3D";

export default async function RecoveryGuidePage(props: PageProps<"/case/[id]">) {
  const { id } = await props.params;
  const record = await getStore().getCase(id);
  if (!record) notFound();

  const { analysis } = record;
  const target = viewerTargetFromAnalysis(analysis);

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-brand-deep">Recovery guide</p>
          <h1 className="text-3xl font-bold tracking-tight">{analysis.affectedArea || "Recovery plan"}</h1>
        </div>
        <Link
          href={`/case/${id}/progress`}
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-deep"
        >
          Log progress →
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        {/* 3D model */}
        <div className="card overflow-hidden">
          <div className="bg-mesh relative h-[420px] w-full">
            <Hand3D finger={target.finger} animate={target.animate} />
            <div className="pointer-events-none absolute left-4 top-4 rounded-full bg-black/30 px-3 py-1 text-xs text-slate-200 backdrop-blur">
              {target.bodyPart === "hand" ? "Hand model" : `${cap(target.bodyPart)} (hand model shown)`} · drag to
              rotate, scroll to zoom
            </div>
            {target.finger == null && (
              <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-amber-500/90 px-3 py-1 text-xs font-medium text-white">
                No specific finger detected
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-5">
          <section className="card p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Summary</h2>
            <p className="mt-2 text-lg">{analysis.injurySummary || "—"}</p>
            <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-slate-400">Body part</dt>
                <dd className="font-medium capitalize">{analysis.bodyPart || "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Affected area</dt>
                <dd className="font-medium">{analysis.affectedArea || "—"}</dd>
              </div>
            </dl>
          </section>

          <section className="card p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Recommended exercises
            </h2>
            {analysis.recommendedExercises.length ? (
              <ul className="mt-3 space-y-2">
                {analysis.recommendedExercises.map((ex) => (
                  <li
                    key={ex}
                    className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5"
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-brand/10 text-brand-deep">
                      ↻
                    </span>
                    <span className="font-medium">{ex}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-500">No exercises were specified in the notes.</p>
            )}
          </section>

          {analysis.warnings.length > 0 && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-amber-700">
                ⚠ Safety warnings
              </h2>
              <ul className="mt-3 space-y-1.5 text-sm text-amber-900">
                {analysis.warnings.map((w) => (
                  <li key={w}>• {w}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      <p className="mt-8 text-xs text-slate-400">
        MoveMend summarizes clinical notes for understanding. It does not diagnose or replace professional
        medical advice.
      </p>
    </div>
  );
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
