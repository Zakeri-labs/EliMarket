import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

// The full site name, set in the site's own brand font (Cormorant Garamond),
// matching the uppercase, letter-spaced wordmark in the storefront header.
const SITE_NAME = "HILLS ELI MART";
const KICKER = "AL MAWALEH · SEEB · MUSCAT";
const TAGLINE = "Everyday groceries, fresh and close to home";

export const alt = `${SITE_NAME} — ${TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const assetsDir = join(process.cwd(), "src/assets");

const [heroPhoto, cormorantSemiBold, manropeRegular, manropeSemiBold] =
  await Promise.all([
    readFile(join(assetsDir, "og/hero-1200x630.jpg")),
    readFile(join(assetsDir, "fonts/CormorantGaramond-SemiBold.woff")),
    readFile(join(assetsDir, "fonts/Manrope-Regular.woff")),
    readFile(join(assetsDir, "fonts/Manrope-SemiBold.woff")),
  ]);

const heroSrc = `data:image/jpeg;base64,${heroPhoto.toString("base64")}`;

// Storefront dark theme tokens (src/app/globals.css → html.theme-dark).
const INK = "#f5f5f0";
const TEAL = "#2dd4bf";
const GOLD = "#c9a876";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          fontFamily: "Manrope",
        }}
      >
        {/* Full-bleed storefront photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroSrc}
          alt=""
          width={size.width}
          height={size.height}
          style={{ position: "absolute", top: 0, left: 0 }}
        />

        {/* Scrim — light over the faces up top, deep near the wordmark below */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            backgroundImage:
              "radial-gradient(130% 74% at 50% 122%, rgba(11,18,16,0.62) 0%, rgba(11,18,16,0) 62%), linear-gradient(180deg, rgba(11,18,16,0.32) 0%, rgba(11,18,16,0.05) 26%, rgba(11,18,16,0.34) 46%, rgba(11,18,16,0.76) 70%, rgba(11,18,16,0.97) 100%)",
          }}
        />

        {/* Gold hairline frame */}
        <div
          style={{
            position: "absolute",
            top: 32,
            left: 32,
            right: 32,
            bottom: 32,
            border: `1px solid ${GOLD}59`,
            borderRadius: 14,
            display: "flex",
          }}
        />

        {/* Wordmark block, anchored to the lower third */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 22,
            padding: "0 80px 62px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "Manrope",
              fontWeight: 600,
              fontSize: 22,
              letterSpacing: 10,
              color: TEAL,
              textShadow: "0 2px 16px rgba(0,0,0,0.6)",
            }}
          >
            {KICKER}
          </div>

          <div
            style={{
              display: "flex",
              fontFamily: "Cormorant Garamond",
              fontWeight: 600,
              fontSize: 110,
              lineHeight: 1,
              letterSpacing: 12,
              whiteSpace: "nowrap",
              color: INK,
              textShadow: "0 4px 30px rgba(0,0,0,0.65)",
            }}
          >
            {SITE_NAME}
          </div>

          <div
            style={{ display: "flex", width: 104, height: 2, background: GOLD }}
          />

          <div
            style={{
              display: "flex",
              fontFamily: "Manrope",
              fontWeight: 400,
              fontSize: 31,
              color: INK,
              textShadow: "0 2px 18px rgba(0,0,0,0.7)",
            }}
          >
            {TAGLINE}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Cormorant Garamond",
          data: cormorantSemiBold,
          style: "normal",
          weight: 600,
        },
        { name: "Manrope", data: manropeRegular, style: "normal", weight: 400 },
        { name: "Manrope", data: manropeSemiBold, style: "normal", weight: 600 },
      ],
    },
  );
}
