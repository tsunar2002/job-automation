"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "").replace(/^1/, "").slice(0, 10);
  if (!digits) return "";

  const area = digits.slice(0, 3);
  const prefix = digits.slice(3, 6);
  const line = digits.slice(6, 10);

  return ["+1", area, prefix, line].filter(Boolean).join(" ");
}

export default function Onboarding() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [usAuthorized, setUsAuthorized] = useState(false);
  const [requiresSponsorship, setRequiresSponsorship] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    // TODO: persist full profile fields to a Supabase `profiles` table once it exists.
    // For now we just flag onboarding as complete on the auth user.
    await supabase.auth.updateUser({ data: { onboarding_completed: true } });
    setSaved(true);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (saved) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-24 text-center dark:bg-black">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          You&apos;re all set
        </h1>
        <p className="mt-2 max-w-sm text-sm text-zinc-600 dark:text-zinc-400">
          Your profile is saved. We&apos;ll use it to auto-fill applications
          as we find matching roles.
        </p>
        <a
          href="/dashboard"
          className="mt-8 flex h-11 items-center justify-center rounded-full bg-foreground px-8 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          Go to dashboard
        </a>
      </div>
    );
  }

  const inputClass =
    "h-11 rounded-lg border border-black/[.08] bg-transparent px-4 text-sm text-black outline-none transition-colors focus:border-black/30 dark:border-white/[.145] dark:text-zinc-50 dark:focus:border-white/30";
  const labelClass =
    "text-sm font-medium text-zinc-700 dark:text-zinc-300";

  return (
    <div className="relative flex flex-1 flex-col items-center bg-white px-6 py-16 dark:bg-black">
      <button
        type="button"
        onClick={handleLogout}
        className="absolute left-6 top-6 text-sm font-medium text-zinc-600 transition-colors hover:text-black sm:left-12 sm:top-8 dark:text-zinc-400 dark:hover:text-zinc-50 cursor-pointer"
      >
        Log out
      </button>

      <div className="w-full max-w-lg">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Complete your profile
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          This is what we&apos;ll use to auto-fill your job applications.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="firstName" className={labelClass}>
                First name <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                placeholder="Jane"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="lastName" className={labelClass}>
                Last name <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                placeholder="Doe"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className={labelClass}>
                Phone
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                placeholder="+1 347 888 8888"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="location" className={labelClass}>
                Location
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="San Francisco, CA"
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="linkedinUrl" className={labelClass}>
              LinkedIn URL
            </label>
            <input
              id="linkedinUrl"
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="https://linkedin.com/in/janedoe"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="githubUrl" className={labelClass}>
              GitHub URL
            </label>
            <input
              id="githubUrl"
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/janedoe"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="portfolioUrl" className={labelClass}>
              Portfolio URL
            </label>
            <input
              id="portfolioUrl"
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://janedoe.dev"
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="resume" className={labelClass}>
              Resume
            </label>
            <input
              id="resume"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResume(e.target.files?.[0] ?? null)}
              className="text-sm text-zinc-600 file:mr-4 file:h-9 file:rounded-full file:border-0 file:bg-black/[.05] file:px-4 file:text-sm file:font-medium file:text-black dark:text-zinc-400 dark:file:bg-white/10 dark:file:text-zinc-50"
            />
            {resume && (
              <p className="text-xs text-zinc-500">{resume.name}</p>
            )}
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-black/[.08] p-4 dark:border-white/[.145]">
            <p className={labelClass}>Work authorization</p>

            <label className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={usAuthorized}
                onChange={(e) => setUsAuthorized(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-black/[.2] dark:border-white/20"
              />
              I am a US citizen or permanent resident
            </label>

            <label className="flex items-start gap-3 text-sm text-zinc-700 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={requiresSponsorship}
                onChange={(e) => setRequiresSponsorship(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-black/[.2] dark:border-white/20"
              />
              I require visa sponsorship
            </label>
          </div>

          <button
            type="submit"
            className="mt-2 flex h-11 items-center justify-center rounded-full bg-foreground text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            Save profile
          </button>
        </form>
      </div>
    </div>
  );
}
