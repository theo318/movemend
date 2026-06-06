import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MoveMend — Move better. Mend faster.",
  description:
    "MoveMend turns doctor notes and treatment plans into visual, personalized recovery guidance with AI and 3D models.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
            <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white">M</span>
              <span className="text-lg">
                Move<span className="text-brand-deep">Mend</span>
              </span>
            </Link>
            <Link
              href="/case/new"
              className="rounded-full bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-deep"
            >
              Create recovery plan
            </Link>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200/70 py-6 text-center text-sm text-slate-500">
          MoveMend · Move better. Mend faster. · Hackathon build
        </footer>
      </body>
    </html>
  );
}
