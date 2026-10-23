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
    const orbHost: HTMLSpanElement = host;

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

        root = orbHost.shadowRoot ?? orbHost.attachShadow({ mode: "open" });

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
            /* Tiny nav/chat versions keep the orb visible without its glow
               washing over labels, text, or neighbouring buttons. */
            :host([data-orb-size="icon"]) .orb-stage {
              width: 72% !important;
              height: 72% !important;
              filter: none !important;
            }
            :host([data-orb-size="icon"]) .aura {
              filter: blur(2px) !important;
              opacity: .45 !important;
            }
            :host([data-orb-size="icon"]) .energy-ring {
              opacity: .45 !important;
              box-shadow: none !important;
            }
            :host([data-orb-size="icon"]) .orb-shell {
              box-shadow: 0 0 4px rgba(255, 96, 0, .18) !important;
            }
            :host([data-orb-size="compact"]) .orb-stage {
              width: 84% !important;
              height: 84% !important;
            }
            :host([data-orb-size="compact"]) .aura {
              filter: blur(5px) !important;
              opacity: .58 !important;
            }
            :host([data-orb-size="compact"]) .energy-ring {
              opacity: .6 !important;
            }
            :host([data-orb-size="display"]) .aura {
              filter: blur(10px) !important;
              opacity: .72 !important;
            }
            :host([data-orb-size="display"]) .energy-ring {
              opacity: .8 !important;
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
  });
  host.addEventListener("growthspace-orb-dispose", () => {
    paused = true;
    cancelAnimationFrame(raf);
  });`,
        );

        new Function("root", "host", runnableScript)(root, orbHost);

        // State might have changed while the original HTML was loading.
        orbHost.dispatchEvent(
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
      orbHost.dispatchEvent(new CustomEvent("growthspace-orb-dispose"));
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
      data-orb-size={size <= 24 ? "icon" : size <= 44 ? "compact" : size <= 72 ? "display" : "full"}
      className={`inline-flex shrink-0 items-center justify-center overflow-visible ${className}`}
      style={{ width: size, height: size, position: "relative" }}
    />
  );
}
