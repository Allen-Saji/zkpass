import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ZKPass - Zero-Knowledge Identity Protocol";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#141416",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle grid background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(108,255,50,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(108,255,50,0.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Glow behind logo */}
        <div
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(108,255,50,0.12) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -60%)",
          }}
        />

        {/* Logo icon inline */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <svg
            viewBox="0 0 32 32"
            width="80"
            height="80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 2L4 7v9c0 8.4 5.12 16.24 12 18 6.88-1.76 12-9.6 12-18V7L16 2z"
              stroke="#6CFF32"
              strokeWidth="1.8"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M16 9v4"
              stroke="#6CFF32"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d="M16 13l-4 4v3"
              stroke="#6CFF32"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16 13l4 4v3"
              stroke="#6CFF32"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="16" cy="13" r="1.8" fill="#6CFF32" />
            <circle cx="12" cy="20" r="1.4" fill="#6CFF32" />
            <circle cx="20" cy="20" r="1.4" fill="#6CFF32" />
            <circle cx="16" cy="9" r="1.4" fill="#6CFF32" />
            <path
              d="M12 20l-2 3"
              stroke="#6CFF32"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M20 20l2 3"
              stroke="#6CFF32"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <circle cx="10" cy="23" r="1" fill="#6CFF32" />
            <circle cx="22" cy="23" r="1" fill="#6CFF32" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 0,
            fontSize: 64,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            marginBottom: 16,
          }}
        >
          <span style={{ color: "#ffffff" }}>zk</span>
          <span style={{ color: "#6CFF32" }}>pass</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 24,
            color: "rgba(224, 232, 255, 0.6)",
            maxWidth: 600,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Prove who you are. Reveal nothing.
        </div>

        {/* Tech badges */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 40,
          }}
        >
          {["Groth16", "Circom", "HashKey Chain", "Sybil Resistant"].map(
            (label) => (
              <div
                key={label}
                style={{
                  padding: "6px 16px",
                  borderRadius: 8,
                  border: "1px solid rgba(108, 255, 50, 0.2)",
                  background: "rgba(108, 255, 50, 0.06)",
                  fontSize: 14,
                  color: "rgba(108, 255, 50, 0.7)",
                  fontFamily: "monospace",
                }}
              >
                {label}
              </div>
            )
          )}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background:
              "linear-gradient(90deg, transparent, #6CFF32, transparent)",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
