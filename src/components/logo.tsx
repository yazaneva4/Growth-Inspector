import Image from "next/image";

const OFFICIAL_LOGO = "/growthspace-official-logo.webp";

/** Official GrowthSpace logo mark, cropped from the supplied company logo artwork. */
export function LogoMark({
  size = 36,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 bg-left bg-no-repeat ${className}`}
      style={{
        width: size,
        height: size,
        backgroundImage: `url("${OFFICIAL_LOGO}")`,
        backgroundSize: `auto ${size}px`,
        backgroundPosition: "left center",
      }}
    />
  );
}

/** Full official GrowthSpace logo, including the stacked wordmark. */
export function Logo({
  variant = "dark",
  size = 46,
}: {
  variant?: "dark" | "light";
  size?: number;
}) {
  return (
    <span className="inline-flex shrink-0" data-logo-variant={variant}>
      <Image
        src={OFFICIAL_LOGO}
        alt="GrowthSpace"
        width={440}
        height={179}
        style={{ height: size, width: "auto" }}
        className="block shrink-0"
      />
    </span>
  );
}
