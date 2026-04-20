import { NextResponse } from "next/server";

import { isEmailAllowlisted } from "@/lib/auth/allowlist";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireAllowlistedApiUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      errorResponse: NextResponse.json(
        { error: "You must be signed in." },
        { status: 401 },
      ),
      user: null,
    };
  }

  if (!isEmailAllowlisted(user.email)) {
    return {
      errorResponse: NextResponse.json(
        { error: "You are not allowed to access this resource." },
        { status: 403 },
      ),
      user: null,
    };
  }

  return { errorResponse: null, user };
}
