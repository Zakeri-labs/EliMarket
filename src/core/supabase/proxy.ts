import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { publicEnv } from "@/config/env";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, cacheHeaders) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
          if (cacheHeaders) {
            Object.entries(cacheHeaders).forEach(([key, value]) => {
              supabaseResponse.headers.set(key, value);
            });
          }
        },
      },
    },
  );

  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub ?? null;

  const pathname = request.nextUrl.pathname;
  const isAdminRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
  const isRiderRoute = pathname.startsWith("/rider");
  const isRiderLogin = pathname === "/rider/login";
  const isLoginPage = pathname === "/login";

  if ((isAdminRoute || (isRiderRoute && !isRiderLogin)) && !userId) {
    const url = request.nextUrl.clone();
    url.pathname = isRiderRoute ? "/rider/login" : "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (userId && (isLoginPage || isRiderLogin || isAdminRoute || isRiderRoute)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    const role = profile?.role;

    if (isLoginPage) {
      if (role === "admin") {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
      if (role === "rider") {
        const url = request.nextUrl.clone();
        url.pathname = "/rider";
        return NextResponse.redirect(url);
      }
    }

    if (isRiderLogin && role === "rider") {
      const url = request.nextUrl.clone();
      url.pathname = "/rider";
      return NextResponse.redirect(url);
    }

    if (isAdminRoute && role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = role === "rider" ? "/rider" : "/login";
      url.searchParams.set("error", "forbidden");
      return NextResponse.redirect(url);
    }

    if (isRiderRoute && !isRiderLogin && role !== "rider") {
      const url = request.nextUrl.clone();
      url.pathname = role === "admin" ? "/dashboard" : "/rider/login";
      url.searchParams.set("error", "forbidden");
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
