import Link from "next/link";
import { notFound } from "next/navigation";
import { getStore } from "@/lib/db";
import ProgressForm from "@/components/ProgressForm";

function painColor(score: number): string {
  if (score <= 3) return "bg-emerald-500";
  if (score <= 6) return "bg-amber-500";
  return "bg-red-500";
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ProgressPage(props: PageProps<"/case/[id]/progress">) {
  const { id } = await props.params;
  const store = getStore();
  const record = await store.getCase(id);
  if (!record) notFound();
  const logs = await store.getProgress(id);

  const completed = logs.filter((l) => l.exerciseCompleted).length;
  const avgPain = logs.length
    ? (logs.reduce((s, l) => s + l.painScore, 0) / logs.length).toFixed(1)
    : "—";

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-brand-deep">Progress</p>
          <h1 className="text-3xl font-bold tracking-tight">{record.analysis.affectedArea || "Recovery"}</h1>
        </div>
        <Link
          href={`/case/${id}`}
          className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
        >
          ← Back to guide
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[360px_1fr]">
        <ProgressForm caseId={id} />

        <div className="space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Stat label="Logs" value={String(logs.length)} />
            <Stat label="Sessions done" value={String(completed)} />
            <Stat label="Avg pain" value={avgPain} />
          </div>

          {/* History */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold">History</h2>
            {logs.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">
                No entries yet. Log your first session to start tracking recovery.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {logs.map((log) => (
                  <li key={log.id} className="flex gap-4 rounded-lg border border-slate-200 p-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={`grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-white ${painColor(
                          log.painScore,
                        )}`}
                      >
                        {log.painScore}
                      </span>
                      <span className="mt-1 text-[10px] uppercase text-slate-400">pain</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-slate-400">{formatDate(log.createdAt)}</span>
                        {log.exerciseCompleted && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                            ✓ Exercise done
                          </span>
                        )}
                      </div>
                      {log.notes && <p className="mt-1.5 text-sm text-slate-700">{log.notes}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4 text-center">
      <div className="text-2xl font-bold text-brand-deep">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-wide text-slate-400">{label}</div>
    </div>
  );
}
