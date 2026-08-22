import { NextResponse } from "next/server";
import { publicEnv } from "@/config/env";

/** Dev-only env check — compare local vs Vercel deployment. */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  try {
    const url = new URL(publicEnv.supabaseUrl);
    const key = publicEnv.supabaseAnonKey;

    return NextResponse.json({
      ok: true,
      supabaseHost: url.hostname,
      anonKeyPrefix: key.slice(0, 20),
      anonKeyLength: key.length,
      appUrl: publicEnv.appUrl,
      nodeEnv: process.env.NODE_ENV,
      onVercel: Boolean(process.env.VERCEL),
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Invalid environment",
      },
      { status: 500 },
    );
  }
}
