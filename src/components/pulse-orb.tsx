"use client";

import { useEffect, useRef } from "react";

type PulseOrbProps = {
  state?: "thinking" | "working" | "listening" | "talking" | "ready" | "creative";
  size?: number;
  className?: string;
  label?: string;
};

/**
 * Mounts the user's original HTML orb inside Shadow DOM.
 * The original canvas drawing and styles are loaded directly from
 * /growth-ai-pulse-orb.html. There is no iframe or replacement drawing.
 */
export function PulseOrb({
  state = "thinking",
  size = 36,
  className = "",
  label = "Growth AI",
}: PulseOrbProps) {
  const hostRef = useRef<HTMLSpanElement>(null);
  const latestState = useRef(state);
  latestState.current = state;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    let root: ShadowRoot | null = null;

    async function mountOriginalOrb() {
      try {
        // This is the uploaded original HTML, not the old adapted version.
        const response = await fetch("/growth-ai-pulse-orb.html", {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(`Original orb source returned HTTP ${response.status}`);
        }

        const source = await response.text();
        if (cancelled) return;

        const parsed = new DOMParser().parseFromString(source, "text/html");
        const originalStyles = parsed.querySelector("style")?.textContent ?? "";
        const originalMarkup = parsed.body.innerHTML;
        const originalScript = parsed.querySelector("script")?.textContent ?? "";

        if (!originalStyles || !originalMarkup.includes('id="orbCanvas"') || !originalScript) {
          throw new Error("The uploaded orb HTML is missing its original style, canvas, or script.");
        }

        root = host.attachShadow({ mode: "open" });

        // :root is the document root in the uploaded standalone file.
        // :host is its Shadow-DOM equivalent; all declarations stay original.
        const scopedOriginalStyles = originalStyles.replace(/:root\s*\{/g, ":host {");

        root.innerHTML = `
          <style>
            ${scopedOriginalStyles}
            :host { --orb-size: 100%; --rate: 1; }
            .scene {
              width: 100% !important;
              height: 100% !important;
              min-height: 0 !important;
              padding: 0 !important;
              overflow: visible !important;
            }
            .orb-stage {
              width: 100% !important;
              height: 100% !important;
              min-height: 0 !important;
              aspect-ratio: 1;
            }
            .eyebrow, .brand, .subtitle, .status, .hint, .controls {
              display: none !important;
            }
          </style>
          ${originalMarkup}
        `;

        if (cancelled) return;

        // Keep the original canvas/animation code intact. Only scope its ID
        // lookups to this component and add a mode event for React to control it.
        let runnableScript = originalScript.replaceAll(
          "document.getElementById(",
          "root.getElementById(",
        );

        const modeAnchor = "  scene.dataset.mode = mode;";
        if (!runnableScript.includes(modeAnchor)) {
          throw new Error("Could not connect to the original orb's mode controller.");
        }
        runnableScript = runnableScript.replace(
          modeAnchor,
          `${modeAnchor}
  host.addEventListener("growthspace-orb-mode", (event) => {
    const nextMode = event.detail;
    if (modeOrder.includes(nextMode)) setMode(nextMode);
  });`,
        );

        new Function("root", "host", runnableScript)(root, host);

        // State might have changed while the original HTML was loading.
        host.dispatchEvent(
          new CustomEvent("growthspace-orb-mode", {
            detail: latestState.current,
          }),
        );
      } catch (error) {
        console.error("Growth AI could not initialize the uploaded original orb.", error);
      }
    }

    void mountOriginalOrb();

    return () => {
      cancelled = true;
      root?.replaceChildren();
    };
  }, []);

  useEffect(() => {
    hostRef.current?.dispatchEvent(
      new CustomEvent("growthspace-orb-mode", { detail: state }),
    );
  }, [state]);

  return (
    <span
      ref={hostRef}
      role="img"
      aria-label={label}
      className={`inline-flex shrink-0 items-center justify-center overflow-visible ${className}`}
      style={{ width: size, height: size, position: "relative" }}
    />
  );
}
