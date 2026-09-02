import { cn } from "@/app/utils/cn";
import { StorefrontImage } from "@/components/ui/StorefrontImage";
import type { BlogPost } from "@/app/_types/database.types";

/** Deterministic non-negative hash of a string. */
function hashString(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Brand-tinted gradient pairs for the generated cover art. */
const PALETTES: [string, string][] = [
  ["#0f9e93", "#0b3b38"],
  ["#c9a876", "#6b4f2a"],
  ["#2dd4bf", "#0f5f57"],
  ["#3f7d6e", "#123027"],
];

type Props = {
  post: Pick<BlogPost, "slug" | "cover_url">;
  className?: string;
  priority?: boolean;
  /** `sizes` hint for the uploaded image; override for small thumbnails. */
  sizes?: string;
};

/**
 * Post cover. Uses the uploaded image when the post has one, otherwise draws a
 * clean branded "postcard" (gradient + map motif + pin) so every post has a
 * picture. Meant to sit inside a `relative` box with a fixed aspect ratio.
 */
export function BlogCover({ post, className, priority, sizes }: Props) {
  if (post.cover_url) {
    return (
      <StorefrontImage
        src={post.cover_url}
        alt=""
        fill
        sizes={sizes ?? "(min-width: 1024px) 720px, 100vw"}
        priority={priority}
        className={cn("object-cover", className)}
      />
    );
  }

  const seed = hashString(post.slug);
  const [from, to] = PALETTES[seed % PALETTES.length];
  const gradientId = `bc-${seed.toString(36)}`;
  const drift = (seed % 40) - 20;

  return (
    <svg
      viewBox="0 0 800 450"
      preserveAspectRatio="xMidYMid slice"
      className={cn("h-full w-full", className)}
      role="presentation"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill={`url(#${gradientId})`} />

      {/* concentric "radar" rings */}
      <g
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.16"
        strokeWidth="2"
        transform={`translate(${620 + drift} 96)`}
      >
        <circle r="34" />
        <circle r="74" />
        <circle r="118" />
        <circle r="166" />
      </g>

      {/* dashed route line */}
      <path
        d="M -30 372 C 170 300 300 430 470 340 S 720 250 840 320"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.22"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="1 16"
      />

      {/* map pin */}
      <g transform="translate(400 214)">
        <ellipse cx="0" cy="118" rx="46" ry="12" fill="#000000" opacity="0.18" />
        <path
          d="M0 116C0 116 62 44 62 -6C62 -40 34 -66 0 -66C-34 -66 -62 -40 -62 -6C-62 44 0 116 0 116Z"
          fill="#ffffff"
        />
        <circle cx="0" cy="-6" r="24" fill={to} />
      </g>

      <text
        x="400"
        y="410"
        textAnchor="middle"
        fill="#ffffff"
        fillOpacity="0.85"
        fontSize="20"
        letterSpacing="6"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontWeight="600"
      >
        HILLS ELI MART
      </text>
    </svg>
  );
}
