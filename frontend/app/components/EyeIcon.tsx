export function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M1.5 10s3-6 8.5-6 8.5 6 8.5 6-3 6-8.5 6-8.5-6-8.5-6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ) : (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path
        d="M2.5 2.5l15 15M8.28 8.35a2.25 2.25 0 0 0 3.37 3.37M6.06 6.1C3.6 7.4 2 10 2 10s3 6 8.5 6c1.4 0 2.63-.38 3.68-.94M11.5 4.16c.66-.1 1.34-.16 2-.16 5.5 0 8.5 6 8.5 6s-.72 1.44-2.06 2.86"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
