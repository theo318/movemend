"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Hand3D from "@/components/Hand3D";

const steps = [
  { n: "1", title: "Paste the clinical notes", body: "Doctor notes, diagnosis, treatment plan and symptoms." },
  { n: "2", title: "AI extracts the recovery", body: "Affected area, a plain-language summary, exercises and safety warnings." },
  { n: "3", title: "See it on a 3D model", body: "The injured area is highlighted and the exercise is animated." },
  { n: "4", title: "Track your progress", body: "Log pain, completion and notes — and watch yourself mend." },
];

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-mesh text-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-teal-200">
              AI + 3D recovery guidance
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
              Move better.
              <br />
              <span className="text-teal-300">Mend faster.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-slate-300">
              Patients leave appointments with notes they don&apos;t fully understand. MoveMend turns
              those notes into visual, personalized recovery guidance.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/case/new"
                className="rounded-full bg-teal-400 px-6 py-3 font-semibold text-slate-900 transition hover:bg-teal-300"
              >
                Create recovery plan
              </Link>
              <a
                href="#how"
                className="rounded-full border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                How it works
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative h-[360px] w-full md:h-[460px]"
          >
            <Hand3D finger="little" animate />
            <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/30 px-3 py-1 text-xs text-slate-300 backdrop-blur">
              Little finger highlighted · drag to rotate
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="text-center text-3xl font-bold tracking-tight">How it works</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-slate-500">
          From clinical jargon to a recovery plan you can actually follow — in seconds.
        </p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="card p-6"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-brand/10 font-semibold text-brand-deep">
                {s.n}
              </span>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{s.body}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
