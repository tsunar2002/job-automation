"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export function AuthNav() {
  const [email, setEmail] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setEmail(session?.user.email ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // Avoid a flash of the wrong state while the session is being checked.
  if (email === undefined) {
    return <div className="h-9 w-24" />;
  }

  if (email) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          {email}
        </span>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="flex h-9 items-center justify-center rounded-full border border-black/[.08] px-4 text-sm font-medium text-black transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-50 dark:hover:bg-[#1a1a1a]"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <a
      href="/sign-in"
      className="flex h-9 items-center justify-center rounded-full bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
    >
      Sign in
    </a>
  );
}
