import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-5 py-24 text-center">
      <h1 className="text-5xl font-bold tracking-tight">404</h1>
      <p className="mt-3 text-slate-500">We couldn&apos;t find that recovery plan.</p>
      <Link
        href="/case/new"
        className="mt-6 rounded-full bg-brand px-6 py-3 font-semibold text-white transition hover:bg-brand-deep"
      >
        Create a recovery plan
      </Link>
    </div>
  );
}
