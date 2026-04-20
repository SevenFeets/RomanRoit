import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

import { isEmailAllowlisted } from "@/lib/auth/allowlist";

const ADMIN_ROUTE_PREFIX = "/admin";

function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return { supabaseUrl, supabaseAnonKey };
}

export async function middleware(request) {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  const isAdminRoute = pathname.startsWith(ADMIN_ROUTE_PREFIX);
  const isLoginRoute = pathname === "/login";

  if (isAdminRoute) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }

    if (!isEmailAllowlisted(user.email)) {
      const deniedUrl = new URL("/login", request.url);
      deniedUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(deniedUrl);
    }
  }

  if (isLoginRoute && user && isEmailAllowlisted(user.email)) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
