import { ImageResponse } from "next/og";
import { BRAND_NAME } from "@/config/brand";

export const alt = BRAND_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          background: "linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0d9488 100%)",
          padding: 80,
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#2dd4bf",
            marginBottom: 24,
          }}
        >
          {BRAND_NAME}
        </div>
        <div
          style={{
            fontSize: 36,
            color: "#f4f4f5",
            maxWidth: 800,
            lineHeight: 1.3,
          }}
        >
          Online supermarket with fast delivery
        </div>
      </div>
    ),
    { ...size },
  );
}
