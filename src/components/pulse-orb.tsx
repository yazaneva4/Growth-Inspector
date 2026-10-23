"use client";

import { useEffect, useRef } from "react";

type PulseOrbProps = {
  state?: "thinking" | "working" | "listening" | "talking" | "ready" | "creative";
  size?: number;
  className?: string;
  label?: string;
};

/**
 * Embeds the exact canvas orb from the user's siri_thinking_orb-3.html.
 * The source's canvas drawing, plasma fields, energy rings, sparks, and animation
 * keyframes are preserved; only the standalone demo framing is hidden.
 */
export function PulseOrb({
  state = "thinking",
  size = 36,
  className = "",
  label = "Growth AI",
}: PulseOrbProps) {
  const frameRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    frameRef.current?.contentWindow?.postMessage(
      { type: "growthspace-pulse-orb-mode", mode: state },
      window.location.origin,
    );
  }, [state]);

  return (
    <span
      role="img"
      aria-label={label}
      className={`inline-flex shrink-0 items-center justify-center overflow-visible ${className}`}
      style={{ width: size, height: size, position: "relative" }}
    >
      <iframe
        ref={frameRef}
        title={label}
        src="/growth-ai-pulse-orb.html"
        aria-hidden="true"
        tabIndex={-1}
        className="pointer-events-none border-0"
        style={{
          position: "absolute",
          width: size * 1.5,
          height: size * 1.5,
          left: -size * 0.25,
          top: -size * 0.25,
          maxWidth: "none",
          background: "transparent",
        }}
      />
    </span>
  );
}
