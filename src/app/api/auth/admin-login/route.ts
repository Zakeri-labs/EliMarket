import { NextResponse } from "next/server";
import { createClient } from "@/core/supabase/server";
import { resolveAdminEmail } from "@/config/admin-auth";
import type { Profile } from "@/app/_types/database.types";
import { mapProfileToSession } from "@/core/supabase/auth-helpers";
import { serverT } from "@/i18n/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      username?: string;
      password?: string;
    };

    const username = body.username?.trim() ?? "";
    const password = body.password ?? "";
    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          error: await serverT("validation.required"),
        },
        { status: 400 },
      );
    }

    const email = resolveAdminEmail(username);
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error:
            error.message === "Invalid login credentials"
              ? await serverT("errors.invalidCredentials")
              : error.message,
          code: error.code,
          email,
        },
        { status: 401 },
      );
    }

    if (!data.user) {
      return NextResponse.json(
        {
          success: false,
          error: await serverT("errors.loginFailed"),
          email,
        },
        { status: 401 },
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        { success: false, error: profileError.message, email },
        { status: 500 },
      );
    }

    if ((profile as Profile | null)?.role !== "admin") {
      await supabase.auth.signOut();
      return NextResponse.json(
        {
          success: false,
          error: await serverT("errors.adminForbidden"),
          email,
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      data: mapProfileToSession(
        data.user.id,
        profile as Profile,
        data.user.phone,
        data.user.email,
      ),
    });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : await serverT("errors.loginFailed"),
      },
      { status: 500 },
    );
  }
}
