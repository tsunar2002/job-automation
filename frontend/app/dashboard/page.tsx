"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

type JobStatus = "QUEUED" | "APPLIED" | "INTERVIEW" | "REJECTED" | "FAILED";

type Job = {
  id: string;
  title: string;
  company: string;
  location: string | null;
  url: string;
  source: string;
  status: JobStatus;
  applied_at: string | null;
  created_at: string;
};

const STATUS_FILTERS: { label: string; value: JobStatus | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Queued", value: "QUEUED" },
  { label: "Applied", value: "APPLIED" },
  { label: "Interview", value: "INTERVIEW" },
  { label: "Rejected", value: "REJECTED" },
  { label: "Failed", value: "FAILED" },
];

const STATUS_STYLES: Record<JobStatus, string> = {
  QUEUED:
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  APPLIED: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  INTERVIEW:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  FAILED:
    "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
};

export default function Dashboard() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [filter, setFilter] = useState<JobStatus | "ALL">("ALL");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push("/sign-in");
        return;
      }
      if (!data.session.user.user_metadata?.onboarding_completed) {
        router.push("/onboarding");
        return;
      }
      setCheckingAuth(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          router.push("/sign-in");
        } else if (!session.user.user_metadata?.onboarding_completed) {
          router.push("/onboarding");
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, [router]);

  useEffect(() => {
    if (checkingAuth) return;

    supabase
      .from("jobs")
      .select("id, title, company, location, url, source, status, applied_at, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setJobs((data as Job[]) ?? []);
        setLoadingJobs(false);
      });
  }, [checkingAuth]);

  if (checkingAuth) {
    return <div className="flex flex-1 bg-white dark:bg-black" />;
  }

  const counts = jobs.reduce(
    (acc, job) => {
      acc[job.status] = (acc[job.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<JobStatus, number>
  );

  const visibleJobs =
    filter === "ALL" ? jobs : jobs.filter((job) => job.status === filter);

  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-black">
      {/* Nav */}
      <header className="flex items-center justify-between border-b border-black/[.08] px-6 py-5 sm:px-12 dark:border-white/[.145]">
        <a
          href="/"
          className="text-lg font-semibold tracking-tight text-black dark:text-zinc-50"
        >
          TBD
        </a>
        <div className="flex items-center gap-3">
          <a
            href="/profile"
            className="flex h-9 items-center justify-center rounded-full border border-black/[.08] px-4 text-sm font-medium text-black transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-50 dark:hover:bg-[#1a1a1a]"
          >
            Profile
          </a>
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="flex h-9 items-center justify-center rounded-full border border-black/[.08] px-4 text-sm font-medium text-black transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-50 dark:hover:bg-[#1a1a1a]"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 py-10 sm:px-12">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Applications
        </h1>

        {/* Stat tiles */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {STATUS_FILTERS.slice(1).map(({ label, value }) => (
            <div
              key={value}
              className="rounded-lg border border-black/[.08] px-4 py-3 dark:border-white/[.145]"
            >
              <p className="text-xs font-medium text-zinc-500">{label}</p>
              <p className="mt-1 text-2xl font-semibold text-black dark:text-zinc-50">
                {counts[value as JobStatus] ?? 0}
              </p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="mt-8 flex flex-wrap gap-2">
          {STATUS_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`flex h-8 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors ${
                filter === value
                  ? "bg-foreground text-background"
                  : "border border-black/[.08] text-zinc-600 hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-400 dark:hover:bg-[#1a1a1a]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Job list */}
        <div className="mt-6 overflow-hidden rounded-lg border border-black/[.08] dark:border-white/[.145]">
          {loadingJobs ? (
            <p className="px-4 py-8 text-center text-sm text-zinc-500">
              Loading…
            </p>
          ) : visibleJobs.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-zinc-500">
              No jobs yet. Once the scraper finds matching roles, they&apos;ll
              show up here.
            </p>
          ) : (
            <ul className="divide-y divide-black/[.08] dark:divide-white/[.145]">
              {visibleJobs.map((job) => (
                <li key={job.id}>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col gap-2 px-4 py-4 transition-colors hover:bg-black/[.03] sm:flex-row sm:items-center sm:justify-between dark:hover:bg-white/[.03]"
                  >
                    <div>
                      <p className="text-sm font-medium text-black dark:text-zinc-50">
                        {job.title}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {job.company}
                        {job.location ? ` · ${job.location}` : ""}
                      </p>
                    </div>
                    <span
                      className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[job.status]}`}
                    >
                      {job.status}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
