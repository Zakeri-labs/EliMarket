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

type Scene = "directions" | "delivery" | "neighbourhood" | "generic";

type Palette = { from: string; to: string; deep: string; gold: string };

const PALETTES: Record<Scene, Palette> = {
  directions: { from: "#128a80", to: "#0a2f2c", deep: "#0a2f2c", gold: "#e0c199" },
  delivery: { from: "#1f9b8e", to: "#0c3a45", deep: "#0c3a45", gold: "#e0c199" },
  neighbourhood: { from: "#2f7d70", to: "#123a2f", deep: "#123a2f", gold: "#e6c9a0" },
  generic: { from: "#0f9e93", to: "#0b3b38", deep: "#0b3b38", gold: "#d9b78a" },
};

const FALLBACK_PALETTES: [string, string][] = [
  ["#0f9e93", "#0b3b38"],
  ["#c9a876", "#6b4f2a"],
  ["#2dd4bf", "#0f5f57"],
  ["#3f7d6e", "#123027"],
];

/** Pick an illustration by what the post is about (falls back to the generic motif). */
function sceneFor(slug: string): Scene {
  const s = slug.toLowerCase();
  if (/(find|direction|reach|visit|how-to|store|shop)/.test(s)) return "directions";
  if (/(deliver|delivery|area|coverage|ship|zone)/.test(s)) return "delivery";
  if (/(neighbourhood|neighborhood|mawaleh|mawalih|seeb|district|about)/.test(s))
    return "neighbourhood";
  return "generic";
}

type Props = {
  post: Pick<BlogPost, "slug" | "cover_url">;
  className?: string;
  priority?: boolean;
  /** `sizes` hint for the uploaded image; override for small thumbnails. */
  sizes?: string;
};

/**
 * Post cover. Uses the uploaded image when the post has one, otherwise draws a
 * clean branded illustration keyed to the post's topic (directions, delivery,
 * neighbourhood) so every post has a picture. Sits inside a `relative` box with
 * a fixed aspect ratio.
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
  const scene = sceneFor(post.slug);
  const palette =
    scene === "generic"
      ? {
          ...PALETTES.generic,
          from: FALLBACK_PALETTES[seed % FALLBACK_PALETTES.length][0],
          to: FALLBACK_PALETTES[seed % FALLBACK_PALETTES.length][1],
          deep: FALLBACK_PALETTES[seed % FALLBACK_PALETTES.length][1],
        }
      : PALETTES[scene];
  const gid = `bc-${scene}-${seed.toString(36)}`;

  return (
    <svg
      viewBox="0 0 800 450"
      preserveAspectRatio="xMidYMid slice"
      className={cn("h-full w-full", className)}
      role="presentation"
      aria-hidden
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={palette.from} />
          <stop offset="1" stopColor={palette.to} />
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill={`url(#${gid})`} />

      {scene === "directions" ? <DirectionsScene p={palette} seed={seed} /> : null}
      {scene === "delivery" ? <DeliveryScene p={palette} /> : null}
      {scene === "neighbourhood" ? <NeighbourhoodScene p={palette} /> : null}
      {scene === "generic" ? <GenericScene p={palette} seed={seed} /> : null}

      <text
        x="400"
        y="418"
        textAnchor="middle"
        fill="#ffffff"
        fillOpacity="0.82"
        fontSize="19"
        letterSpacing="6"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontWeight="600"
      >
        HILLS ELI MART
      </text>
    </svg>
  );
}

function Pin({ x, y, s, deep }: { x: number; y: number; s: number; deep: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="120" rx="42" ry="11" fill="#000000" opacity="0.18" />
      <path
        d="M0 116C0 116 60 44 60 -8C60 -41 33 -66 0 -66C-33 -66 -60 -41 -60 -8C-60 44 0 116 0 116Z"
        fill="#ffffff"
      />
      <circle cx="0" cy="-8" r="23" fill={deep} />
    </g>
  );
}

function DirectionsScene({ p, seed }: { p: Palette; seed: number }) {
  const drift = (seed % 24) - 12;
  return (
    <g>
      {/* map grid */}
      <g stroke="#ffffff" strokeOpacity="0.07" strokeWidth="2">
        <path d="M0 150 H800 M0 260 H800 M0 360 H800" />
        <path d="M160 0 V450 M360 0 V450 M560 0 V450" />
      </g>
      {/* sun */}
      <circle cx={112 + drift} cy="88" r="30" fill="#ffffff" opacity="0.18" />
      {/* ground */}
      <rect x="0" y="360" width="800" height="90" fill="#000000" opacity="0.14" />
      {/* dashed route to the store */}
      <path
        d="M-20 402 C 140 372 210 320 300 332"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.5"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="2 16"
      />
      {/* storefront */}
      <g transform="translate(300 186)">
        <rect x="0" y="46" width="300" height="140" rx="6" fill="#ffffff" opacity="0.95" />
        <rect x="0" y="0" width="300" height="30" rx="6" fill={p.deep} />
        {/* awning */}
        <path d="M-8 46 H308 L286 78 H14 Z" fill={p.gold} />
        {[14, 50, 86, 122, 158, 194, 230, 266].map((x) => (
          <path key={x} d={`M${x} 46 l-8 32 h22 z`} fill="#ffffff" opacity="0.2" />
        ))}
        {/* door + windows */}
        <rect x="128" y="112" width="44" height="74" rx="3" fill={p.to} opacity="0.85" />
        <rect x="30" y="100" width="70" height="46" rx="3" fill={p.from} opacity="0.7" />
        <rect x="200" y="100" width="70" height="46" rx="3" fill={p.from} opacity="0.7" />
      </g>
      <Pin x={450} y={132} s={0.62} deep={p.deep} />
    </g>
  );
}

