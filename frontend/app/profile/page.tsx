"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { ResumeUpload } from "../components/ResumeUpload";

type Metadata = {
  first_name?: string;
  last_name?: string;
  phone?: string;
  location?: string;
};

export default function Profile() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [metadata, setMetadata] = useState<Metadata>({});
  const [resume, setResume] = useState<File | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push("/sign-in");
        return;
      }
      setMetadata(data.session.user.user_metadata ?? {});
      setCheckingAuth(false);
    });
  }, [router]);

  if (checkingAuth) {
    return <div className="flex flex-1 bg-white dark:bg-black" />;
  }

  const fullName = [metadata.first_name, metadata.last_name]
    .filter(Boolean)
    .join(" ");

  async function handleSaveResume() {
    // TODO: upload to Supabase Storage once a bucket exists — for now this
    // just confirms the selection locally, nothing is persisted yet.
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-black">
      <header className="flex items-center justify-between border-b border-black/[.08] px-6 py-5 sm:px-12 dark:border-white/[.145]">
        <a
          href="/"
          className="text-lg font-semibold tracking-tight text-black dark:text-zinc-50"
        >
          TBD
        </a>
        <a
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          <span aria-hidden="true">←</span> Dashboard
        </a>
      </header>

      <main className="flex-1 px-6 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-lg">
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Profile
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            This is what we use to auto-fill your applications.
          </p>

          <dl className="mt-8 flex flex-col divide-y divide-black/[.08] rounded-lg border border-black/[.08] dark:divide-white/[.145] dark:border-white/[.145]">
            <div className="flex items-center justify-between px-4 py-3">
              <dt className="text-sm text-zinc-500">Name</dt>
              <dd className="text-sm font-medium text-black dark:text-zinc-50">
                {fullName || "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <dt className="text-sm text-zinc-500">Phone</dt>
              <dd className="text-sm font-medium text-black dark:text-zinc-50">
                {metadata.phone || "—"}
              </dd>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <dt className="text-sm text-zinc-500">Location</dt>
              <dd className="text-sm font-medium text-black dark:text-zinc-50">
                {metadata.location || "—"}
              </dd>
            </div>
          </dl>

          <p className="mt-2 text-xs text-zinc-500">
            Need to change these?{" "}
            <a
              href="/onboarding"
              className="font-medium underline underline-offset-2"
            >
              Edit in onboarding
            </a>
            .
          </p>

          <div className="mt-8">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Resume
            </p>
            <div className="mt-2">
              <ResumeUpload file={resume} onChange={setResume} />
            </div>

            {resume && (
              <button
                type="button"
                onClick={handleSaveResume}
                className="mt-4 flex h-10 items-center justify-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
              >
                {saved ? "Saved" : "Save resume"}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
