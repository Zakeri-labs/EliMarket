import { NextResponse } from "next/server";
import { getCurrentProfile, getCurrentUser, mapProfileToSession } from "@/core/supabase/auth-helpers";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ isLoggedIn: false, user: null });
    }

    const profile = await getCurrentProfile();
    const session = mapProfileToSession(
      user.id,
      profile,
      user.phone,
      user.email,
    );

    return NextResponse.json({ isLoggedIn: true, user: session });
  } catch {
    return NextResponse.json({ isLoggedIn: false, user: null });
  }
}
