import { ImageResponse } from "next/og";

export const alt =
  "GrowthSpace — AI customer engagement for Saudi Arabia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// No emoji in this card: next/og downloads emoji glyphs from a CDN at build
// time, which fails any offline or egress-restricted build.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #070F2E 0%, #0F1B4A 100%)",
          color: "#f1f5f9",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 34,
            color: "#F26522",
            marginBottom: 32,
          }}
        >
          {/* GrowthSpace mark (flat fills: the OG renderer has unreliable gradient support) */}
          <svg width="62" height="62" viewBox="530 66 940 935">
            <path d="M 930 101.6 A 439 439 0 1 0 1433.5 604 L 1070 604 L 1070 697 L 1195 697 Q 1236 700 1247 748 A 328 328 0 1 1 930 214.6 Z"
              fill="#F26B35" stroke="#F26B35" strokeWidth="28" strokeLinejoin="round" />
            <path d="M 1086 110 H 1423 V 447 H 1332.6 A 344 344 0 0 0 1086 202 Z"
              fill="#2A3B78" stroke="#2A3B78" strokeWidth="60" strokeLinejoin="round" />
          </svg>
          GrowthSpace
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.15, maxWidth: 980 }}>
          The AI that answers your customers — in their own dialect.
        </div>
        <div style={{ fontSize: 30, color: "#94a3b8", marginTop: 28, maxWidth: 900 }}>
          Autonomous Arabic + English replies across WhatsApp, Instagram, X,
          email &amp; phone calls · Built for Saudi Arabia
        </div>
      </div>
    ),
    { ...size },
  );
}
