/** Original Bulldogs Build hallmark. A shop stamp, not the live mascot and not a Yale athletics mark. */
export function BulldogMark({ className = "h-11 w-11 shrink-0" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="31" fill="#C4A35A" />
      <circle cx="32" cy="32" r="27.2" fill="#04182E" />
      <path fill="#F4F0E8" d="M25 24c-7-3-9 4-4 7 2-2 4-3 4-7z" />
      <path
        fill="#F4F0E8"
        d="M18 47C16 34 22 22 34 20 40 19 44 24 44 29 47 27 52 29 51 33 49 35 45 35 43 36.5L33 38 53 44C55 49 48 56 34 56 22 56 16 52 18 47Z"
      />
      <path d="M46.5 30.2c2.2 0 3.6 1.1 3.6 2.4-1.5.7-3 .5-3.6-.5z" fill="#04182E" />
      <circle cx="36.5" cy="27" r="1.45" fill="#04182E" />
      <path d="M31 24.5c2.4 1 4.6 1 6.4 0" fill="none" stroke="#04182E" strokeWidth="1.05" strokeLinecap="round" />
      <path d="M33 32.2c2.8.8 5.2.1 7-1.1" fill="none" stroke="#04182E" strokeWidth="1.05" strokeLinecap="round" />
    </svg>
  );
}
