"use client";

import { useState } from "react";
import { EyeIcon } from "../components/EyeIcon";

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      {/* Left: graphic panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-zinc-950 px-12 py-12 lg:flex lg:w-1/2">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.06),transparent_45%)]" />

        <a
          href="/"
          className="relative text-lg font-semibold tracking-tight text-zinc-50"
        >
          TBD
        </a>

        <div className="relative flex flex-col gap-10">
          <blockquote className="max-w-md text-2xl font-medium leading-snug text-zinc-50">
            &ldquo;Discover, apply, and track — your whole job search running
            on autopilot.&rdquo;
          </blockquote>

          <ul className="flex flex-col gap-5">
            {[
              {
                title: "Discover",
                description: "Finds tech jobs across GitHub, boards, and the web.",
              },
              {
                title: "Auto-Apply",
                description: "Fills out and submits applications for you.",
              },
              {
                title: "Track",
                description: "Every status, in one dashboard.",
              },
            ].map((step, i) => (
              <li key={step.title} className="flex items-start gap-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-xs font-medium text-zinc-300">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-zinc-50">
                    {step.title}
                  </p>
                  <p className="text-sm text-zinc-400">{step.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-zinc-500">
          Built to end the copy-paste job application grind.
        </p>
      </div>

      {/* Right: sign-in form */}
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
            Sign in
          </h1>
          <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Welcome back. Enter your details to continue.
          </p>

          <form className="mt-8 flex flex-col gap-4">
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

            <button
              type="submit"
              className="mt-2 flex h-11 items-center justify-center rounded-full bg-foreground text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            >
              Sign in
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Don&apos;t have an account?{" "}
            <a
              href="/sign-up"
              className="font-medium text-black underline underline-offset-4 dark:text-zinc-50"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
