"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon } from "../components/EyeIcon";
import { GoogleIcon } from "../components/GoogleIcon";
import { supabase } from "../lib/supabaseClient";

export default function SignIn() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn(e: React.SubmitEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (error) {
      setError("Invalid email or password.");
      return;
    }

    const onboardingCompleted = data.user?.user_metadata?.onboarding_completed;
    router.push(onboardingCompleted ? "/dashboard" : "/onboarding");
  }

  async function handleGoogleSignIn() {
    setError(null);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  }

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

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="mt-8 flex h-11 w-full items-center justify-center gap-2 rounded-full border border-black/[.08] text-sm font-medium text-black transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-50 dark:hover:bg-[#1a1a1a]"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-black/[.08] dark:bg-white/[.145]" />
            <span className="text-xs font-medium text-zinc-500">OR</span>
            <div className="h-px flex-1 bg-black/[.08] dark:bg-white/[.145]" />
          </div>

          <form onSubmit={handleSignIn} className="flex flex-col gap-4">
            {error && (
              <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}

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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
              disabled={loading}
              className="mt-2 flex h-11 items-center justify-center rounded-full bg-foreground text-sm font-medium text-background transition-colors hover:bg-[#383838] disabled:opacity-60 dark:hover:bg-[#ccc]"
            >
              {loading ? "Signing in…" : "Sign in"}
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
