import { useId } from "react";

/**
 * GrowthSpace brand mark (official logo): an orange "G" ring whose arm turns
 * inward, with a navy tile in its opening. Geometry is traced from the brand
 * file — do not restyle. Shapes are drawn inset by 14 and stroked 28 wide in
 * the same fill so every corner gets the logo's soft rounding.
 */
export function LogoMark({
  size = 36,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  // Unique per instance: this component renders more than once per page and
  // duplicated gradient ids resolve against the first (possibly hidden) copy.
  const uid = useId().replace(/:/g, "");
  const orange = `gs-orange-${uid}`;
  const navy = `gs-navy-${uid}`;
  return (
    <svg
      width={size}
      height={size * (935 / 940)}
      viewBox="530 66 940 935"
      className={`flex-shrink-0 ${className}`}
      aria-hidden
    >
      <defs>
        <linearGradient id={orange} gradientUnits="userSpaceOnUse" x1="880" y1="480" x2="1260" y2="820">
          <stop offset="0" stopColor="#F38049" />
          <stop offset="1" stopColor="#EE5122" />
        </linearGradient>
        <linearGradient id={navy} gradientUnits="userSpaceOnUse" x1="0" y1="80" x2="0" y2="477">
          <stop offset="0" stopColor="#18234E" />
          <stop offset="0.52" stopColor="#3C5399" />
          <stop offset="1" stopColor="#18234E" />
        </linearGradient>
      </defs>
      <path
        d="M 930 101.6 A 439 439 0 1 0 1433.5 604 L 1070 604 L 1070 697 L 1195 697 Q 1236 700 1247 748 A 328 328 0 1 1 930 214.6 Z"
        fill={`url(#${orange})`}
        stroke={`url(#${orange})`}
        strokeWidth="28"
        strokeLinejoin="round"
      />
      <path
        d="M 1086 110 H 1423 V 447 H 1332.6 A 344 344 0 0 0 1086 202 Z"
        fill={`url(#${navy})`}
        stroke={`url(#${navy})`}
        strokeWidth="60"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Full lockup: mark + stacked "Growth / Space" wordmark. */
export function Logo({
  variant = "dark",
  size = 46,
}: {
  variant?: "dark" | "light";
  size?: number;
}) {
  const text = variant === "dark" ? "text-white" : "text-[#0F2050]";
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark size={size} />
      <div className={`text-[1.05rem] font-extrabold leading-[1.05] tracking-tight ${text}`} style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }} aria-label="GrowthSpace">
        <div>Growth</div>
        <div>Space</div>
      </div>
    </div>
  );
}
