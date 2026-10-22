import type { SVGProps } from "react";

export type GrowthAiIconName =
  | "trash"
  | "archive"
  | "restore"
  | "edit"
  | "browser"
  | "plus"
  | "search"
  | "send"
  | "close"
  | "external"
  | "refresh"
  | "sparkle"
  | "chevron-down"
  | "check"
  | "shield";

export function GrowthAiIcon({
  name,
  size = 16,
  ...props
}: SVGProps<SVGSVGElement> & { name: GrowthAiIconName; size?: number }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      {...common}
      {...props}
    >
      {name === "trash" && <>
        <path d="M4 7h16" />
        <path d="M9 7V4h6v3" />
        <path d="m6 7 1 13h10l1-13" />
        <path d="M10 11v5M14 11v5" />
      </>}
      {name === "archive" && <>
        <path d="M4 4h16v4H4z" />
        <path d="M6 8v12h12V8M9 12h6" />
      </>}
      {name === "restore" && <>
        <path d="M4 10V5m0 0h5M4 5l4 4" />
        <path d="M4.8 14a7.5 7.5 0 1 0 2.1-6" />
        <path d="M12 8v4l3 2" />
      </>}
      {name === "edit" && <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
      </>}
      {name === "browser" && <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18" />
        <path d="M7 6.5h.01M10 6.5h.01M13 6.5h.01" />
        <path d="M8 13h8M8 16h5" />
      </>}
      {name === "plus" && <path d="M12 5v14M5 12h14" />}
      {name === "search" && <>
        <circle cx="10.8" cy="10.8" r="6.8" />
        <path d="m16 16 4.5 4.5" />
      </>}
      {name === "send" && <path d="m22 2-7 20-4-9-9-4Z M22 2 11 13" />}
      {name === "close" && <path d="m6 6 12 12M18 6 6 18" />}
      {name === "external" && <>
        <path d="M14 4h6v6M20 4l-9 9" />
        <path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" />
      </>}
      {name === "refresh" && <>
        <path d="M20 7v5h-5M4 17v-5h5" />
        <path d="M5.6 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.4-3" />
      </>}
      {name === "sparkle" && <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9Z" />}
      {name === "chevron-down" && <path d="m6 9 6 6 6-6" />}
      {name === "check" && <path d="m5 12 4 4L19 6" />}
      {name === "shield" && <path d="M12 3 20 6v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6Z M9 12l2 2 4-4" />}
    </svg>
  );
}
