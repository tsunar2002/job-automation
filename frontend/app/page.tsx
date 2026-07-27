const steps = [
  {
    label: "01",
    title: "Discover",
    description:
      "We scan GitHub job repos, job boards, and web searches to find roles that match your profile — deduplicated automatically.",
  },
  {
    label: "02",
    title: "Auto-Apply",
    description:
      "Browser automation fills out and submits applications using your profile, resume, and links. Dry-run first, live when you're ready.",
  },
  {
    label: "03",
    title: "Track",
    description:
      "Every application status — queued, applied, interview, rejected — lands in one dashboard so nothing falls through the cracks.",
  },
];

const statuses = [
  { name: "Queued", color: "bg-zinc-400 dark:bg-zinc-600" },
  { name: "Applied", color: "bg-blue-500" },
  { name: "Interview", color: "bg-amber-500" },
  { name: "Rejected", color: "bg-red-500" },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-black">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-5 sm:px-12">
        <span className="text-lg font-semibold tracking-tight text-black dark:text-zinc-50">
          TBD
        </span>
        <div className="flex items-center gap-6">
          <a
            href="/sign-in"
            className="flex h-9 items-center justify-center rounded-full bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            Sign in
          </a>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center px-6 pt-16 pb-24 text-center sm:px-12 sm:pt-24">
        <span className="rounded-full border border-black/[.08] px-3 py-3 text-sm font-medium text-zinc-600 dark:border-white/[.145] dark:text-zinc-400">
          Discover → Apply → Track
        </span>

        <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-black sm:text-5xl dark:text-zinc-50">
          Your job search, on autopilot.
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          TBD scrapes tech job postings, fills out applications for
          you, and keeps every status in one place — so you spend less time
          on forms and more time interviewing.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            href="#how-it-works"
            className="flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-base font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            See how it works
          </a>
        </div>

        {/* Status pipeline preview */}
        <div className="mt-20 flex flex-wrap items-center justify-center gap-3">
          {statuses.map((status) => (
            <span
              key={status.name}
              className="flex items-center gap-2 rounded-full border border-black/[.08] px-4 py-2 text-sm text-zinc-700 dark:border-white/[.145] dark:text-zinc-300"
            >
              <span className={`h-2 w-2 rounded-full ${status.color}`} />
              {status.name}
            </span>
          ))}
        </div>
      </main>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-t border-black/[.08] px-6 py-24 sm:px-12 dark:border-white/[.145]"
      >
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-black sm:text-4xl dark:text-zinc-50">
            How it works
          </h2>

          <div className="mt-16 grid gap-10 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.label} className="flex flex-col gap-3">
                <span className="text-sm font-medium text-zinc-400 dark:text-zinc-600">
                  {step.label}
                </span>
                <h3 className="text-xl font-semibold text-black dark:text-zinc-50">
                  {step.title}
                </h3>
                <p className="text-base leading-7 text-zinc-600 dark:text-zinc-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/[.08] px-6 py-8 text-center text-sm text-zinc-500 sm:px-12 dark:border-white/[.145] dark:text-zinc-500">
        Built to end the copy-paste job application grind.
      </footer>
    </div>
  );
}
