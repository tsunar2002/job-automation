"use client";

import { useState } from "react";
import { EyeIcon } from "../components/EyeIcon";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      {/* Left: graphic panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-zinc-400 px-12 py-12 lg:flex lg:w-1/2">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />

        <a
          href="/"
          className="relative text-lg font-semibold tracking-tight text-black"
        >
          TBD
        </a>

        <div className="relative flex flex-col gap-10">
          <h2 className="max-w-md text-2xl font-medium leading-snug text-black">
            Stop copy-pasting the same application into 50 different forms.
          </h2>

          <ul className="flex flex-col gap-4">
            {[
              "Auto-discover roles across GitHub, boards, and the web",
              "One-click apply using your saved profile and resume",
              "Real-time status tracking — no spreadsheets",
              "Dry-run mode, so you're always in control",
            ].map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black text-white">
                  <svg
                    viewBox="0 0 12 12"
                    fill="none"
                    className="h-3 w-3"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 6.5L4.5 9L10 3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <p className="text-sm text-zinc-700">{benefit}</p>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-zinc-500">
          Built to end the copy-paste job application grind.
        </p>
      </div>

      {/* Right: sign-up form */}
      <div className="relative flex flex-1 flex-col items-center justify-center bg-white px-6 py-16 dark:bg-black">
        <a
          href="/"
          className="absolute left-6 top-6 flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition-colors hover:text-black sm:left-12 sm:top-8 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          <span aria-hidden="true">←</span> Back
        </a>

        <div className="w-full max-w-sm">
          <a
            href="/"
            className="mb-8 block text-center text-lg font-semibold tracking-tight text-black lg:hidden dark:text-zinc-50"
          >
            TBD
          </a>

          <h1 className="text-center text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            Create your account
          </h1>
          <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Start automating your job search in minutes.
          </p>

          <form className="mt-8 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="name"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Jane Doe"
                className="h-11 rounded-lg border border-black/[.08] bg-transparent px-4 text-sm text-black outline-none transition-colors focus:border-black/30 dark:border-white/[.145] dark:text-zinc-50 dark:focus:border-white/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="h-11 rounded-lg border border-black/[.08] bg-transparent px-4 text-sm text-black outline-none transition-colors focus:border-black/30 dark:border-white/[.145] dark:text-zinc-50 dark:focus:border-white/30"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-lg border border-black/[.08] bg-transparent px-4 pr-11 text-sm text-black outline-none transition-colors focus:border-black/30 dark:border-white/[.145] dark:text-zinc-50 dark:focus:border-white/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-zinc-500 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="confirm-password"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-lg border border-black/[.08] bg-transparent px-4 pr-11 text-sm text-black outline-none transition-colors focus:border-black/30 dark:border-white/[.145] dark:text-zinc-50 dark:focus:border-white/30"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-zinc-500 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
                >
                  <EyeIcon open={showConfirmPassword} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 flex h-11 items-center justify-center rounded-full bg-foreground text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            >
              Create account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Already have an account?{" "}
            <a
              href="/sign-in"
              className="font-medium text-black underline underline-offset-4 dark:text-zinc-50"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
