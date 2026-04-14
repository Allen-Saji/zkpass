// Custom ZKPass logo: shield with circuit-trace fingerprint pattern
export function ZKPassIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Shield outline */}
      <path
        d="M16 2L4 7v9c0 8.4 5.12 16.24 12 18 6.88-1.76 12-9.6 12-18V7L16 2z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Circuit fingerprint -- three curved traces */}
      <path
        d="M16 9v4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M16 13l-4 4v3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 13l4 4v3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Central node */}
      <circle cx="16" cy="13" r="1.8" fill="currentColor" />
      {/* Branch nodes */}
      <circle cx="12" cy="20" r="1.4" fill="currentColor" />
      <circle cx="20" cy="20" r="1.4" fill="currentColor" />
      {/* Top node */}
      <circle cx="16" cy="9" r="1.4" fill="currentColor" />
      {/* Lower branches */}
      <path
        d="M12 20l-2 3"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <path
        d="M20 20l2 3"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      {/* Tiny leaf nodes */}
      <circle cx="10" cy="23" r="1" fill="currentColor" />
      <circle cx="22" cy="23" r="1" fill="currentColor" />
    </svg>
  );
}
