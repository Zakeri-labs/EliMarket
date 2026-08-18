import { NextResponse } from "next/server";
import { getSessionAction } from "@/app/_actions/auth-actions";

export async function GET() {
  const result = await getSessionAction();
  return NextResponse.json({
    isLoggedIn: Boolean(result.data),
    user: result.data,
  });
}
