"use client";

import { useEffect, useRef } from "react";
import "./pulse-orb.css";

type PulseOrbProps = {
  state?: "thinking" | "working" | "listening" | "talking" | "ready";
  size?: number;
  className?: string;
  label?: string;
};

/** The user's custom Pulse Orb, adapted from siri_thinking_orb-3.html for Growth AI. */
export function PulseOrb({
  state = "thinking",
  size = 36,
  className = "",
  label = "Growth AI",
}: PulseOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shellRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const shell = shellRef.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !shell || !ctx) return;

    let raf = 0;
    let start = performance.now();
    let lastSize = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const speed = state === "working" ? 1.48 : state === "listening" ? 0.72 : state === "talking" ? 1.12 : 1;
    const ambient = true;

    function radialGlow(x: number, y: number, radius: number, inner: string, outer: string) {
      const gradient = ctx!.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, inner);
      gradient.addColorStop(1, outer);
      return gradient;
    }

    function draw(now: number) {
      const actualSize = lastSize || shell!.getBoundingClientRect().width;
      if (!actualSize) return;
      const elapsed = reduceMotion ? 0 : ((now - start) / 1000) * speed;
      const r = actualSize * 0.49;
      ctx!.clearRect(0, 0, actualSize, actualSize);
      ctx!.save();
      ctx!.translate(actualSize / 2, actualSize / 2);
      ctx!.beginPath();
      ctx!.arc(0, 0, r, 0, Math.PI * 2);
      ctx!.clip();

      const base = ctx!.createRadialGradient(-r * .28, -r * .36, r * .025, 0, 0, r * 1.23);
      base.addColorStop(0, "#fff0b0");
      base.addColorStop(.10, "#ffd078");
      base.addColorStop(.27, "#ff921e");
      base.addColorStop(.51, "#f24b04");
      base.addColorStop(.76, "#9f2500");
      base.addColorStop(1, "#260700");
      ctx!.fillStyle = base;
      ctx!.fillRect(-r, -r, r * 2, r * 2);

      if (ambient && "createConicGradient" in ctx!) {
        const conic = (ctx as CanvasRenderingContext2D & { createConicGradient?: (startAngle: number, x: number, y: number) => CanvasGradient }).createConicGradient;
        if (conic) {
          const flow = conic.call(ctx, elapsed * .22, Math.sin(elapsed * .17) * r * .12, Math.cos(elapsed * .14) * r * .1);
          flow.addColorStop(0, "rgba(255,225,133,.10)");
          flow.addColorStop(.12, "rgba(255,89,4,.48)");
          flow.addColorStop(.25, "rgba(255,182,47,.40)");
          flow.addColorStop(.40, "rgba(220,47,0,.20)");
          flow.addColorStop(.58, "rgba(255,123,8,.53)");
          flow.addColorStop(.74, "rgba(255,214,91,.34)");
          flow.addColorStop(.88, "rgba(255,69,0,.30)");
          flow.addColorStop(1, "rgba(255,225,133,.10)");
          ctx!.globalCompositeOperation = "screen";
          ctx!.fillStyle = flow;
          ctx!.fillRect(-r, -r, r * 2, r * 2);
        }
      }

      const blobs = [
        { a: .56, b: .48, s: .73, w: .62, phase: .1, c: "rgba(255,194,56,.92)" },
        { a: .48, b: .58, s: .65, w: -.47, phase: 1.8, c: "rgba(255,80,0,.92)" },
        { a: .62, b: .42, s: .50, w: .82, phase: 3.1, c: "rgba(255,225,132,.62)" },
        { a: .42, b: .68, s: .58, w: -.72, phase: 4.6, c: "rgba(226,48,0,.78)" },
        { a: .38, b: .36, s: .42, w: .95, phase: 2.5, c: "rgba(255,151,22,.82)" },
      ];
      ctx!.globalCompositeOperation = "screen";
      for (let i = 0; i < blobs.length; i++) {
        const b = blobs[i];
        const angle = elapsed * b.w + b.phase;
        const x = Math.cos(angle) * r * b.a + Math.sin(elapsed * .31 + b.phase) * r * .12;
        const y = Math.sin(angle * .83) * r * b.b + Math.cos(elapsed * .27 + b.phase) * r * .10;
        const radius = r * b.s * (.84 + .11 * Math.sin(elapsed * .9 + i));
        ctx!.fillStyle = radialGlow(x, y, radius, b.c, "rgba(255,80,0,0)");
        ctx!.fillRect(-r, -r, r * 2, r * 2);
      }
      ctx!.globalCompositeOperation = "source-over";
      ctx!.restore();
    }

    function frame(now: number) {
      draw(now);
      if (!reduceMotion) raf = window.requestAnimationFrame(frame);
    }
    function resize() {
      const boxSize = shell!.getBoundingClientRect().width;
      if (!boxSize || Math.abs(boxSize - lastSize) < .5) return;
      lastSize = boxSize;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(boxSize * dpr);
      canvas!.height = Math.round(boxSize * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(performance.now());
    }

    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    observer?.observe(shell);
    window.addEventListener("resize", resize);
    resize();
    if (!reduceMotion) raf = window.requestAnimationFrame(frame);
    return () => {
      window.cancelAnimationFrame(raf);
      observer?.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [state]);

  return (
    <span
      ref={shellRef}
      className={`pulse-orb ${className}`}
      data-state={state}
      role="img"
      aria-label={label}
      style={{ width: size, height: size, ["--orb-rate" as string]: state === "working" ? 1.48 : state === "listening" ? .72 : 1 }}
    >
      <span className="pulse-orb__aura" aria-hidden="true" />
      <span className="pulse-orb__ring pulse-orb__ring--one" aria-hidden="true" />
      <span className="pulse-orb__ring pulse-orb__ring--two" aria-hidden="true" />
      <span className="pulse-orb__ring pulse-orb__ring--three" aria-hidden="true" />
      <span className="pulse-orb__core" aria-hidden="true"><canvas ref={canvasRef} /></span>
      <span className="pulse-orb__spark pulse-orb__spark--one" aria-hidden="true" />
      <span className="pulse-orb__spark pulse-orb__spark--two" aria-hidden="true" />
      <span className="pulse-orb__spark pulse-orb__spark--three" aria-hidden="true" />
    </span>
  );
}
