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
            /* Brighten the original orb. Keep the glow inside compact icon bounds
               while preserving the original canvas, rings, sparks and motion. */
            .orb-stage {
              filter: drop-shadow(0 0 9px rgba(255, 105, 12, .48))
                      drop-shadow(0 0 18px rgba(255, 73, 0, .24)) !important;
            }
            .orb-shell {
              box-shadow: 0 0 16px rgba(255, 112, 12, .42),
                          0 0 34px rgba(255, 76, 0, .24),
                          0 0 58px rgba(255, 72, 0, .13) !important;
            }
            .orb-shell::before {
              box-shadow: inset -8px -10px 18px rgba(24, 5, 0, .24),
                          inset 8px 8px 18px rgba(255, 255, 255, .2),
                          inset 0 0 24px rgba(255, 181, 87, .28) !important;
            }
            .aura { opacity: .9 !important; filter: blur(12px) !important; }
            .aura::before { filter: blur(12px) !important; }
            .energy-ring {
              border-color: rgba(255, 173, 74, .72) !important;
              box-shadow: 0 0 7px rgba(255, 114, 12, .35),
                          inset 0 0 6px rgba(255, 187, 70, .18) !important;
            }
            .spark {
              box-shadow: 0 0 9px 3px rgba(255, 162, 49, .9),
                          0 0 20px 7px rgba(255, 77, 0, .48) !important;
            }
            :host([data-orb-size="icon"]) .orb-stage {
              width: 78% !important;
              height: 78% !important;
              filter: drop-shadow(0 0 5px rgba(255, 105, 12, .48))
                      drop-shadow(0 0 10px rgba(255, 73, 0, .24)) !important;
            }
            :host([data-orb-size="icon"]) .aura {
              filter: blur(5px) !important;
              opacity: .62 !important;
            }
            :host([data-orb-size="icon"]) .aura::before {
              filter: blur(5px) !important;
            }
            :host([data-orb-size="icon"]) .energy-ring {
              opacity: .82 !important;
              box-shadow: 0 0 4px rgba(255, 114, 12, .28) !important;
            }
            :host([data-orb-size="icon"]) .orb-shell {
              box-shadow: 0 0 7px rgba(255, 96, 0, .4),
                          0 0 13px rgba(255, 83, 0, .24) !important;
            }
            :host([data-orb-size="compact"]) .orb-stage {
              width: 88% !important;
              height: 88% !important;
            }
            :host([data-orb-size="compact"]) .aura {
              filter: blur(8px) !important;
              opacity: .78 !important;
            }
            :host([data-orb-size="compact"]) .energy-ring { opacity: .86 !important; }
            :host([data-orb-size="display"]) .aura {
              filter: blur(12px) !important;
              opacity: .84 !important;
            }
            :host([data-orb-size="display"]) .energy-ring { opacity: .94 !important; }
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