function DeliveryScene({ p }: { p: Palette }) {
  return (
    <g>
      {/* coverage rings */}
      <g fill="none" stroke="#ffffff" strokeOpacity="0.14" strokeWidth="2" transform="translate(232 250)">
        <circle r="66" />
        <circle r="122" />
        <circle r="182" />
        <circle r="244" />
      </g>
      {/* neighbourhood dots */}
      <g fill="#ffffff" opacity="0.5">
        <circle cx="232" cy="250" r="6" />
        <circle cx="140" cy="170" r="4" />
        <circle cx="330" cy="128" r="4" />
        <circle cx="120" cy="340" r="4" />
        <circle cx="360" cy="352" r="4" />
      </g>
      {/* dashed delivery route across the map to a drop pin */}
      <path
        d="M232 250 C 320 220 380 300 470 300"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.5"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="2 16"
      />
      <Pin x={470} y={302} s={0.46} deep={p.deep} />
      {/* grocery bag, tucked in the top-right corner */}
      <g transform="translate(596 96)">
        <ellipse cx="52" cy="164" rx="62" ry="12" fill="#000000" opacity="0.18" />
        <path d="M4 38 H100 L112 158 H-8 Z" fill="#ffffff" opacity="0.96" />
        <path d="M4 38 H100 L98 60 H6 Z" fill="#000000" opacity="0.08" />
        <path d="M28 38 C 28 4 76 4 76 38" fill="none" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
        <path d="M52 80 C 34 80 28 104 52 112 C 76 104 70 80 52 80 Z" fill={p.gold} />
      </g>
    </g>
  );
}

function NeighbourhoodScene({ p }: { p: Palette }) {
  const buildings = [
    { x: 120, y: 210, w: 96, h: 160 },
    { x: 232, y: 150, w: 110, h: 220 },
    { x: 358, y: 244, w: 88, h: 126 },
    { x: 462, y: 176, w: 118, h: 194 },
    { x: 596, y: 232, w: 92, h: 138 },
  ];
  return (
    <g>
      {/* moon */}
      <circle cx="662" cy="92" r="36" fill="#ffffff" opacity="0.22" />
      {/* ground */}
      <rect x="0" y="368" width="800" height="82" fill="#000000" opacity="0.16" />
      {/* buildings */}
      {buildings.map((b, i) => (
        <g key={b.x}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} rx="4" fill="#ffffff" opacity={i % 2 ? 0.9 : 0.8} />
          {Array.from({ length: Math.floor(b.h / 34) }).map((_, r) =>
            Array.from({ length: Math.floor(b.w / 30) }).map((__, c) => (
              <rect
                key={`${r}-${c}`}
                x={b.x + 12 + c * 28}
                y={b.y + 16 + r * 32}
                width="14"
                height="16"
                rx="2"
                fill={p.to}
                opacity="0.55"
              />
            )),
          )}
        </g>
      ))}
      {/* palm tree */}
      <g transform="translate(104 372)">
        <path d="M0 0 C -7 -62 -3 -114 5 -156" fill="none" stroke={p.gold} strokeWidth="13" strokeLinecap="round" />
        <g stroke={p.gold} strokeWidth="11" strokeLinecap="round" fill="none">
          <path d="M5 -156 C -34 -176 -70 -172 -98 -150" />
          <path d="M5 -156 C 40 -178 78 -174 104 -150" />
          <path d="M5 -156 C -18 -196 -12 -228 10 -252" />
          <path d="M5 -156 C -52 -156 -82 -136 -100 -108" />
          <path d="M5 -156 C 52 -154 84 -132 102 -102" />
          <path d="M5 -156 C -30 -150 -46 -122 -52 -92" />
          <path d="M5 -156 C 34 -150 52 -124 60 -92" />
        </g>
        <circle cx="5" cy="-156" r="9" fill={p.gold} />
      </g>
      <Pin x={287} y={124} s={0.44} deep={p.deep} />
    </g>
  );
}

function GenericScene({ p, seed }: { p: Palette; seed: number }) {
  const drift = (seed % 40) - 20;
  return (
    <g>
      <g fill="none" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="2" transform={`translate(${620 + drift} 96)`}>
        <circle r="34" />
        <circle r="74" />
        <circle r="118" />
        <circle r="166" />
      </g>
      <path
        d="M -30 372 C 170 300 300 430 470 340 S 720 250 840 320"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.22"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="1 16"
      />
      <Pin x={400} y={196} s={1} deep={p.deep} />
    </g>
  );
}
