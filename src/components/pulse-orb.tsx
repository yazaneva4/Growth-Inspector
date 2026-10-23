"use client";

import { useEffect, useRef } from "react";

type PulseOrbProps = {
  state?: "thinking" | "working" | "listening" | "talking" | "ready" | "creative";
  size?: number;
  className?: string;
  label?: string;
};

/** Uses the uploaded original orb source in Shadow DOM (not an iframe). */
export function PulseOrb({ state = "thinking", size = 36, className = "", label = "Growth AI" }: PulseOrbProps) {
  const hostRef = useRef<HTMLSpanElement>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;
    let root: ShadowRoot | undefined;

    (async () => {
      try {
        const response = await fetch("/siri-thinking-orb-original.html");
        if (!response.ok) throw new Error("Could not load original orb source");
        const source = await response.text();
        if (cancelled) return;
        const parsed = new DOMParser().parseFromString(source, "text/html");
        root = host.attachShadow({ mode: "open" });
        const style = parsed.querySelector("style")?.textContent ?? "";
        root.innerHTML = `<style>${style}
          :host{display:block;width:100%;height:100%;overflow:visible}
          html,body{width:100%;height:100%;min-height:0!important;margin:0!important}
          body{height:100%;min-height:0!important;background:transparent!important;overflow:visible!important}
          .scene{width:100%!important;height:100%!important;min-height:0!important;padding:0!important;overflow:visible!important}
          .orb-stage{width:100%!important;height:100%!important;min-height:0!important;aspect-ratio:1}
          .eyebrow,.brand,.subtitle,.status,.hint,.controls{display:none!important}
        </style>${parsed.body.innerHTML}`;
        const scriptText = parsed.querySelector("script")?.textContent ?? "";
        if (!root.querySelector("#orbShell") || !root.querySelector("#orbCanvas") || !scriptText) throw new Error("Original orb markup is incomplete");
        let runnable = scriptText.replaceAll("document.getElementById(", "root.getElementById(");
        runnable = runnable.replace(/window\.addEventListener\('message',[\s\S]*?\n  \}\);/, "host.addEventListener('growthspace-orb-mode', (event) => { const nextMode = event.detail; if (modeOrder.includes(nextMode)) setMode(nextMode); });");
        new Function("root", "host", runnable)(root, host);
        host.dispatchEvent(new CustomEvent("growthspace-orb-mode", { detail: stateRef.current }));
      } catch (error) {
        console.error("Growth AI orb failed to initialize", error);
      }
    })();

    return () => { cancelled = true; root?.replaceChildren(); };
  }, []);

  useEffect(() => {
    hostRef.current?.dispatchEvent(new CustomEvent("growthspace-orb-mode", { detail: state }));
  }, [state]);

  return <span ref={hostRef} role="img" aria-label={label} className={`inline-flex shrink-0 items-center justify-center overflow-visible ${className}`} style={{ width: size, height: size, position: "relative" }} />;
}
